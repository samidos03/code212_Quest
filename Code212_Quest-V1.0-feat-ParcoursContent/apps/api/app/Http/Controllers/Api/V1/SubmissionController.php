<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\SubmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveSubmissionRequest;
use App\Http\Resources\SubmissionResource;
use App\Models\Submission;
use App\Services\SubmissionReviewService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Productions soumises a l'approbation des formateurs.
 */
class SubmissionController extends Controller
{
    public function __construct(
        private readonly SubmissionReviewService $reviewService,
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

        $rawDecision = (string) ($formRequest->validated()['decision'] ?? SubmissionStatus::Approved->value);
        $mappedDecision = match ($rawDecision) {
            'approve', 'validee', 'approuvee' => SubmissionStatus::Approved->value,
            'reject', 'rejetee' => SubmissionStatus::Rejected->value,
            'revoir', 'a_revoir' => SubmissionStatus::NeedsReview->value,
            default => $rawDecision,
        };
        $status = SubmissionStatus::from($mappedDecision);
        $feedback = $formRequest->validated()['feedback'] ?? null;

        $reviewed = $this->reviewService->review($submission, $request->user(), $status, $feedback);

        return ApiResponse::resource(new SubmissionResource($reviewed));
    }
}
