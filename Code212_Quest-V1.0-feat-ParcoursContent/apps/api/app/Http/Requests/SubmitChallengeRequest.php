<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Depot d'une solution de code pour un challenge.
 */
class SubmitChallengeRequest extends FormRequest
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
            'depot' => ['required', 'url', 'max:255'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'termine' => ['nullable', 'boolean'],
            'coequipier_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
