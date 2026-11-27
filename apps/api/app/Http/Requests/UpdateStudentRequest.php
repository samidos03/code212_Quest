<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Mise a jour d'une fiche apprenant (administration).
 */
class UpdateStudentRequest extends FormRequest
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
            'nom' => ['sometimes', 'string', 'max:120'],
            'filiere' => ['sometimes', 'nullable', 'string', 'max:120'],
            'promotion' => ['sometimes', 'nullable', 'string', 'max:32'],
            'matricule' => ['sometimes', 'nullable', 'string', 'max:32'],
            'voie' => ['sometimes', 'nullable', 'string', 'max:32'],
            'roles' => ['sometimes', 'array'],
            'roles.*' => ['string', Rule::in(UserRole::values())],
            'niveau' => ['sometimes', 'integer', 'min:1', 'max:10'],
            'germes' => ['sometimes', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
