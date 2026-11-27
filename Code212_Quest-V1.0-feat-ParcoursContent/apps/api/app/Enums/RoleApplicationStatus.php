<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleApplicationStatus: string
{
    case Pending = 'en_attente';
    case Approved = 'approuvee';
    case Rejected = 'rejetee';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Approved => 'Approuvee',
            self::Rejected => 'Rejetee',
        };
    }
}
