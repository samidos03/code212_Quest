<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\SubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use App\Services\AuditLogger;
use App\Services\XpLedgerService;
use App\Support\ApiResponse;
use App\Support\XpSource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Productions soumises a l'approbation des formateurs.
 */
class SubmissionController extends Controller
{
    public function __construct(
        private readonly XpLedgerService $ledger,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * File d'attente des productions a corriger (formateurs).
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Submission::class);

        $submissions = Submission::query()
            ->with('user')
            ->when($request->filled('statut'), static fn ($q) => $q->where('status', $request->string('statut')))
            ->latest('created_at')
            ->paginate((int) $request->integer('limite', 20));

        return ApiResponse::paginated($submissions, SubmissionResource::collection($submissions->getCollection()));
    }

    /**
     * Approbation (ou rejet) d'une production : attribution d'XP et de germes.
     */
    public function approve(Request $request, Submission $submission, ApproveSubmissionRequest $formRequest): JsonResponse
    {
        $this->authorize('approve', $submission);

        $decision = (string) ($formRequest->validated()['decision'] ?? SubmissionStatus::Approved->value);
        $status = SubmissionStatus::from($decision);
        $feedback = $formRequest->validated()['feedback'] ?? null;

        DB::transaction(function () use ($submission, $status, $feedback, $request): void {
            $submission->forceFill([
                'status' => $status->value,
                'reviewed_by' => $request->user()->getKey(),
                'reviewed_at' => now(),
                'review_note' => $feedback,
            ])->save();

            if ($status === SubmissionStatus::Approved && (int) $submission->xp_reward > 0) {
                $this->ledger->record(
                    $submission->user,
                    XpSource::SUBMISSION_APPROVED,
                    (string) $submission->getKey(),
                    (int) $submission->xp_reward,
                    $submission->user->track_code
                );
            }
        });

        $this->audit->log(
            $request->user(),
            'submission.approved',
            'submission',
            $submission->getKey(),
            $feedback,
            ['status' => $status->value, 'apprenant_id' => $submission->user_id]
        );

        return ApiResponse::resource(new SubmissionResource($submission->refresh()->load('user')));
    }
}
