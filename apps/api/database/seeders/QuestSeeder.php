<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Quest;
use App\Models\QuestStep;
use Illuminate\Database\Seeder;

/**
 * 12 quetes avec leurs etapes (duree indicative : 60 a 120 minutes).
 */
class QuestSeeder extends Seeder
{
    public function run(): void
    {
        $quests = [
            [
                'code' => 'Q-ALGO-001', 'title' => 'Premiers pas en algorithmique', 'track' => 'codeur',
                'difficulty' => 'debutant', 'xp' => 120, 'minutes' => 60,
                'description' => 'Decouvrir les bases : variables, conditions et boucles.',
                'steps' => [
                    ['Quiz : qu est-ce qu un algorithme ?', 'qcm', 'manuelle', 20],
                    ['Exercice : la suite de Fibonacci', 'code', 'manuelle', 40],
                    ['Mini-projet : deviner un nombre', 'projet', 'manuelle', 60],
                ],
            ],
            [
                'code' => 'Q-ALGO-002', 'title' => 'Complexite et structures de donnees', 'track' => 'codeur',
                'difficulty' => 'intermediaire', 'xp' => 180, 'minutes' => 90,
                'description' => 'Comparer les structures, estimer les complexites et choisir la bonne.',
                'steps' => [
                    ['Quiz : tableaux vs listes', 'qcm', 'manuelle', 30],
                    ['Atelier : implémenter une table de hachage', 'code', 'manuelle', 90],
                    ['Preuve : complexite d un tri', 'preuve', 'manuelle', 60],
                ],
            ],
            [
                'code' => 'Q-DEBUG-001', 'title' => 'Debugger son code', 'track' => 'codeur',
                'difficulty' => 'debutant', 'xp' => 100, 'minutes' => 60,
                'description' => 'Apprendre a lire une trace d erreur et a isoler un bug.',
                'steps' => [
                    ['Quiz : lire une stacktrace', 'qcm', 'manuelle', 20],
                    ['Atelier : corriger cinq bugs', 'code', 'manuelle', 60],
                ],
            ],
            [
                'code' => 'Q-WEB-001', 'title' => 'Premiere page web', 'track' => 'codeur',
                'difficulty' => 'debutant', 'xp' => 110, 'minutes' => 75,
                'description' => 'Construire une page HTML/CSS responsive aux couleurs de CODE212.',
                'steps' => [
                    ['Atelier : structure HTML', 'code', 'manuelle', 45],
                    ['Atelier : mise en page CSS', 'code', 'manuelle', 60],
                    ['Preuve : capture de la page', 'preuve', 'manuelle', 30],
                ],
            ],
            [
                'code' => 'Q-WEB-002', 'title' => 'Interaction JavaScript', 'track' => 'codeur',
                'difficulty' => 'intermediaire', 'xp' => 160, 'minutes' => 90,
                'description' => 'Manipuler le DOM et reagir aux evenements utilisateur.',
                'steps' => [
                    ['Quiz : evenements et delegation', 'qcm', 'manuelle', 30],
                    ['Atelier : mini-application interactive', 'code', 'manuelle', 120],
                ],
            ],
            [
                'code' => 'Q-AID-001', 'title' => 'Aider un camarde', 'track' => 'aidant',
                'difficulty' => 'debutant', 'xp' => 90, 'minutes' => 45,
                'description' => 'Repondre dans la Forge et/rediger une reponse claire.',
                'steps' => [
                    ['Atelier : repondre a une question dans la Forge', 'atelier', 'manuelle', 30],
                    ['Preuve : capture de la reponse', 'preuve', 'manuelle', 15],
                ],
            ],
            [
                'code' => 'Q-AID-002', 'title' => 'Rediger une documentation', 'track' => 'aidant',
                'difficulty' => 'intermediaire', 'xp' => 150, 'minutes' => 90,
                'description' => 'Documenter un projet pour qu un autre eleve puisse le reprendre.',
                'steps' => [
                    ['Atelier : guide de prise en main', 'projet', 'manuelle', 120],
                    ['Revue par les pairs', 'preuve', 'manuelle', 45],
                ],
            ],
            [
                'code' => 'Q-BAT-001', 'title' => 'Organiser un projet d equipe', 'track' => 'batisseur',
                'difficulty' => 'intermediaire', 'xp' => 170, 'minutes' => 90,
                'description' => 'Decouper un projet, estimer les taches et distribuer le travail.',
                'steps' => [
                    ['Quiz : decoupage fonctionnel', 'qcm', 'manuelle', 30],
                    ['Atelier : plan de projet et jalons', 'projet', 'manuelle', 120],
                ],
            ],
            [
                'code' => 'Q-BAT-002', 'title' => 'Revue de code', 'track' => 'batisseur',
                'difficulty' => 'avance', 'xp' => 210, 'minutes' => 120,
                'description' => 'Relire le code d un camarde et formuler des retours utiles.',
                'steps' => [
                    ['Atelier : revue de code structuree', 'code', 'manuelle', 90],
                    ['Preuve : rapport de revue', 'preuve', 'manuelle', 45],
                ],
            ],
            [
                'code' => 'Q-EXP-001', 'title' => 'Explorer un nouveau langage', 'track' => 'explorateur',
                'difficulty' => 'debutant', 'xp' => 80, 'minutes' => 60,
                'description' => 'Découvrir un langage inconnu et partager un premier programme.',
                'steps' => [
                    ['Atelier : premier programme', 'code', 'manuelle', 60],
                    ['Preuve : retour d experience', 'preuve', 'manuelle', 20],
                ],
            ],
            [
                'code' => 'Q-EXP-002', 'title' => ' veille technologique', 'track' => 'explorateur',
                'difficulty' => 'intermediaire', 'xp' => 140, 'minutes' => 75,
                'description' => 'Suivre une actualite technique et la restituer au groupe.',
                'steps' => [
                    ['Atelier : veille et synthese', 'projet', 'manuelle', 90],
                    ['Presentation de 10 minutes', 'preuve', 'manuelle', 30],
                ],
            ],
            [
                'code' => 'Q-MIX-001', 'title' => 'Projet phare : mon premier jeu', 'track' => null,
                'difficulty' => 'expert', 'xp' => 300, 'minutes' => 120,
                'description' => 'Projet de fin de parcours : concevoir un jeu simple en JavaScript.',
                'steps' => [
                    ['Cahier des charges', 'projet', 'manuelle', 60],
                    ['Prototype jouable', 'code', 'manuelle', 180],
                    ['Demo et retour', 'preuve', 'manuelle', 45],
                ],
            ],
        ];

        foreach ($quests as $position => $quest) {
            $model = Quest::query()->updateOrCreate(
                ['code' => $quest['code']],
                [
                    'title' => $quest['title'],
                    'description' => $quest['description'],
                    'track_code' => $quest['track'],
                    'difficulty' => $quest['difficulty'],
                    'status' => 'publie',
                    'xp_reward' => $quest['xp'],
                    'germes_reward' => (int) round($quest['xp'] / 5),
                    'estimated_minutes' => $quest['minutes'],
                    'position' => $position + 1,
                ]
            );

            foreach ($quest['steps'] as $index => $step) {
                QuestStep::query()->updateOrCreate(
                    ['quest_id' => $model->getKey(), 'order_index' => $index + 1],
                    [
                        'title' => $step[0],
                        'description' => null,
                        'type' => $step[1],
                        'validation_mode' => $step[2],
                        'xp_reward' => (int) round($quest['xp'] / count($quest['steps'])),
                        'duration_minutes' => $step[3],
                    ]
                );
            }
        }
    }
}
