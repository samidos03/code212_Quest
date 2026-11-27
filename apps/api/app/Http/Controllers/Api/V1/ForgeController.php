<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\ForgeReportStatus;
use App\Enums\ForgeThreadStatus;
use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\AcceptSolutionRequest;
use App\Http\Requests\ReportRequest;
use App\Http\Requests\StoreReplyRequest;
use App\Http\Requests\StoreThreadRequest;
use App\Http\Resources\ForgeSolutionResource;
use App\Http\Resources\ForgeThreadResource;
use App\Models\ForgeBan;
use App\Models\ForgeCategory;
use App\Models\ForgeReport;
use App\Models\ForgeSolution;
use App\Models\ForgeThread;
use App\Services\AuditLogger;
use App\Services\ForgeRewardService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

/**
 * La Forge : espaces d'entraide entre apprenants.
 */
class ForgeController extends Controller
{
    public function __construct(
        private readonly ForgeRewardService $rewards,
        private readonly AuditLogger $audit,
    ) {
    }

    /**
     * Categories de la Forge.
     */
    public function categories(): JsonResponse
    {
        $categories = ForgeCategory::query()->orderBy('position')->orderBy('name')->get();

        return ApiResponse::collection(
            $categories->map(static fn (ForgeCategory $category): array => [
                'id' => $category->id,
                'code' => $category->code,
                'nom' => $category->name,
                'description' => $category->description,
                'couleur' => $category->color,
            ])->all()
        );
    }

    /**
     * Fils de discussion visibles.
     */
    public function threads(Request $request): JsonResponse
    {
        $threads = ForgeThread::query()
            ->with(['author', 'category'])
            ->withCount('solutions')
            ->when($request->filled('categorie_id'), static fn ($q) => $q->where('category_id', $request->integer('categorie_id')))
            ->when($request->filled('statut'), static fn ($q) => $q->where('status', $request->string('statut')), static fn ($q) => $q->whereIn('status', ['ouverte', 'resolue']))
            ->when($request->filled('recherche'), static fn ($q) => $q->where('title', 'ilike', '%'.$request->string('recherche').'%'))
            ->latest('created_at')
            ->paginate((int) $request->integer('limite', 20));

        return ApiResponse::paginated($threads, ForgeThreadResource::collection($threads->getCollection()));
    }

    /**
     * Creation d'un fil (hors categories bannies).
     */
    public function storeThread(StoreThreadRequest $request): JsonResponse
    {
        $category = ForgeCategory::query()->findOrFail((int) $request->input('categorie_id'));

        $this->assertNotBanned($request->user(), $category);

        $thread = ForgeThread::create([
            'category_id' => $category->getKey(),
            'author_id' => $request->user()->getKey(),
            'title' => (string) $request->input('titre'),
            'body' => (string) $request->input('contenu'),
            'status' => 'ouverte',
            'tags' => $request->validated()['tags'] ?? [],
        ]);

        // La base historique ne contient pas encore la table audit_logs.
        if (Schema::hasTable('audit_logs')) {
            $this->audit->log($request->user(), 'forge.thread_created', 'forge_thread', $thread->getKey(), null, [
                'categorie_id' => $category->getKey(),
            ]);
        } else {
            Log::info('forge.thread_created', ['thread_id' => $thread->getKey(), 'author_id' => $request->user()->getKey()]);
        }

        return ApiResponse::resource(new ForgeThreadResource($thread->load(['author', 'category'])), 201);
    }

    /**
     * Detail d'un fil et de ses solutions.
     */
    public function thread(Request $request, ForgeThread $thread): JsonResponse
    {
        $thread->load(['author', 'category', 'solutions.author'])->loadCount('solutions');

        return ApiResponse::resource(new ForgeThreadResource($thread));
    }

    /**
     * Reponse (= solution proposee) sur un fil.
     */
    public function storeReply(ForgeThread $thread, StoreReplyRequest $request): JsonResponse
    {
        $this->assertNotBanned($request->user(), $thread->category);

        $status = $thread->status instanceof ForgeThreadStatus ? $thread->status : ForgeThreadStatus::tryFrom((string) $thread->status);
        if (in_array($status, [ForgeThreadStatus::Locked, ForgeThreadStatus::Hidden], true)) {
            throw new BusinessRuleException('Ce fil est ferme aux nouvelles reponses.', [], 409);
        }

        $solution = ForgeSolution::create([
            'thread_id' => $thread->getKey(),
            'author_id' => $request->user()->getKey(),
            'body' => (string) $request->input('contenu'),
            'code_snippet' => $request->input('code'),
        ]);

        if (Schema::hasTable('audit_logs')) {
            $this->audit->log($request->user(), 'forge.reply_created', 'forge_solution', $solution->getKey(), null, [
                'thread_id' => $thread->getKey(),
            ]);
        }

        return ApiResponse::resource(new ForgeSolutionResource($solution->load('author')), 201);
    }

    /**
     * Validation d'une solution : recompense l'auteur (avec quotas anti-abus).
     */
    public function acceptSolution(ForgeSolution $solution, AcceptSolutionRequest $request): JsonResponse
    {
        $thread = $solution->thread;

        $solution = $this->rewards->accept($thread, $solution, $request->user(), $request->input('note'));

        return ApiResponse::resource(new ForgeSolutionResource($solution->load(['author', 'thread'])));
    }

    /**
     * Signalement d'un fil (ou d'une solution via `solution_id`).
     */
    public function report(ForgeThread $thread, ReportRequest $request): JsonResponse
    {
        $solutionId = $request->input('solution_id');

        // Un même membre ne signale qu'une fois un contenu tant que le signalement est ouvert.
        $alreadyOpen = ForgeReport::query()
            ->where('reporter_id', $request->user()->getKey())
            ->where('status', ForgeReportStatus::Open->value)
            ->when(
                $solutionId !== null,
                static fn ($q) => $q->where('solution_id', (int) $solutionId),
                static fn ($q) => $q->where('thread_id', $thread->getKey())->whereNull('solution_id'),
            )
            ->exists();

        if ($alreadyOpen) {
            throw new BusinessRuleException('Vous avez deja signale ce contenu ; la moderation l examine.', [], 409);
        }

        $report = ForgeReport::create([
            'thread_id' => $solutionId !== null ? null : $thread->getKey(),
            'solution_id' => $solutionId !== null ? (int) $solutionId : null,
            'reporter_id' => $request->user()->getKey(),
            'reason' => (string) $request->input('raison'),
            'status' => ForgeReportStatus::Open->value,
        ]);

        if (Schema::hasTable('audit_logs')) {
            $this->audit->log($request->user(), 'forge.reported', 'forge_report', $report->getKey(), null, [
                'thread_id' => $thread->getKey(), 'solution_id' => $solutionId,
            ]);
        } else {
            Log::info('forge.reported', ['report_id' => $report->getKey(), 'thread_id' => $thread->getKey()]);
        }

        return ApiResponse::data([
            'signalement_id' => $report->getKey(),
            'statut' => $report->status->value,
        ], 201);
    }

    /**
     * Un utilisateur banni sur une categorie ne peut plus y ecrire.
     */
    private function assertNotBanned(\App\Models\User $user, ForgeCategory $category): void
    {
        $banned = ForgeBan::query()
            ->where('user_id', $user->getKey())
            ->where('category_id', $category->getKey())
            ->whereNull('revoked_at')
            ->where(function ($query): void {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();

        if ($banned) {
            throw new BusinessRuleException(
                'Vous etes suspendu sur cette categorie de la Forge.',
                [],
                403
            );
        }
    }
}
