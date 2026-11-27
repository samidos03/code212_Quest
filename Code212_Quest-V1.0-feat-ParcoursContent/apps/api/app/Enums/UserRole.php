<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Roles applicatifs de la plateforme Code212 Quest.
 *
 * Un utilisateur peut cumuler plusieurs roles (colonne `users.roles`, jsonb).
 */
enum UserRole: string
{
    case Student = 'student';
    case Trainer = 'trainer';
    case Moderator = 'moderator';
    case Admin = 'admin';

    /**
     * Libelle francais affiche dans l'interface.
     */
    public function label(): string
    {
        return match ($this) {
            self::Student => 'Apprenant',
            self::Trainer => 'Formateur',
            self::Moderator => 'Moderateur',
            self::Admin => 'Administrateur',
        };
    }

    /**
     * Un role encadre-t-il d'autres utilisateurs sur la plateforme ?
     */
    public function isStaff(): bool
    {
        return match ($this) {
            self::Trainer, self::Moderator, self::Admin => true,
            self::Student => false,
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $role): string => $role->value, self::cases());
    }
}
