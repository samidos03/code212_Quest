<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateXpRuleRequest;
use App\Models\XpRule;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Administration des baremes XP (montants et plafonds anti-abus).
 */
class XpRuleAdminController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageRules', $request->user());

        $rules = XpRule::query()
            ->when($request->filled('source_event'), static fn ($q) => $q->where('source_event', $request->string('source_event')))
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->orderBy('source_event')
            ->get();

        return ApiResponse::collection($rules->map(static fn (XpRule $rule): array => [
            'id' => $rule->id,
            'code' => $rule->code,
            'nom' => $rule->name,
            'description' => $rule->description,
            'evenement' => $rule->source_event,
            'voie' => $rule->track_code,
            'xp' => (int) $rule->xp_amount,
            'germes' => (int) $rule->germes_amount,
            'plafond_journalier' => $rule->daily_cap,
            'plafond_hebdomadaire' => $rule->weekly_cap,
            'version' => (int) $rule->version,
            'actif' => (bool) $rule->active,
        ])->all());
    }

    public function update(UpdateXpRuleRequest $request): JsonResponse
    {
        $this->authorize('manageRules', $request->user());

        $payload = $request->validated();

        /** @var XpRule|null $rule */
        $rule = isset($payload['id'])
            ? XpRule::query()->find($payload['id'])
            : (isset($payload['code']) ? XpRule::query()->where('code', $payload['code'])->first() : null);

        if ($rule === null && isset($payload['evenement'])) {
            $rule = XpRule::query()->where('source_event', $payload['evenement'])->first();
        }

        abort_if($rule === null, 404, 'Regle XP introuvable.');

        $mapping = [
            'nom' => 'name',
            'description' => 'description',
            'voie' => 'track_code',
            'xp' => 'xp_amount',
            'germes' => 'germes_amount',
            'plafond_journalier' => 'daily_cap',
            'plafond_hebdomadaire' => 'weekly_cap',
            'actif' => 'active',
        ];

        $changes = [];

        foreach ($mapping as $input => $column) {
            if (array_key_exists($input, $payload)) {
                $changes[$column] = $payload[$input];
            }
        }

        $rule->fill($changes);
        $rule->version = (int) $rule->version + 1;
        $rule->save();

        $this->audit->log(
            $request->user(),
            'admin.xp_rule_updated',
            'xp_rule',
            $rule->getKey(),
            $request->input('justification'),
            ['changements' => $changes, 'version' => $rule->version]
        );

        return ApiResponse::data([
            'id' => $rule->id,
            'code' => $rule->code,
            'nom' => $rule->name,
            'evenement' => $rule->source_event,
            'voie' => $rule->track_code,
            'xp' => (int) $rule->xp_amount,
            'germes' => (int) $rule->germes_amount,
            'plafond_journalier' => $rule->daily_cap,
            'plafond_hebdomadaire' => $rule->weekly_cap,
            'version' => (int) $rule->version,
            'actif' => (bool) $rule->active,
        ]);
    }
}
