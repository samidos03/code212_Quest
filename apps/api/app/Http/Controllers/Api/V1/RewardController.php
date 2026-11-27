<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseRewardRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\RewardResource;
use App\Models\Reward;
use App\Services\RewardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Boutique de recompenses payees en germes.
 */
class RewardController extends Controller
{
    public function __construct(private readonly RewardService $rewards)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $rewards = Reward::query()
            // Les recompenses inactives ne sont visibles que des administrateurs
            // qui demandent explicitement la liste complete.
            ->when(
                $request->boolean('tous') && $request->user()?->isAdmin() === true,
                static fn ($q) => $q,
                static fn ($q) => $q->where('active', true)
            )
            ->when($request->filled('categorie'), static fn ($q) => $q->where('category', $request->string('categorie')))
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        return ApiResponse::collection(RewardResource::collection($rewards), [
            'solde_germes' => (int) $request->user()->germes_balance,
        ]);
    }

    /**
     * Achat atomique : le solde et le stock sont decrementes en une transaction.
     */
    public function purchase(Request $request, Reward $reward, PurchaseRewardRequest $formRequest): JsonResponse
    {
        $this->authorize('purchase', $reward);

        $quantity = (int) ($formRequest->validated()['quantite'] ?? 1);
        $order = $this->rewards->purchase($request->user(), $reward, $quantity);

        return ApiResponse::resource(new OrderResource($order->load('items.reward')), 201);
    }
}
