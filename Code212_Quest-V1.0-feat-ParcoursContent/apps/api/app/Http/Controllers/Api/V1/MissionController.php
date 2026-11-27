<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MissionResource;
use App\Models\Mission;
use App\Services\MissionService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Missions : catalogue et revendication.
 */
class MissionController extends Controller
{
    public function __construct(private readonly MissionService $missions)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $missions = Mission::query()
            ->with(['claims' => static fn ($query) => $query->where('user_id', $user->getKey())])
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->when($request->filled('type'), static fn ($q) => $q->where('kind', $request->string('type')))
            ->where('active', true)
            ->orderBy('position')
            ->get();

        return ApiResponse::collection(MissionResource::collection($missions));
    }

    /**
     * Revendication d'une mission (une seule fois par mission et utilisateur).
     */
    public function claim(Request $request, Mission $mission): JsonResponse
    {
        $claim = $this->missions->claim($request->user(), $mission);

        return ApiResponse::data([
            'mission_id' => $mission->getKey(),
            'code' => $mission->code,
            'revendication_id' => $claim->getKey(),
            'xp' => (int) $claim->xp_awarded,
            'germes' => (int) $claim->germes_awarded,
            'solde_germes' => (int) $request->user()->refresh()->germes_balance,
        ], 201);
    }
}
