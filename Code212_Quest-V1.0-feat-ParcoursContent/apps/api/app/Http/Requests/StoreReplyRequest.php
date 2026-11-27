<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Reponse ou solution dans la Forge.
 */
class StoreReplyRequest extends FormRequest
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
            'contenu' => ['required', 'string', 'min:20', 'max:20000'],
            'code' => ['nullable', 'string', 'max:20000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'contenu.min' => 'Votre reponse doit contenir au moins 20 caracteres.',
        ];
    }
}
