<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LearningPathResource;
use App\Models\LearningPath;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Parcours d'apprentissage.
 */
class LearningPathController extends Controller
{
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
}
