<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LearningPathResource;
use App\Models\LearningPath;
use App\Services\ModuleProgressionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Parcours d'apprentissage.
 */
class LearningPathController extends Controller
{
    public function __construct(
        private readonly ModuleProgressionService $progression,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $paths = LearningPath::query()
            ->withCount('steps')
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->when(! $request->user()?->isTrainer(), static fn ($q) => $q->where('published', true))
            ->orderBy('position')
            ->get();

        return ApiResponse::collection(LearningPathResource::collection($paths));
    }

    public function show(Request $request, LearningPath $path): JsonResponse
    {
        $path->load('steps')->loadCount('steps');

        return ApiResponse::resource(new LearningPathResource($path));
    }

    /**
     * Inscription d'un apprenant à un parcours (idempotente).
     */
    public function enroll(Request $request, LearningPath $path): JsonResponse
    {
        $enrollment = $this->progression->enroll($request->user(), $path);

        return ApiResponse::data([
            'inscription_id' => $enrollment->getKey(),
            'parcours_id' => $path->getKey(),
            'statut' => $enrollment->status,
            'progression' => $this->progression->pathProgress($request->user(), $path),
        ], 201);
    }
}
