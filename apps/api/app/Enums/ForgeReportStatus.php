<?php

declare(strict_types=1);

namespace App\Enums;

enum ForgeReportStatus: string
{
    case Open = 'ouverte';
    case Resolved = 'resolue';
    case Dismissed = 'rejetee';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Ouverte',
            self::Resolved => 'Resolue',
            self::Dismissed => 'Rejetee',
        };
    }
}
