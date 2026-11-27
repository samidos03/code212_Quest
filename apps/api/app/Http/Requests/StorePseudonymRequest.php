<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Choix du pseudonyme public (classement).
 */
class StorePseudonymRequest extends FormRequest
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
            'pseudonyme' => [
                'required',
                'string',
                'min:3',
                'max:64',
                'regex:/^[\p{L}\p{N} _\-\.]+$/u',
                Rule::unique('users', 'pseudonym')->ignore($this->user()?->getKey()),
            ],
            'anonymiser' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pseudonyme.regex' => 'Le pseudonyme ne peut contenir que des lettres, chiffres, espaces, points et tirets.',
            'pseudonyme.unique' => 'Ce pseudonyme est deja utilise.',
        ];
    }
}
