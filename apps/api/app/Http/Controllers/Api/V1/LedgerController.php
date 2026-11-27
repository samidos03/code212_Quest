<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\LedgerEntryResource;
use App\Models\XpLedgerEntry;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Journal XP de l'utilisateur (lecture seule : le journal est append-only).
 */
class LedgerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $entries = XpLedgerEntry::query()
            ->where('user_id', $request->user()->getKey())
            ->when($request->filled('evenement'), static fn ($q) => $q->where('source_event', $request->string('evenement')))
            ->when(
                $request->filled('voie'),
                static fn ($q) => $q->where('track_type', $request->string('voie')),
                static fn ($q) => $q->when(! $request->boolean('toutes_voies'), static fn ($q2) => $q2->whereNull('track_type'))
            )
            ->latest('id')
            ->paginate((int) $request->integer('limite', 50));

        return ApiResponse::paginated($entries, LedgerEntryResource::collection($entries->getCollection()));
    }
}
