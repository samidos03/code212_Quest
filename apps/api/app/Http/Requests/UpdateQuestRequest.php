<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\QuestDifficulty;
use App\Enums\QuestStatus;
use App\Enums\TrackCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Modification partielle d'une quete.
 */
class UpdateQuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'titre' => ['sometimes', 'string', 'max:200'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'voie' => ['sometimes', 'nullable', Rule::in(TrackCode::values())],
            'difficulte' => ['sometimes', Rule::in(array_column(QuestDifficulty::cases(), 'value'))],
            'statut' => ['sometimes', Rule::in(array_column(QuestStatus::cases(), 'value'))],
            'xp' => ['sometimes', 'integer', 'min:0', 'max:10000'],
            'germes' => ['sometimes', 'integer', 'min:0', 'max:10000'],
            'duree_minutes' => ['sometimes', 'integer', 'min:5', 'max:10080'],
            'debut_le' => ['sometimes', 'nullable', 'date'],
            'fin_le' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
