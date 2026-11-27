<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\QuestDifficulty;
use App\Enums\QuestStatus;
use App\Enums\TrackCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creation / modification d'une quete (administration).
 */
class StoreQuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTrainer() === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:80', 'alpha_dash', 'unique:quests,code'],
            'titre' => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'voie' => ['nullable', Rule::in(TrackCode::values())],
            'difficulte' => ['required', Rule::in(array_column(QuestDifficulty::cases(), 'value'))],
            'statut' => ['nullable', Rule::in(array_column(QuestStatus::cases(), 'value'))],
            'xp' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'germes' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'duree_minutes' => ['nullable', 'integer', 'min:5', 'max:10080'],
            'debut_le' => ['nullable', 'date'],
            'fin_le' => ['nullable', 'date', 'after:debut_le'],
            'etapes' => ['required', 'array', 'min:1', 'max:30'],
            'etapes.*.titre' => ['required', 'string', 'max:200'],
            'etapes.*.description' => ['nullable', 'string', 'max:5000'],
            'etapes.*.type' => ['required', 'string', 'in:qcm,code,projet,preuve,atelier'],
            'etapes.*.validation' => ['nullable', 'string', 'in:auto,manuelle'],
            'etapes.*.xp' => ['nullable', 'integer', 'min:0', 'max:10000'],
            'etapes.*.duree_minutes' => ['nullable', 'integer', 'min:5', 'max:10080'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.unique' => 'Ce code de quete est deja utilise.',
            'etapes.required' => 'Une quete doit comporter au moins une etape.',
        ];
    }
}
