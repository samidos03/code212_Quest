<?php

declare(strict_types=1);

namespace App\Enums;

enum EnrollmentStatus: string
{
    case InProgress = 'en_cours';
    case Completed = 'terminee';
    case Abandoned = 'abandonnee';

    public function label(): string
    {
        return match ($this) {
            self::InProgress => 'En cours',
            self::Completed => 'Terminee',
            self::Abandoned => 'Abandonnee',
        };
    }
}
