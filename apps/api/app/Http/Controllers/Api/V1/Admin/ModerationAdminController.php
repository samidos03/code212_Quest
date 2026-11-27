<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ForgeReportStatus;
use App\Enums\ForgeThreadStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResolveReportRequest;
use App\Http\Resources\AuditLogResource;
use App\Models\ForgeReport;
use App\Models\ForgeThread;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Moderation : signalements de la Forge et journal d'audit.
 */
class ModerationAdminController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function reports(Request $request): JsonResponse
    {
        $this->authorize('viewModeration', $request->user());

        $reports = ForgeReport::query()
            ->with(['reporter', 'thread', 'solution'])
            ->when($request->filled('statut'), static fn ($q) => $q->where('status', $request->string('statut')))
            ->latest('created_at')
            ->paginate((int) $request->integer('limite', 25));

        $items = $reports->getCollection()->map(static fn (ForgeReport $report): array => [
            'id' => $report->id,
            'fil_id' => $report->thread_id,
            'solution_id' => $report->solution_id,
            'raison' => $report->reason,
            'statut' => $report->status->value,
            'statut_libelle' => $report->status->label(),
            'signale_par' => $report->reporter?->leaderboardAlias(),
            'cree_le' => $report->created_at?->toIso8601String(),
        ])->values()->all();

        return ApiResponse::data($items, 200, [
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'per_page'     => $reports->perPage(),
                'total'        => $reports->total(),
                'last_page'    => $reports->lastPage(),
            ],
        ]);
    }

    /**
     * Resolution d'un signalement (masquage, verrouillage ou rejet).
     */
    public function resolve(Request $request, ForgeReport $report, ResolveReportRequest $formRequest): JsonResponse
    {
        $this->authorize('resolveReports', $request->user());

        $decision = ForgeReportStatus::from((string) $formRequest->validated()['decision']);
        $action = (string) ($formRequest->validated()['action'] ?? 'aucune');
        $note = $formRequest->validated()['note'] ?? null;

        $report->forceFill([
            'status' => $decision->value,
            'resolution_note' => $note,
            'resolved_by' => $request->user()->getKey(),
            'resolved_at' => now(),
        ])->save();

        if ($action === 'masquer' && $report->thread !== null) {
            $report->thread->forceFill(['status' => ForgeThreadStatus::Hidden->value])->save();
        }

        if ($action === 'verrouiller' && $report->thread !== null) {
            $report->thread->forceFill(['status' => ForgeThreadStatus::Locked->value])->save();
        }

        $this->audit->log(
            $request->user(),
            'admin.report_resolved',
            'forge_report',
            $report->getKey(),
            $note,
            ['decision' => $decision->value, 'action' => $action]
        );

        return ApiResponse::data([
            'id' => $report->id,
            'statut' => $report->status->value,
            'action' => $action,
        ]);
    }

    /**
     * Journal d'audit (administrateurs).
     */
    public function audit(Request $request): JsonResponse
    {
        $this->authorize('viewAudit', $request->user());

        $logs = \App\Models\AuditLog::query()
            ->when($request->filled('action'), static fn ($q) => $q->where('action', $request->string('action')))
            ->when($request->filled('acteur_id'), static fn ($q) => $q->where('actor_id', $request->integer('acteur_id')))
            ->latest('id')
            ->paginate((int) $request->integer('limite', 50));

        return ApiResponse::paginated($logs, AuditLogResource::collection($logs->getCollection()));
    }
}
