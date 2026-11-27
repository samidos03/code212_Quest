<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\EnrollmentStatus;
use App\Enums\SubmissionStatus;
use App\Exceptions\BusinessRuleException;
use App\Exceptions\IdempotencyConflictException;
use App\Models\Quest;
use App\Models\QuestEnrollment;
use App\Models\QuestStep;
use App\Models\QuestSubmission;
use App\Models\User;
use App\Support\IdempotencyKey;
use App\Support\XpSource;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Quetes : inscription, soumission idempotente des etapes, correction.
 */
final class QuestService
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly BadgeService $badges,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * Inscrit un apprenant a une quete (operation idempotente).
     */
    public function enroll(User $user, Quest $quest): QuestEnrollment
    {
        if (! $quest->isOpen()) {
            throw new BusinessRuleException('Cette quete n est pas ouverte aux inscriptions.', [], 422);
        }

        $enrollment = $this->findOrCreateEnrollment($user, $quest);

        if ($enrollment->wasRecentlyCreated) {
            $rule = $this->ledger->ruleFor(XpSource::QUEST_ENROLLED, $quest->track_code);

            if ($rule !== null && $rule->xp_amount > 0) {
                $this->ledger->record(
                    $user,
                    XpSource::QUEST_ENROLLED,
                    (string) $enrollment->getKey(),
                    $rule->xp_amount,
                    $quest->track_code
                );
            }

            $this->badges->evaluate($user, 'quest_enrolled', ['quest_code' => $quest->code]);
        }

        return $enrollment;
    }

    /**
     * Soumet une etape. La soumission est idempotente par
     * (user_id, quest_id, quest_step_id).
     *
     * @param array<string, mixed> $content
     */
    public function submitStep(
        User $user,
        Quest $quest,
        QuestStep $step,
        array $content,
        ?string $notes = null,
    ): QuestSubmission {
        $enrollment = QuestEnrollment::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $quest->getKey())
            ->first();

        if ($enrollment === null) {
            throw new BusinessRuleException('Vous devez vous inscrire a cette quete avant de soumettre une etape.', [], 403);
        }

        $idempotencyKey = IdempotencyKey::forStep($user, (int) $quest->getKey(), (int) $step->getKey());
        $fingerprint = IdempotencyKey::fingerprint($content);

        $existing = QuestSubmission::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $quest->getKey())
            ->where('quest_step_id', $step->getKey())
            ->first();

        if ($existing !== null) {
            return $this->assertSameContent($existing, $fingerprint);
        }

        try {
            /** @var QuestSubmission $submission */
            $submission = DB::transaction(function () use ($user, $quest, $step, $enrollment, $content, $notes, $idempotencyKey, $fingerprint): QuestSubmission {
                return QuestSubmission::create([
                    'user_id' => $user->getKey(),
                    'quest_id' => $quest->getKey(),
                    'quest_step_id' => $step->getKey(),
                    'quest_enrollment_id' => $enrollment->getKey(),
                    'content' => $content,
                    'notes' => $notes,
                    'status' => SubmissionStatus::Pending->value,
                    'idempotency_key' => $idempotencyKey,
                    'content_hash' => $fingerprint,
                    'submitted_at' => now(),
                ]);
            });
        } catch (QueryException $exception) {
            if (! $this->isUniqueViolation($exception)) {
                throw $exception;
            }

            $existing = QuestSubmission::query()
                ->where('user_id', $user->getKey())
                ->where('quest_id', $quest->getKey())
                ->where('quest_step_id', $step->getKey())
                ->first();

            if ($existing === null) {
                throw $exception;
            }

            return $this->assertSameContent($existing, $fingerprint);
        }

        $enrollment->forceFill(['last_activity_at' => now()])->save();

        if ($step->validation_mode === 'auto') {
            return $this->review($submission, $user, SubmissionStatus::Approved, 'Validation automatique.');
        }

        return $submission;
    }

    /**
     * Correction (approbation / rejet) d'une soumission d'etape.
     */
    public function review(
        QuestSubmission $submission,
        User $reviewer,
        SubmissionStatus $status,
        ?string $feedback = null,
    ): QuestSubmission {
        if ($submission->status->isClosed()) {
            throw new BusinessRuleException('Cette soumission a deja ete traitee.', [], 409);
        }

        if (! $reviewer->isTrainer()) {
            throw new BusinessRuleException('Seul un formateur peut valider une soumission.', [], 403);
        }

        $quest = $submission->quest;

        DB::transaction(function () use ($submission, $reviewer, $status, $feedback, $quest): void {
            $submission->forceFill([
                'status' => $status->value,
                'reviewed_at' => now(),
                'reviewed_by' => $reviewer->getKey(),
                'feedback' => $feedback,
            ])->save();

            if ($status === SubmissionStatus::Approved) {
                $rule = $this->ledger->ruleFor(XpSource::QUEST_STEP_APPROVED, $quest?->track_code);
                $amount = $rule?->xp_amount ?? $submission->step?->xp_reward ?? 0;

                if ($amount > 0) {
                    $submission->forceFill(['xp_awarded' => $amount])->save();

                    $this->ledger->record(
                        $submission->user,
                        XpSource::QUEST_STEP_APPROVED,
                        (string) $submission->getKey(),
                        $amount,
                        $quest?->track_code
                    );
                }
            }

            $this->refreshEnrollmentProgress($submission);
        });

        $this->audit->log(
            $reviewer,
            'quest.submission.reviewed',
            'quest_submission',
            $submission->getKey(),
            $feedback,
            ['status' => $status->value, 'quest_id' => $quest?->getKey()]
        );

        if ($status === SubmissionStatus::Approved) {
            $this->badges->evaluate($submission->user, 'quest_completed', [
                'quest_code' => $quest?->code,
                'track' => $quest?->track_code,
            ]);
        }

        return $submission->refresh();
    }

    /**
     * Avancement de l'apprenant sur une quete.
     *
     * @return array<string, mixed>
     */
    public function progressFor(User $user, Quest $quest): array
    {
        $total = (int) $quest->steps()->count();
        $approved = (int) QuestSubmission::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $quest->getKey())
            ->where('status', SubmissionStatus::Approved->value)
            ->count();

        return [
            'steps_total' => $total,
            'steps_approved' => $approved,
            'percent' => $total > 0 ? round(($approved / $total) * 100, 2) : 0.0,
        ];
    }

    private function findOrCreateEnrollment(User $user, Quest $quest): QuestEnrollment
    {
        $existing = QuestEnrollment::query()
            ->where('user_id', $user->getKey())
            ->where('quest_id', $quest->getKey())
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        try {
            return QuestEnrollment::create([
                'user_id' => $user->getKey(),
                'quest_id' => $quest->getKey(),
                'status' => EnrollmentStatus::InProgress->value,
                'progress' => 0,
                'enrolled_at' => now(),
            ]);
        } catch (QueryException $exception) {
            if (! $this->isUniqueViolation($exception)) {
                throw $exception;
            }

            $existing = QuestEnrollment::query()
                ->where('user_id', $user->getKey())
                ->where('quest_id', $quest->getKey())
                ->first();

            if ($existing === null) {
                throw $exception;
            }

            return $existing;
        }
    }

    private function assertSameContent(QuestSubmission $submission, string $fingerprint): QuestSubmission
    {
        if ($submission->content_hash !== $fingerprint) {
            throw new IdempotencyConflictException();
        }

        return $submission;
    }

    private function refreshEnrollmentProgress(QuestSubmission $submission): void
    {
        $enrollment = $submission->enrollment;

        if ($enrollment === null) {
            return;
        }

        $quest = $submission->quest;

        if ($quest === null) {
            return;
        }

        $total = (int) $quest->steps()->count();
        $approved = (int) QuestSubmission::query()
            ->where('quest_id', $quest->getKey())
            ->where('user_id', $submission->user_id)
            ->where('status', SubmissionStatus::Approved->value)
            ->count();

        $enrollment->forceFill(['progress' => $approved, 'last_activity_at' => now()])->save();

        if ($total > 0 && $approved >= $total && $enrollment->status !== EnrollmentStatus::Completed) {
            $enrollment->forceFill([
                'status' => EnrollmentStatus::Completed->value,
                'completed_at' => now(),
            ])->save();

            $rule = $this->ledger->ruleFor(XpSource::QUEST_COMPLETED, $quest->track_code);

            if ($rule !== null && $rule->xp_amount > 0) {
                $this->ledger->record(
                    $submission->user,
                    XpSource::QUEST_COMPLETED,
                    (string) $enrollment->getKey(),
                    $rule->xp_amount,
                    $quest->track_code
                );
            }
        }
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        return $exception->getCode() === '23505' || ($exception->errorInfo[0] ?? null) === '23505';
    }
}
