<?php

declare(strict_types=1);

namespace App\Enums;

enum SubmissionStatus: string
{
    case Pending = 'en_attente';
    case Approved = 'approuvee';
    case Rejected = 'rejetee';
    case NeedsReview = 'a_revoir';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Approved => 'Approuvee',
            self::Rejected => 'Rejetee',
            self::NeedsReview => 'A revoir',
        };
    }

    public function isClosed(): bool
    {
        return $this === self::Approved || $this === self::Rejected;
    }
}
