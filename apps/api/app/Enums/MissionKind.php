<?php

declare(strict_types=1);

namespace App\Enums;

enum MissionKind: string
{
    case Daily = 'quotidienne';
    case Weekly = 'hebdomadaire';
    case OneShot = 'unique';

    public function label(): string
    {
        return match ($this) {
            self::Daily => 'Quotidienne',
            self::Weekly => 'Hebdomadaire',
            self::OneShot => 'Unique',
        };
    }
}
