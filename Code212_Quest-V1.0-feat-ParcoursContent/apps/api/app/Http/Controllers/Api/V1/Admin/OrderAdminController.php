<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\RewardOrder;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Administration des commandes de la boutique.
 */
class OrderAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageOrders', $request->user());

        $orders = RewardOrder::query()
            ->with(['items.reward', 'user'])
            ->when($request->filled('statut'), static fn ($q) => $q->where('status', $request->string('statut')))
            ->when($request->filled('user_id'), static fn ($q) => $q->where('user_id', $request->integer('user_id')))
            ->latest('id')
            ->paginate((int) $request->integer('limite', 25));

        return ApiResponse::paginated($orders, OrderResource::collection($orders->getCollection()));
    }
}
