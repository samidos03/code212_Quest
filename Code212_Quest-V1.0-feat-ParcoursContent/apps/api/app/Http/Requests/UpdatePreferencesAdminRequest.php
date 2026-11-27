<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Mise a jour de la configuration applicative (administration).
 */
class UpdatePreferencesAdminRequest extends FormRequest
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
            'cle' => ['required', 'string', 'max:120'],
            'valeur' => ['required', 'array'],
            'justification' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
