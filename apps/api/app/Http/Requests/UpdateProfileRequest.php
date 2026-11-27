<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Mise a jour du profil personnel.
 */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
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
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'langue' => ['sometimes', 'string', 'in:fr,en,ar'],
        ];
    }
}
