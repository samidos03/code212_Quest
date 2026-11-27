<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitChallengeRequest;
use App\Http\Resources\ChallengeResource;
use App\Models\Challenge;
use App\Services\ChallengeService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Challenges code : inscription et depot de solutions.
 */
class ChallengeController extends Controller
{
    public function __construct(private readonly ChallengeService $challenges)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $challenges = Challenge::query()
            ->withCount('entries')
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->when($request->filled('statut'), static fn ($q) => $q->where('status', $request->string('statut')))
            ->when(! $request->user()?->isTrainer(), static fn ($q) => $q->whereIn('status', ['ouverte', 'closee', 'a_venir']))
            ->orderBy('id')
            ->get();

        return ApiResponse::collection(ChallengeResource::collection($challenges));
    }

    /**
     * Inscription a un challenge (idempotente).
     */
    public function join(Request $request, Challenge $challenge): JsonResponse
    {
        $this->authorize('join', $challenge);

        $entry = $this->challenges->join(
            $request->user(),
            $challenge,
            $request->input('coequipier_id') !== null ? (int) $request->input('coequipier_id') : null
        );

        return ApiResponse::data([
            'challenge_id' => $challenge->getKey(),
            'inscription_id' => $entry->getKey(),
            'statut' => $entry->status,
        ], 201);
    }

    /**
     * Depot d'une solution de code.
     */
    public function submissions(Request $request, Challenge $challenge, SubmitChallengeRequest $formRequest): JsonResponse
    {
        $this->authorize('submit', $challenge);

        $submission = $this->challenges->submit(
            $request->user(),
            $challenge,
            $formRequest->validated()['depot'],
            $formRequest->validated()['notes'] ?? null,
            (bool) $formRequest->boolean('termine')
        );

        return ApiResponse::data([
            'id' => $submission->getKey(),
            'challenge_id' => $challenge->getKey(),
            'depot' => $submission->repository_url,
            'envoye_le' => $submission->submitted_at?->toIso8601String(),
        ], 201);
    }
}
