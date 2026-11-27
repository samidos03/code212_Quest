<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Level;
use App\Models\User;
use App\Models\XpLedgerEntry;

/**
 * Calcul des niveaux globaux.
 *
 * Regle metier : le niveau est determine cote serveur a partir de l'XP
 * historique cumule (somme des ecritures du journal XP), jamais a partir d'un
 * compteur modifiable par le client.
 */
final class LevelService
{
    public function __construct(private readonly Codep212ConfigService $config)
    {
    }

    /**
     * XP global total d'un utilisateur.
     *
     * Décision produit (nov. 2026) : les XP de voie gagnés en quête comptent
     * aussi dans le niveau global. Le total global additionne donc toutes les
     * écritures du journal ; trackXp() garde le détail par voie.
     */
    public function totalXp(User $user): int
    {
        return (int) XpLedgerEntry::query()
            ->where('user_id', $user->getKey())
            ->sum('xp_delta');
    }

    /**
     * XP total d'une voie pour un utilisateur.
     */
    public function trackXp(User $user, string $trackCode): int
    {
        return (int) XpLedgerEntry::query()
            ->where('user_id', $user->getKey())
            ->where('track_type', $trackCode)
            ->sum('xp_delta');
    }

    /**
     * Niveau correspondant a un total d'XP donne.
     */
    public function levelForXp(int $totalXp): Level
    {
        $levels = $this->config->levels();

        if ($levels->isEmpty()) {
            throw new \RuntimeException('Aucun niveau configure : table levels_config vide.');
        }

        // Les niveaux sont triés par seuil croissant : le niveau atteint est le
        // dernier dont le seuil est inférieur ou égal au total.
        /** @var Level|null $level */
        $level = $levels->last(static fn (Level $candidate): bool => $candidate->xp_threshold <= $totalXp);

        return $level ?? $levels->first();
    }

    public function levelFor(User $user): Level
    {
        return $this->levelForXp($this->totalXp($user));
    }

    /**
     * Progression detaillee : niveau courant, niveau suivant, XP restants.
     *
     * @return array<string, mixed>
     */
    public function progress(User $user): array
    {
        $totalXp = $this->totalXp($user);
        $levels = $this->config->levels()->sortBy('level_no')->values();

        $level = $this->levelForXp($totalXp);
        $next = $levels->first(static fn (Level $candidate): bool => $candidate->xp_threshold > $totalXp);

        $currentThreshold = (int) $level->xp_threshold;
        $nextThreshold = $next?->xp_threshold;

        $percent = 100.0;
        if ($nextThreshold !== null && $nextThreshold > $currentThreshold) {
            $percent = round((($totalXp - $currentThreshold) / ($nextThreshold - $currentThreshold)) * 100, 2);
        }

        return [
            'xp_total' => $totalXp,
            'level_no' => (int) $level->level_no,
            'level_title' => $level->title,
            'xp_threshold' => $currentThreshold,
            'next_level_no' => $next?->level_no,
            'next_level_title' => $next?->title,
            'xp_to_next_level' => $nextThreshold === null ? 0 : max(0, $nextThreshold - $totalXp),
            'progress_percent' => max(0.0, min(100.0, (float) $percent)),
        ];
    }

    /**
     * Recalcule et met en cache le niveau et l'XP total sur la fiche utilisateur.
     */
    public function syncUser(User $user): void
    {
        $totalXp = $this->totalXp($user);
        $level = $this->levelForXp($totalXp);

        $user->forceFill([
            'xp_total' => $totalXp,
            'level_no' => (int) $level->level_no,
        ])->save();
    }
}
