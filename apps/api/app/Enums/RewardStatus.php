<?php

declare(strict_types=1);

namespace App\Enums;

enum RewardStatus: string
{
    case Pending = 'en_attente';
    case Approved = 'approuvee';
    case Rejected = 'rejetee';
    case Cancelled = 'annulee';
    case Delivered = 'livree';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Approved => 'Approuvee',
            self::Rejected => 'Rejetee',
            self::Cancelled => 'Annulee',
            self::Delivered => 'Livree',
        };
    }

    /**
     * Le solde germes a-t-il ete debite pour cette commande ?
     */
    public function isDebited(): bool
    {
        return $this !== self::Cancelled && $this !== self::Rejected;
    }
}
