<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\TrackCode;
use App\Models\BadgeRule;
use Illuminate\Database\Seeder;

/**
 * Catalogue de 30 badges repartis sur les 4 voies, avec rarete.
 *
 * Types de regles utilises par App\Services\BadgeService :
 * quest_enrolled, quest_completed, quest_completed_track, mission_claimed,
 * challenge_joined, forge_solutions, forge_solutions_rewarded,
 * submission_approved, level_reached.
 */
class BadgeRuleSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            // --- Codeur (8) ----------------------------------------------------
            ['codeur-premier-commit', 'Premier commit', 'Codeur', 'commune', ['type' => 'quest_enrolled', 'count' => 1], 'Depourvu sa premiere quete.'],
            ['codeur-algorithmicien', 'Algorithmicien', 'Codeur', 'commune', ['type' => 'quest_completed', 'count' => 3], 'Trois quetes de code validees.'],
            ['codeur-archive-royale', 'Archive Royale', 'Codeur', 'rare', ['type' => 'quest_completed', 'count' => 10], 'Dix quetes de code validees.'],
            ['codeur-master', 'Maitre du Code', 'Codeur', 'legendaire', ['type' => 'quest_completed', 'count' => 25], 'Vingt-cinq quetes de code validees.'],
            ['codeur-optimiseur', 'Optimiseur', 'Codeur', 'rare', ['type' => 'submission_approved', 'count' => 5], 'Cinq productions approuvees.'],
            ['codeur-git-master', 'Maitre Git', 'Codeur', 'epic', ['type' => 'quest_completed_track', 'track' => 'codeur', 'count' => 5], 'Cinq quetes de la voie Codeur.'],
            ['codeur-debugger', 'Chasseur de Bugs', 'Codeur', 'epic', ['type' => 'challenge_completed', 'count' => 3], 'Trois challenges termines.'],
            ['codeur-niveau-5', 'Codeur Niveau 5', 'Codeur', 'rare', ['type' => 'level_reached', 'level_no' => 5], 'Atteint le niveau 5.'],
            // --- Aidant (8) -----------------------------------------------------
            ['aidant-premier-soutien', 'Premier Soutien', 'Aidant', 'commune', ['type' => 'quest_enrolled', 'count' => 1], 'A debute son parcours.'],
            ['aidant-pedagogue', 'Pedagogue', 'Aidant', 'commune', ['type' => 'mission_claimed', 'count' => 5], 'Cinq missions revendiquees.'],
            ['aidant-mentore', 'Mentor', 'Aidant', 'rare', ['type' => 'quest_completed_track', 'track' => 'aidant', 'count' => 3], 'Trois quetes de la voie Aidant.'],
            ['aidant-solutionnaire', 'Solutionnaire', 'Aidant', 'rare', ['type' => 'forge_solutions', 'count' => 5], 'Cinq solutions proposees dans la Forge.'],
            ['aidant-repute', 'Repute', 'Aidant', 'epic', ['type' => 'forge_solutions_rewarded', 'count' => 5], 'Cinq solutions remunerationes.'],
            ['aidant-coeur-de-magenta', 'Coeur de Magenta', 'Aidant', 'epic', ['type' => 'mission_claimed', 'count' => 20], 'Vingt missions revendiquees.'],
            ['aidant-niveau-4', 'Aidant Niveau 4', 'Aidant', 'rare', ['type' => 'level_reached', 'level_no' => 4], 'Atteint le niveau 4.'],
            ['aidant-passage-relais', 'Passage de Relais', 'Aidant', 'commune', ['type' => 'challenge_joined', 'count' => 2], 'Deux challenges rejoints.'],
            // --- Batisseur (7) --------------------------------------------------
            ['batisseur-premier-pilotage', 'Premier Pilotage', 'Batisseur', 'commune', ['type' => 'quest_enrolled', 'count' => 2], 'Deux quetes suivies.'],
            ['batisseur-organisateur', 'Organisateur', 'Batisseur', 'commune', ['type' => 'mission_claimed', 'count' => 3], 'Trois missions revendiquees.'],
            ['batisseur-architecte', 'Architecte', 'Batisseur', 'rare', ['type' => 'quest_completed_track', 'track' => 'batisseur', 'count' => 4], 'Quatre quetes de la voie Batisseur.'],
            ['batisseur-equipe', 'Capitaine d Equipe', 'Batisseur', 'epic', ['type' => 'challenge_completed', 'count' => 2], 'Deux challenges termines en equipe.'],
            ['batisseur-legacy', 'Legacy', 'Batisseur', 'epic', ['type' => 'quest_completed', 'count' => 15], 'Quinze quetes validees.'],
            ['batisseur-violet', 'Esprit Violet', 'Batisseur', 'rare', ['type' => 'level_reached', 'level_no' => 6], 'Atteint le niveau 6.'],
            ['batisseur-constat', 'Esprit Construit', 'Batisseur', 'legendaire', ['type' => 'quest_completed_track', 'track' => 'batisseur', 'count' => 10], 'Dix quetes de la voie Batisseur.'],
            // --- Explorateur (7) -------------------------------------------------
            ['explorateur-premier-eclat', 'Premier Eclat', 'Explorateur', 'commune', ['type' => 'quest_enrolled', 'count' => 1], 'A debute son parcours.'],
            ['explorateur-curieux', 'Curieux', 'Explorateur', 'commune', ['type' => 'challenge_joined', 'count' => 3], 'Trois challenges rejoints.'],
            ['explorateur-carte', 'Cartographe', 'Explorateur', 'rare', ['type' => 'quest_completed_track', 'track' => 'explorateur', 'count' => 3], 'Trois quetes de la voie Explorateur.'],
            ['explorateur-cyan', 'Regard Cyan', 'Explorateur', 'rare', ['type' => 'level_reached', 'level_no' => 6], 'Atteint le niveau 6.'],
            ['explorateur-carnet', 'Carnet de Route', 'Explorateur', 'epic', ['type' => 'mission_claimed', 'count' => 12], 'Douze missions revendiquees.'],
            ['explorateur-horizons', 'Nouveaux Horizons', 'Explorateur', 'epic', ['type' => 'challenge_completed', 'count' => 5], 'Cinq challenges termines.'],
            ['explorateur-legendaire', 'Voie Legendaire', 'Explorateur', 'legendaire', ['type' => 'quest_completed', 'count' => 30], 'Trente quetes validees.'],
        ];

        foreach ($badges as [$code, $name, $track, $rarity, $rule, $description]) {
            $trackCode = match ($track) {
                'Codeur' => TrackCode::Codeur->value,
                'Aidant' => TrackCode::Aidant->value,
                'Batisseur' => TrackCode::Batisseur->value,
                default => TrackCode::Explorateur->value,
            };

            BadgeRule::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => $description,
                    'rule' => $rule,
                    'issuer' => 'CODE212 - Universite Cadi Ayyad, Marrakech',
                    'rarity' => $rarity,
                    'track_code' => $trackCode,
                    'active' => true,
                ]
            );
        }
    }
}
