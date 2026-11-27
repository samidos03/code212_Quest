<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\TrackCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Mise a jour d'un bareme XP (administration).
 */
class UpdateXpRuleRequest extends FormRequest
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
            'nom' => ['sometimes', 'string', 'max:160'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'voie' => ['sometimes', 'nullable', Rule::in(TrackCode::values())],
            'xp' => ['sometimes', 'integer', 'min:0', 'max:10000'],
            'germes' => ['sometimes', 'integer', 'min:0', 'max:10000'],
            'plafond_journalier' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100000'],
            'plafond_hebdomadaire' => ['sometimes', 'nullable', 'integer', 'min:0', 'max:100000'],
            'actif' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'plafond_journalier.min' => 'Le plafond journalier doit etre positif ou nul.',
        ];
    }
}
