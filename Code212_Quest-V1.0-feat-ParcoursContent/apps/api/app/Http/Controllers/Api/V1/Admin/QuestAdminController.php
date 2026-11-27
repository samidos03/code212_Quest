<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestRequest;
use App\Http\Requests\UpdateQuestRequest;
use App\Http\Resources\QuestResource;
use App\Models\Quest;
use App\Models\QuestStep;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Administration des quetes.
 */
class QuestAdminController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageQuests', $request->user());

        $quests = Quest::query()
            ->withCount(['steps', 'enrollments'])
            ->when($request->filled('statut'), static fn ($q) => $q->where('status', $request->string('statut')))
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        return ApiResponse::collection(QuestResource::collection($quests));
    }

    public function store(StoreQuestRequest $request): JsonResponse
    {
        $this->authorize('manageQuests', $request->user());

        $payload = $request->validated();

        $quest = Quest::create([
            'code' => $payload['code'],
            'title' => $payload['titre'],
            'description' => $payload['description'] ?? null,
            'track_code' => $payload['voie'] ?? null,
            'difficulty' => $payload['difficulte'],
            'status' => $payload['statut'] ?? 'brouillon',
            'xp_reward' => (int) ($payload['xp'] ?? 0),
            'germes_reward' => (int) ($payload['germes'] ?? 0),
            'estimated_minutes' => (int) ($payload['duree_minutes'] ?? 60),
            'starts_at' => $payload['debut_le'] ?? null,
            'ends_at' => $payload['fin_le'] ?? null,
            'created_by' => $request->user()->getKey(),
        ]);

        foreach ($payload['etapes'] as $index => $step) {
            QuestStep::create([
                'quest_id' => $quest->getKey(),
                'title' => $step['titre'],
                'description' => $step['description'] ?? null,
                'type' => $step['type'],
                'validation_mode' => $step['validation'] ?? 'manuelle',
                'order_index' => $index + 1,
                'xp_reward' => (int) ($step['xp'] ?? 0),
                'duration_minutes' => (int) ($step['duree_minutes'] ?? 30),
            ]);
        }

        $this->audit->log($request->user(), 'admin.quest_created', 'quest', $quest->getKey(), null, [
            'code' => $quest->code,
        ]);

        return ApiResponse::resource(new QuestResource($quest->load('steps')), 201);
    }

    public function update(UpdateQuestRequest $request, Quest $quest): JsonResponse
    {
        $payload = $request->validated();

        $mapping = [
            'titre' => 'title',
            'description' => 'description',
            'voie' => 'track_code',
            'difficulte' => 'difficulty',
            'statut' => 'status',
            'xp' => 'xp_reward',
            'germes' => 'germes_reward',
            'duree_minutes' => 'estimated_minutes',
            'debut_le' => 'starts_at',
            'fin_le' => 'ends_at',
        ];

        $changes = [];

        foreach ($mapping as $input => $column) {
            if (array_key_exists($input, $payload)) {
                $changes[$column] = $payload[$input];
            }
        }

        $quest->fill($changes)->save();

        $this->audit->log(
            $request->user(),
            'admin.quest_updated',
            'quest',
            $quest->getKey(),
            $request->input('justification'),
            ['changements' => $changes]
        );

        return ApiResponse::resource(new QuestResource($quest->load('steps')->loadCount(['steps', 'enrollments'])));
    }
}
