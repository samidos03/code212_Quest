<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Creation d'un fil de discussion dans la Forge.
 */
class StoreThreadRequest extends FormRequest
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
            'categorie_id' => ['required', 'integer', 'exists:forge_categories,id'],
            'titre' => ['required', 'string', 'min:8', 'max:240'],
            'contenu' => ['required', 'string', 'min:20', 'max:20000'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:40'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titre.min' => 'Le titre doit contenir au moins 8 caracteres.',
            'contenu.min' => 'Le contenu doit contenir au moins 20 caracteres.',
        ];
    }
}
