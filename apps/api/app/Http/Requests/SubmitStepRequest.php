<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Soumission d'une etape de quete (idempotente).
 * Accepte 'content' ou 'contenu' pour assurer la compatibilité frontend.
 */
class SubmitStepRequest extends FormRequest
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
            'content' => ['nullable'],
            'contenu' => ['nullable'],
            'commentaire' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (! $this->filled('content') && ! $this->filled('contenu')) {
                $validator->errors()->add('content', 'Le contenu de la soumission est obligatoire.');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Le contenu de la soumission est obligatoire.',
            'contenu.required' => 'Le contenu de la soumission est obligatoire.',
        ];
    }
}

