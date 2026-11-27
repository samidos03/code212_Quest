<?php

declare(strict_types=1);

namespace App\Enums;

enum QuestDifficulty: string
{
    case Beginner = 'debutant';
    case Intermediate = 'intermediaire';
    case Advanced = 'avance';
    case Expert = 'expert';

    public function label(): string
    {
        return match ($this) {
            self::Beginner => 'Debutant',
            self::Intermediate => 'Intermediaire',
            self::Advanced => 'Avance',
            self::Expert => 'Expert',
        };
    }

    /**
     * Multiplicateur de bareme XP applique par defaut.
     */
    public function xpMultiplier(): float
    {
        return match ($this) {
            self::Beginner => 1.0,
            self::Intermediate => 1.5,
            self::Advanced => 2.0,
            self::Expert => 3.0,
        };
    }
}
