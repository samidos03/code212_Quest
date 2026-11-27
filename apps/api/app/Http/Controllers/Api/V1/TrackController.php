<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrackResource;
use App\Models\ProgressionTrack;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

/**
 * Voies de progression (Codeur, Aidant, Batisseur, Explorateur).
 */
class TrackController extends Controller
{
    public function index(): JsonResponse
    {
        $tracks = ProgressionTrack::query()->orderBy('position')->orderBy('code')->get();

        return ApiResponse::collection(TrackResource::collection($tracks));
    }
}
