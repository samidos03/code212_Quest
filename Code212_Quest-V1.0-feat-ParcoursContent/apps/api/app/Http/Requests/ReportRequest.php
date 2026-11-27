<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Signalement d'un fil ou d'une solution de la Forge.
 */
class ReportRequest extends FormRequest
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
            'raison' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}
