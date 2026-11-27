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
            'decision' => ['nullable', 'string', Rule::in([
                'approve',
                'reject',
                'validee',
                'rejetee',
                'approuvee',
                'a_revoir',
                'revoir',
                SubmissionStatus::Approved->value,
                SubmissionStatus::Rejected->value,
                SubmissionStatus::NeedsReview->value,
            ])],
            // Un renvoi ou un rejet doit expliquer à l'apprenant ce qu'il doit reprendre.
            'feedback' => [
                Rule::requiredIf(fn (): bool => in_array($this->input('decision'), self::DECISIONS_WITH_FEEDBACK, true)),
                'nullable',
                'string',
                'max:5000',
            ],
        ];
    }

    /** @var list<string> */
    private const DECISIONS_WITH_FEEDBACK = ['reject', 'rejetee', 'a_revoir', 'revoir'];

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'feedback.required' => 'Un commentaire est obligatoire pour renvoyer ou rejeter un livrable.',
        ];
    }
}
