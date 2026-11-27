<?php

declare(strict_types=1);

namespace App\Enums;

enum ForgeThreadStatus: string
{
    case Open = 'ouverte';
    case Resolved = 'resolue';
    case Hidden = 'masquee';
    case Locked = 'verrouillee';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Ouverte',
            self::Resolved => 'Resolue',
            self::Hidden => 'Masquee',
            self::Locked => 'Verrouillee',
        };
    }

    public function isVisible(): bool
    {
        return $this === self::Open || $this === self::Resolved;
    }
}
