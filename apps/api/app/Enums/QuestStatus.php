<?php

declare(strict_types=1);

namespace App\Enums;

enum QuestStatus: string
{
    case Draft = 'brouillon';
    case Published = 'publie';
    case Archived = 'archive';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Brouillon',
            self::Published => 'Publiee',
            self::Archived => 'Archivee',
        };
    }
}
