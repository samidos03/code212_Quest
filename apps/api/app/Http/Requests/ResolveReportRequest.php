<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\ForgeReportStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Resolution d'un signalement (moderation).
 */
class ResolveReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isModerator() === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in([
                ForgeReportStatus::Resolved->value,
                ForgeReportStatus::Dismissed->value,
            ])],
            'note' => ['nullable', 'string', 'max:2000'],
            'action' => ['nullable', 'string', 'in:aucune,masquer,verrouiller,bannir'],
        ];
    }
}
