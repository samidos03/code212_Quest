<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Point d'entree de l'espace d'administration (statistiques de pilotage).
 */
class AdminController extends Controller
{
    public function __construct(private readonly AnalyticsService $analytics)
    {
    }

    public function analytics(): JsonResponse
    {
        $this->authorize('viewAnalytics', \App\Models\User::class);

        return ApiResponse::data($this->analytics->overview());
    }
}
