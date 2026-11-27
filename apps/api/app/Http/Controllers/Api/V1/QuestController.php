<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestRequest;
use App\Http\Requests\SubmitStepRequest;
use App\Http\Resources\QuestResource;
use App\Http\Resources\QuestSubmissionResource;
use App\Models\Quest;
use App\Models\QuestStep;
use App\Services\QuestService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Quetes : catalogue, creation, inscription et soumission d'etapes.
 */
class QuestController extends Controller
{
    public function __construct(private readonly QuestService $quests)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('limite', 20);

        $query = Quest::query()
            ->withCount(['steps', 'enrollments'])
            ->when(
                $request->user()?->isTrainer() !== true,
                static fn ($q) => $q->published(),
                static fn ($q) => $q->when($request->filled('statut'), static fn ($q2) => $q2->where('status', $request->string('statut')))
            )
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->when($request->filled('difficulte'), static fn ($q) => $q->where('difficulty', $request->string('difficulte')))
            ->when($request->filled('recherche'), static fn ($q) => $q->where('title', 'ilike', '%'.$request->string('recherche').'%'))
            ->orderBy('position')
            ->orderBy('id');

        $quests = $query->paginate(min(max(1, $perPage), 100));

        return ApiResponse::paginated($quests, QuestResource::collection($quests->getCollection()));
    }

    /**
     * Creation d'une quete (formateur ou administrateur).
     */
    public function store(StoreQuestRequest $request): JsonResponse
    {
        $this->authorize('create', Quest::class);

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

        return ApiResponse::resource(
            new QuestResource($quest->load('steps')),
            201
        );
    }

    public function show(Request $request, Quest $quest): JsonResponse
    {
        $this->authorize('view', $quest);

        $quest->load(['steps', 'track'])->loadCount(['steps', 'enrollments']);

        $resource = (new QuestResource($quest))->resolve($request);
        $resource['progression'] = $this->quests->progressFor($request->user(), $quest);

        return ApiResponse::data($resource);
    }

    /**
     * Inscription a une quete (idempotente).
     */
    public function enroll(Request $request, Quest $quest): JsonResponse
    {
        $this->authorize('enroll', $quest);

        $enrollment = $this->quests->enroll($request->user(), $quest);

        return ApiResponse::data([
            'inscription_id' => $enrollment->getKey(),
            'quete_id' => $quest->getKey(),
            'statut' => $enrollment->status->value,
            'progression' => $this->quests->progressFor($request->user(), $quest),
        ], 201);
    }

    /**
     * Soumission d'une etape (idempotente par utilisateur / quete / etape).
     */
    public function submitStep(Request $request, Quest $quest, int $step, SubmitStepRequest $formRequest): JsonResponse
    {
        $this->authorize('submitStep', $quest);

        /** @var QuestStep $questStep */
        $questStep = QuestStep::query()
            ->where('quest_id', $quest->getKey())
            ->whereKey($step)
            ->firstOrFail();

        $submission = $this->quests->submitStep(
            $request->user(),
            $quest,
            $questStep,
            (array) $formRequest->validated()['contenu'],
            $formRequest->validated()['commentaire'] ?? null
        );

        return ApiResponse::resource(new QuestSubmissionResource($submission), 201);
    }
}
