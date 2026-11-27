<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Quest;
use App\Models\QuestStep;
use App\Models\QuestSubmission;
use App\Services\ModuleProgressionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\PathStep
 */
class ModuleDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ModuleProgressionService $progression */
        $progression = app(ModuleProgressionService::class);
        $user = $request->user();

        $statut = $user ? $progression->moduleStatus($user, $this->resource) : 'non_inscrit';
        $summary = $user ? $progression->exerciseSummary($user, $this->resource) : ['total' => 0, 'passes' => 0, 'termines' => false];

        $quest = $this->quest ?? ($this->ref_id ? Quest::where('code', $this->ref_id)->orWhere('id', is_numeric($this->ref_id) ? (int)$this->ref_id : 0)->first() : null);
        $questData = null;

        if ($quest !== null) {
            $questStep = $quest->steps()->first();
            $latestSubmission = null;

            if ($user !== null) {
                $latestSubmission = QuestSubmission::query()
                    ->where('user_id', $user->getKey())
                    ->where('quest_id', $quest->getKey())
                    ->latest('attempt_number')
                    ->first();
            }

            $questData = [
                'id' => $quest->getKey(),
                'code' => $quest->code,
                'titre' => $quest->title,
                'description' => $quest->description,
                'etape_id' => $questStep?->getKey(),
                'xp' => (int) $quest->xp_reward,
                'germes' => (int) $quest->germes_reward,
                'debloquee' => ! in_array($statut, ['non_inscrit', 'verrouille'], true),
                'soumission' => $latestSubmission ? [
                    'id' => $latestSubmission->getKey(),
                    'statut' => $latestSubmission->status instanceof \App\Enums\SubmissionStatus ? $latestSubmission->status->value : (string) $latestSubmission->status,
                    'tentative' => (int) $latestSubmission->attempt_number,
                    'commentaire_formateur' => $latestSubmission->feedback,
                    'date_soumission' => $latestSubmission->submitted_at?->toIso8601String(),
                ] : null,
            ];
        }

        return [
            'id' => $this->id,
            'parcours_id' => $this->learning_path_id,
            'titre' => $this->title,
            'description' => $this->description,
            'ordre' => (int) $this->order_index,
            'statut' => $statut,
            'exercices_total' => $summary['total'],
            'exercices_passes' => $summary['passes'],
            'exercices_termines' => $summary['termines'],
            'lecons' => ModuleLessonResource::collection($this->whenLoaded('lessons')),
            'quete_finale' => $questData,
        ];
    }
}
