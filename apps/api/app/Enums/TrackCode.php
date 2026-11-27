<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Les quatre voies de progression de la plateforme.
 *
 * - Codeur    : maitrise technique et production de code.
 * - Aidant    : entraide, redaction et pedagogie.
 * - Batisseur : structuration de projets et d'equipes.
 * - Explorateur : curiosite, veille et decouverte.
 */
enum TrackCode: string
{
    case Codeur = 'codeur';
    case Aidant = 'aidant';
    case Batisseur = 'batisseur';
    case Explorateur = 'explorateur';

    public function label(): string
    {
        return match ($this) {
            self::Codeur => 'Codeur',
            self::Aidant => 'Aidant',
            self::Batisseur => 'Batisseur',
            self::Explorateur => 'Explorateur',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Codeur => 'Resolution de problemes, algorithmique et qualite du code.',
            self::Aidant => 'Entraide, redaction de ressources et accompagnement des pairs.',
            self::Batisseur => 'Architecture de projets, mentorat d\'equipes et organisation.',
            self::Explorateur => 'Veille, prototypage et ouverture a de nouveaux domaines.',
        };
    }

    /**
     * Couleur de la charte graphique associee a la voie.
     */
    public function color(): string
    {
        return match ($this) {
            self::Codeur => '#c5027f',
            self::Aidant => '#00dfff',
            self::Batisseur => '#6701e6',
            self::Explorateur => '#00dfff',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $track): string => $track->value, self::cases());
    }
}
