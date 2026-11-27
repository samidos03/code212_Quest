<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Mission;
use Illuminate\Database\Seeder;

/**
 * Missions (objectifs ponctuels et recurrents).
 */
class MissionSeeder extends Seeder
{
    public function run(): void
    {
        $missions = [
            ['M-PRESENCE', 'Etre present au centre', 'Se pointer au centre CODE212 une fois dans la journee.', 'quotidienne', 'codeur', 15, 5, ['max_claims_per_day' => 1], 1],
            ['M-FORGE', 'Participer a la Forge', 'Repondre a une question ou proposer une solution.', 'quotidienne', 'aidant', 20, 5, ['max_claims_per_day' => 2], 2],
            ['M-AIDE', 'Aider un camarde', 'Repondre a au moins une demande d entraide dans la semaine.', 'hebdomadaire', 'aidant', 60, 15, ['max_claims_per_day' => 1], 3],
            ['M-VEILLE', 'Faire une veille', 'Partager une veille technologique dans la Forge.', 'hebdomadaire', 'explorateur', 50, 10, ['max_claims_per_day' => 1], 4],
            ['M-QUETE', 'Terminer une quete', 'Achever une quete pour valider un parcours.', 'unique', 'codeur', 50, 10, ['min_quests_completed' => 1], 5],
            ['M-EXPERT', 'Defi d expert', 'Achever cinq quetes de niveau expert.', 'unique', 'batisseur', 150, 40, ['min_quests_completed' => 5], 6],
            ['M-CONTINUITE', 'Serre de 7 jours', 'Etre present 7 jours de suite.', 'unique', null, 120, 30, [], 7],
        ];

        foreach ($missions as [$code, $title, $description, $kind, $track, $xp, $germes, $criteria, $position]) {
            Mission::query()->updateOrCreate(
                ['code' => $code],
                [
                    'title' => $title,
                    'description' => $description,
                    'track_code' => $track,
                    'kind' => $kind,
                    'xp_reward' => $xp,
                    'germes_reward' => $germes,
                    'criteria' => $criteria,
                    'starts_at' => now()->subMonth(),
                    'ends_at' => now()->addMonths(6),
                    'active' => true,
                    'position' => $position,
                ]
            );
        }
    }
}
