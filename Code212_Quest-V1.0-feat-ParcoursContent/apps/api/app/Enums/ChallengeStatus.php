<?php

declare(strict_types=1);

namespace App\Enums;

enum ChallengeStatus: string
{
    case Upcoming = 'a_venir';
    case Open = 'ouverte';
    case Closed = 'closee';
    case Archived = 'archivee';

    public function label(): string
    {
        return match ($this) {
            self::Upcoming => 'A venir',
            self::Open => 'Ouverte',
            self::Closed => 'Closee',
            self::Archived => 'Archivee',
        };
    }

    public function acceptsEntries(): bool
    {
        return $this === self::Open;
    }
}
