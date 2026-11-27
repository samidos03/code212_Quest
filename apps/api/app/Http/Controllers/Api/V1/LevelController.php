<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LevelResource;
use App\Services\Codep212ConfigService;
use App\Services\LevelService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Niveaux globaux et progression de l'utilisateur.
 */
class LevelController extends Controller
{
    public function __construct(
        private readonly Codep212ConfigService $config,
        private readonly LevelService $levels,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $levels = $this->config->levels();

        return ApiResponse::collection(LevelResource::collection($levels), [
            'ma_progression' => $this->levels->progress($request->user()),
        ]);
    }
}
