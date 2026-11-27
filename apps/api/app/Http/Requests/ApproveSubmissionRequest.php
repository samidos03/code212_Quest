<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\SubmissionStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Approbation (ou rejet) d'une soumission par un formateur.
 */
class ApproveSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTrainer() === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'decision' => ['nullable', Rule::in([SubmissionStatus::Approved->value, SubmissionStatus::Rejected->value])],
            'feedback' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
