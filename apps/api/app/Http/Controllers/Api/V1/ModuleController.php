<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitExerciseAttemptRequest;
use App\Http\Resources\ModuleDetailResource;
use App\Models\LearningPath;
use App\Models\LessonExercise;
use App\Models\PathStep;
use App\Services\ExerciseValidationService;
use App\Services\ModuleProgressionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function __construct(
        private readonly ExerciseValidationService $exercises,
        private readonly ModuleProgressionService $progression,
    ) {
    }

    /**
     * Détail d'un module avec leçons, exercices et statut de progression.
     */
    public function show(Request $request, LearningPath $path, PathStep $step): JsonResponse
    {
        if ($step->learning_path_id !== $path->getKey()) {
            abort(404, 'Ce module n appartient pas au parcours spécifié.');
        }

        $this->progression->assertCanAccessModule($request->user(), $step);
        $step->load(['lessons.exercises', 'quest.steps']);

        return ApiResponse::resource(new ModuleDetailResource($step));
    }

    /**
     * Soumission et validation serveur d'un exercice.
     */
    public function submitExercise(SubmitExerciseAttemptRequest $request, LessonExercise $exercise): JsonResponse
    {
        $result = $this->exercises->validateAndRecord(
            $request->user(),
            $exercise,
            (string) $request->validated('reponse'),
            $request->validated('question_id')
        );

        return ApiResponse::data($result, 201);
    }
}
