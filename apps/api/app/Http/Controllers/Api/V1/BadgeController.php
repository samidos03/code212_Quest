<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BadgeResource;
use App\Http\Resources\IssuedBadgeResource;
use App\Models\BadgeRule;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Catalogue des badges et portefeuille de l'utilisateur.
 */
class BadgeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $badges = BadgeRule::query()
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->when($request->filled('rarete'), static fn ($q) => $q->where('rarity', $request->string('rarete')))
            ->orderBy('code')
            ->get();

        $issued = $request->user()->issuedBadges()
            ->with('rule')
            ->where('status', 'issued')
            ->latest('issued_at')
            ->get();

        return ApiResponse::data([
            'catalogue' => BadgeResource::collection($badges)->resolve($request),
            'mes_badges' => IssuedBadgeResource::collection($issued)->resolve($request),
            'total' => $issued->count(),
        ]);
    }

    public function show(Request $request, string $code): JsonResponse
    {
        $badge = BadgeRule::query()
            ->with('issuedBadges')
            ->where('code', $code)
            ->firstOrFail();

        $owned = $request->user()->issuedBadges()
            ->where('badge_code', $badge->code)
            ->where('status', 'issued')
            ->first();

        return ApiResponse::data([
            'badge' => (new BadgeResource($badge))->resolve($request),
            'obtenu' => $owned !== null,
            'preuve' => $owned?->credential_jsonld,
            'obtenu_le' => $owned?->issued_at?->toIso8601String(),
        ]);
    }
}
