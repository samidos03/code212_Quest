<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\RewardOrder;
use App\Services\RewardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Commandes de la boutique : consultation par l'acheteur et decision admin.
 */
class OrderController extends Controller
{
    public function __construct(private readonly RewardService $rewards)
    {
    }

    /**
     * Commandes de l'utilisateur connecte.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = RewardOrder::query()
            ->where('user_id', $request->user()->getKey())
            ->with('items.reward')
            ->latest('id')
            ->paginate((int) $request->integer('limite', 20));

        return ApiResponse::paginated($orders, OrderResource::collection($orders->getCollection()));
    }

    /**
     * Approbation d'une commande (administration).
     */
    public function approve(Request $request, RewardOrder $order): JsonResponse
    {
        $this->authorize('manageOrders', $request->user());

        $approved = $this->rewards->approve($order, $request->user(), $request->input('note'));

        return ApiResponse::resource(new OrderResource($approved->load('items.reward')));
    }

    /**
     * Rejet d'une commande : remboursement des germes (ecriture compensatoire).
     */
    public function reject(Request $request, RewardOrder $order): JsonResponse
    {
        $this->authorize('manageOrders', $request->user());

        $rejected = $this->rewards->reject($order, $request->user(), $request->input('note'));

        return ApiResponse::resource(new OrderResource($rejected->load('items.reward')));
    }
}
