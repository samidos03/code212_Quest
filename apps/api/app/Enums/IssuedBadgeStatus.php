<?php

declare(strict_types=1);

namespace App\Enums;

enum IssuedBadgeStatus: string
{
    case Pending = 'en_attente';
    case Issued = 'delivre';
    case Revoked = 'revoque';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Issued => 'Delivre',
            self::Revoked => 'Revoque',
        };
    }
}
