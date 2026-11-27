<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\LearningPath;
use App\Models\PathStep;
use Illuminate\Database\Seeder;

/**
 * 5 parcours d'apprentissage.
 */
class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $paths = [
            [
                'code' => 'P-START', 'title' => 'Demarrer sur CODE212', 'track' => 'codeur',
                'levels' => [1, 3], 'xp' => 150, 'germes' => 30,
                'description' => 'Le parcours d onboarding : premieres quetes, premiers badges.',
                'steps' => [
                    ['Premiere quete', 'quete', 'Q-ALGO-001', 40],
                    ['Premiere presence au centre', 'mission', 'M-PRESENCE', 20],
                    ['Premier badge', 'badges', 'codeur-premier-commit', 10],
                ],
            ],
            [
                'code' => 'P-CODEUR', 'title' => 'Devenir Codeur', 'track' => 'codeur',
                'levels' => [2, 6], 'xp' => 300, 'germes' => 60,
                'description' => 'Algorithmique, structures de donnees et qualite du code.',
                'steps' => [
                    ['Algorithmique avancee', 'quete', 'Q-ALGO-002', 80],
                    ['Debugger son code', 'quete', 'Q-DEBUG-001', 60],
                    ['Interaction JavaScript', 'quete', 'Q-WEB-002', 80],
                    ['Challenge d autumnne', 'challenge', 'C-AUTOMNE', 80],
                ],
            ],
            [
                'code' => 'P-AIDANT', 'title' => 'Devenir Aidant', 'track' => 'aidant',
                'levels' => [1, 5], 'xp' => 260, 'germes' => 55,
                'description' => 'Entraide, redaction et pedagogie au service du collectif.',
                'steps' => [
                    ['Aider un camarde', 'quete', 'Q-AID-001', 60],
                    ['Rediger une documentation', 'quete', 'Q-AID-002', 90],
                    ['Mission pedagogique', 'mission', 'M-AIDE', 50],
                    ['Participer a la Forge', 'mission', 'M-FORGE', 60],
                ],
            ],
            [
                'code' => 'P-BATISSEUR', 'title' => 'Bâtir une équipe', 'track' => 'batisseur',
                'levels' => [3, 8], 'xp' => 280, 'germes' => 60,
                'description' => 'Organisation de projet, revue de code et mentorat.',
                'steps' => [
                    ['Organiser un projet', 'quete', 'Q-BAT-001', 90],
                    ['Revue de code', 'quete', 'Q-BAT-002', 110],
                    ['Challenge en equipe', 'challenge', 'C-AUTOMNE', 80],
                ],
            ],
            [
                'code' => 'P-EXPLORATEUR', 'title' => 'Explorer et innover', 'track' => 'explorateur',
                'levels' => [1, 7], 'xp' => 240, 'germes' => 50,
                'description' => 'Veille, prototypes et ouverture a de nouveaux domaines.',
                'steps' => [
                    ['Premier langage', 'quete', 'Q-EXP-001', 60],
                    ['Veille technologique', 'quete', 'Q-EXP-002', 90],
                    ['Mission exploration', 'mission', 'M-VEILLE', 60],
                ],
            ],
        ];

        foreach ($paths as $position => $path) {
            $model = LearningPath::query()->updateOrCreate(
                ['code' => $path['code']],
                [
                    'title' => $path['title'],
                    'description' => $path['description'],
                    'track_code' => $path['track'],
                    'level_no_from' => $path['levels'][0],
                    'level_no_to' => $path['levels'][1],
                    'xp_bonus' => $path['xp'],
                    'germes_bonus' => $path['germes'],
                    'position' => $position + 1,
                    'published' => true,
                ]
            );

            foreach ($path['steps'] as $index => $step) {
                PathStep::query()->updateOrCreate(
                    ['learning_path_id' => $model->getKey(), 'order_index' => $index + 1],
                    [
                        'title' => $step[0],
                        'description' => null,
                        'kind' => $step[1],
                        'ref_type' => rtrim($step[1], 's'),
                        'ref_id' => $step[2],
                        'xp_reward' => $step[3],
                    ]
                );
            }
        }
    }
}
