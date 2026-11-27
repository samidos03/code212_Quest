<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\SubmissionStatus;
use App\Exceptions\BusinessRuleException;
use App\Models\LearningPathEnrollment;
use App\Models\PathStep;
use App\Models\Quest;
use App\Models\QuestEnrollment;
use App\Models\QuestSubmission;
use App\Models\Submission;
use App\Models\User;
use App\Support\XpSource;
use Illuminate\Support\Facades\DB;

class SubmissionReviewService
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly BadgeService $badges,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * Correction transactionnelle et atomique d'une soumission formateur.
     */
    public function review(
        Submission $submission,
        User $reviewer,
        SubmissionStatus $status,
        ?string $feedback = null,
    ): Submission {
        if (! $reviewer->isTrainer()) {
            throw new BusinessRuleException('Seul un formateur peut évaluer une production.', [], 403);
        }

        return DB::transaction(function () use ($submission, $reviewer, $status, $feedback): Submission {
            /** @var Submission $lockedSubmission */
            $lockedSubmission = Submission::query()->lockForUpdate()->findOrFail($submission->getKey());

            $previousStatus = $lockedSubmission->status instanceof SubmissionStatus
                ? $lockedSubmission->status
                : SubmissionStatus::tryFrom((string) $lockedSubmission->status);

            if ($previousStatus !== null && $previousStatus->isClosed()) {
                throw new BusinessRuleException('Cette production a déjà été traitée.', [], 409);
            }

            $lockedSubmission->forceFill([
                'status' => $status->value,
                'reviewed_by' => $reviewer->getKey(),
                'reviewed_at' => now(),
                'review_note' => $feedback,
            ])->save();

            // Synchroniser atomiquement la QuestSubmission correspondante
            /** @var QuestSubmission|null $questSub */
            $questSub = null;
            if ($lockedSubmission->quest_id && $lockedSubmission->quest_step_id) {
                if ($lockedSubmission->quest_submission_id === null) {
                    throw new BusinessRuleException(
                        'Cette production n’est associée à aucune tentative de quête vérifiable.',
                        [],
                        409
                    );
                }

                $questSub = QuestSubmission::query()
                    ->lockForUpdate()
                    ->whereKey($lockedSubmission->quest_submission_id)
                    ->where('user_id', $lockedSubmission->user_id)
                    ->where('quest_id', $lockedSubmission->quest_id)
                    ->where('quest_step_id', $lockedSubmission->quest_step_id)
                    ->first();

                if ($questSub === null || $questSub->status !== SubmissionStatus::Pending) {
                    throw new BusinessRuleException(
                        'La tentative de quête associée n’est plus en attente de correction.',
                        [],
                        409
                    );
                }

                $questSub->forceFill([
                    'status' => $status->value,
                    'reviewed_by' => $reviewer->getKey(),
                    'reviewed_at' => now(),
                    'feedback' => $feedback,
                    'xp_awarded' => $status === SubmissionStatus::Approved ? (int) $lockedSubmission->xp_reward : 0,
                ])->save();
            }

            // En cas d'approbation : attribution idempotente XP et Germes
            if ($status === SubmissionStatus::Approved) {
                $apprenant = $lockedSubmission->user;
                $xpAmount = (int) $lockedSubmission->xp_reward;
                $germesAmount = (int) $lockedSubmission->germes_reward;

                if ($xpAmount > 0 && $apprenant !== null) {
                    $this->ledger->record(
                        $apprenant,
                        XpSource::SUBMISSION_APPROVED,
                        (string) $lockedSubmission->getKey(),
                        $xpAmount,
                        $apprenant->track_code
                    );
                }

                if ($germesAmount > 0 && $apprenant !== null) {
                    $affected = DB::table('germes_ledger')->insertOrIgnore([
                        'user_id' => $apprenant->getKey(),
                        'source_event' => XpSource::SUBMISSION_APPROVED,
                        'reference_id' => (string) $lockedSubmission->getKey(),
                        'germes_delta' => $germesAmount,
                        'created_at' => now(),
                    ]);

                    if ($affected > 0) {
                        $apprenant->increment('germes_balance', $germesAmount);
                    }
                }

                // Mise à jour de l'avancement de la quête et déblocage
                if ($lockedSubmission->quest_id && $apprenant !== null) {
                    $this->handleQuestAndModuleCompletion($lockedSubmission->quest_id, $apprenant);
                }
            }

            $this->audit->log(
                $reviewer,
                'submission.reviewed',
                'submission',
                $lockedSubmission->getKey(),
                $feedback,
                [
                    'status' => $status->value,
                    'apprenant_id' => $lockedSubmission->user_id,
                    'quest_id' => $lockedSubmission->quest_id,
                ]
            );

            return $lockedSubmission->refresh()->load('user');
        });
    }

    private function handleQuestAndModuleCompletion(int $questId, User $user): void
    {
        $quest = Quest::find($questId);
        if ($quest === null) {
            return;
        }

        $enrollment = QuestEnrollment::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $questId)
            ->first();

        if ($enrollment === null) {
            return;
        }

        $totalSteps = (int) $quest->steps()->count();
        $approvedSteps = (int) QuestSubmission::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $questId)
            ->where('status', SubmissionStatus::Approved->value)
            ->distinct('quest_step_id')
            ->count('quest_step_id');

        $enrollment->forceFill([
            'progress' => $approvedSteps,
            'last_activity_at' => now(),
        ])->save();

        if ($totalSteps > 0 && $approvedSteps >= $totalSteps && $enrollment->status !== EnrollmentStatus::Completed) {
            $enrollment->forceFill([
                'status' => EnrollmentStatus::Completed->value,
                'completed_at' => now(),
            ])->save();

            $rule = $this->ledger->ruleFor(XpSource::QUEST_COMPLETED, $quest->track_code);
            if ($rule !== null && $rule->xp_amount > 0) {
                $this->ledger->record(
                    $user,
                    XpSource::QUEST_COMPLETED,
                    (string) $enrollment->getKey(),
                    $rule->xp_amount,
                    $quest->track_code
                );
            }

            $this->badges->evaluate($user, 'quest_completed', [
                'quest_code' => $quest->code,
                'track' => $quest->track_code,
            ]);

            // Vérifier si cette quête termine un module de parcours d'apprentissage
            $this->checkLearningPathCompletion($quest, $user);
        }
    }

    private function checkLearningPathCompletion(Quest $quest, User $user): void
    {
        $step = PathStep::query()
            ->where('quest_id', $quest->getKey())
            ->orWhere(function ($q) use ($quest): void {
                $q->where('ref_type', 'quete')
                    ->where(function ($sub) use ($quest): void {
                        $sub->where('ref_id', (string) $quest->getKey())
                            ->orWhere('ref_id', $quest->code);
                    });
            })
            ->first();

        if ($step === null) {
            return;
        }

        $path = $step->learningPath;
        if ($path === null) {
            return;
        }

        $pathEnrollment = LearningPathEnrollment::query()
            ->where('user_id', $user->getKey())
            ->where('learning_path_id', $path->getKey())
            ->first();

        if ($pathEnrollment === null || $pathEnrollment->isCompleted()) {
            return;
        }

        // Vérifier si tous les modules du parcours sont validés
        $allSteps = $path->steps()->get();
        $allDone = true;

        foreach ($allSteps as $s) {
            $sQuest = $s->quest ?? ($s->ref_id ? Quest::where('code', $s->ref_id)->orWhere('id', is_numeric($s->ref_id) ? (int)$s->ref_id : 0)->first() : null);
            if ($sQuest !== null) {
                $hasApproved = QuestSubmission::query()
                    ->where('user_id', $user->getKey())
                    ->where('quest_id', $sQuest->getKey())
                    ->where('status', SubmissionStatus::Approved->value)
                    ->exists();

                if (! $hasApproved) {
                    $allDone = false;
                    break;
                }
            }
        }

        if ($allDone) {
            $pathEnrollment->forceFill([
                'status' => 'termine',
                'completed_at' => now(),
            ])->save();

            // Bonus de parcours si configuré
            if ($path->xp_bonus > 0) {
                $this->ledger->record(
                    $user,
                    XpSource::QUEST_COMPLETED,
                    'path:' . $path->getKey(),
                    (int) $path->xp_bonus,
                    $path->track_code
                );
            }
        }
    }
}
