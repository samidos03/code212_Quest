<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

/**
 * Niveaux globaux 1..10 : seuils d'XP, prerequis et avantages.
 */
class LevelSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [1, 'Nouveau venu', 0, ['pre_requis' => []], ['avantages' => ['acces aux quetes d initiation', 'forum de la Forge']]],
            [2, 'Apprenant Curieux', 500, ['pre_requis' => ['niveau_min' => 1]], ['avantages' => ['acces aux quetes intermediaires', 'badge de participation']]],
            [3, 'Codeur Confirme', 1200, ['pre_requis' => ['niveau_min' => 2]], ['avantages' => ['depot de solutions dans la Forge', 'catalogue de recompenses etendu']]],
            [4, 'Aidant Reconu', 2200, ['pre_requis' => ['niveau_min' => 2]], ['avantages' => ['badge Aidant', 'parcours d entraide']]],
            [5, 'Batisseur d Equipe', 4000, ['pre_requis' => ['niveau_min' => 3]], ['avantages' => ['acces aux projets d equipe', 'bonus de parcours']]],
            [6, 'Explorateur Confirmé', 6500, ['pre_requis' => ['niveau_min' => 3]], ['avantages' => ['accession aux prototypes', 'nouveaux quiz']]],
            [7, 'Senior CODE212', 10000, ['pre_requis' => ['niveau_min' => 5]], ['avantages' => ['parcours mentorat', 'recompenses exclusives']]],
            [8, 'Ambassadeur', 15000, ['pre_requis' => ['niveau_min' => 5]], ['avantages' => ['certificat de participation', 'forum de la Forge elargi']]],
            [9, 'Architecte', 22000, ['pre_requis' => ['niveau_min' => 7]], ['avantages' => ['ateliers de projets', 'vote sur les defis']]],
            [10, 'Legendaire', 32000, ['pre_requis' => ['niveau_min' => 8]], ['avantages' => ['badge legendaire', 'parcours d apprentissage personnalise']]],
        ];

        foreach ($levels as [$number, $title, $threshold, $requirements, $benefits]) {
            Level::query()->updateOrCreate(
                ['level_no' => $number],
                [
                    'title' => $title,
                    'xp_threshold' => $threshold,
                    'requirements' => $requirements,
                    'benefits' => $benefits,
                ]
            );
        }
    }
}
