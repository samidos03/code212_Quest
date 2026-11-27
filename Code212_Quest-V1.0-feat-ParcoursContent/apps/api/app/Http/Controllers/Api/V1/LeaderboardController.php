<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaderboardEntryResource;
use App\Services\LeaderboardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Classement : uniquement les utilisateurs ayant accepte le mode competition.
 */
class LeaderboardController extends Controller
{
    public function __construct(private readonly LeaderboardService $leaderboard)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $trackCode = $request->filled('voie') ? (string) $request->string('voie') : null;
        $entries = $this->leaderboard->ranking($trackCode, $request->integer('limite'));

        return ApiResponse::collection(
            LeaderboardEntryResource::collection($entries),
            [
                'voie' => $trackCode,
                'ma_position' => $this->leaderboard->positionOf($request->user(), $trackCode),
                'consentement' => [
                    'mode_competition' => (bool) $request->user()->competition_opt_in,
                    'policy' => 'Les participants n affine que leur pseudonyme ; aucune donnee personnelle n est exposee.',
                ],
            ]
        );
    }
}
