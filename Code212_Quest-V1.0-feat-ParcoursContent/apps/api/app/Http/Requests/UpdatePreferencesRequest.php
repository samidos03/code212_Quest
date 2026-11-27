<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Preferences de l'utilisateur (consentement, notifications, affichage).
 */
class UpdatePreferencesRequest extends FormRequest
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
            'mode_competition' => ['required', 'boolean'],
            'notifications_email' => ['nullable', 'boolean'],
            'notifications_forge' => ['nullable', 'boolean'],
            'theme' => ['nullable', 'string', 'in:magenta,cyan,violet,systeme'],
        ];
    }
}
