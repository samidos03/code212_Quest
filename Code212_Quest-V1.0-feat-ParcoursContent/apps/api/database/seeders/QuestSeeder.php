<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Quest;
use App\Models\QuestStep;
use Illuminate\Database\Seeder;

/**
 * Quêtes avec leurs étapes et quêtes finales de parcours.
 */
class QuestSeeder extends Seeder
{
    public function run(): void
    {
        $quests = [
            [
                'code' => 'Q-FULLSTACK-001', 'title' => 'Quête finale : Page de profil responsive', 'track' => 'codeur',
                'difficulty' => 'debutant', 'xp' => 150, 'minutes' => 60,
                'description' => 'Quête finale du Module 1 : Concevez une carte de profil utilisateur responsive et sémantique en HTML5 et CSS Flexbox.',
                'steps' => [
                    [
                        'Livrable final : Intégration de la carte de profil',
                        'preuve',
                        'manuelle',
                        150,
                        'Critères de réussite explicites : 1. Structure sémantique HTML5 valide (<main>, <article>). 2. Mise en page Flexbox responsive et centrée. 3. Respect des contrastes et accessibilité. Livrable attendu : Lien vers votre dépôt GitHub ou extrait du code complet.',
                    ],
                ],
            ],
            [
                'code' => 'Q-FULLSTACK-002', 'title' => 'Quête finale : Application interactive de filtrage', 'track' => 'codeur',
                'difficulty' => 'intermediaire', 'xp' => 160, 'minutes' => 90,
                'description' => 'Quête finale du Module 2 : Construisez un composant interactif en JavaScript pur manipulant le DOM et consommant une API en asynchrone.',
                'steps' => [
                    [
                        'Livrable final : Mini-application JavaScript asynchrone',
                        'preuve',
                        'manuelle',
                        160,
                        'Critères de réussite explicites : 1. Écouteurs d’événements sans rechargement de page. 2. Requête Fetch avec gestion des erreurs et affichage asynchrone. 3. Code modulaire et documenté. Livrable attendu : Code source JavaScript et capture de l’interface fonctionnelle.',
                    ],
                ],
            ],
            [
                'code' => 'Q-FULLSTACK-003', 'title' => 'Quête finale : API RESTful sécurisée avec Laravel', 'track' => 'codeur',
                'difficulty' => 'intermediaire', 'xp' => 180, 'minutes' => 90,
                'description' => 'Quête finale du Module 3 : Développez un contrôleur d’API Laravel avec validation FormRequest, relations Eloquent et ressource JSON normée.',
                'steps' => [
                    [
                        'Livrable final : Endpoints API REST et contrôleur Laravel',
                        'preuve',
                        'manuelle',
                        180,
                        'Critères de réussite explicites : 1. Déclaration de routes apiResource avec contrôleur dédié. 2. Utilisation d’une FormRequest pour la validation serveur. 3. Réponse normée { data } via JsonResource sans fuite de secrets. Livrable attendu : Contrôleur Laravel, FormRequest et test d’endpoint.',
                    ],
                ],
            ],
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
                'difficulty' => 'debutant', 'xp' => 100, 'minutes' => 60,
                'description' => 'Definir les roles, un calendrier et des livrables clairs.',
                'steps' => [
                    ['Atelier : decoupage en taches', 'projet', 'manuelle', 60],
                    ['Preuve : tableau de bord du projet', 'preuve', 'manuelle', 30],
                ],
            ],
            [
                'code' => 'Q-BAT-002', 'title' => 'Revue de code', 'track' => 'batisseur',
                'difficulty' => 'intermediaire', 'xp' => 130, 'minutes' => 75,
                'description' => 'Relire le travail d un pair et donner un feedback constructif.',
                'steps' => [
                    ['Atelier : grille de relecture', 'atelier', 'manuelle', 45],
                    ['Preuve : revue d une PR sur GitHub', 'preuve', 'manuelle', 45],
                ],
            ],
            [
                'code' => 'Q-EXP-001', 'title' => 'Decouvrir un nouveau langage', 'track' => 'explorateur',
                'difficulty' => 'debutant', 'xp' => 80, 'minutes' => 45,
                'description' => 'Ecrire un premier programme dans un langage que vous ne connaissez pas.',
                'steps' => [
                    ['Atelier : hello world et syntaxe', 'code', 'manuelle', 45],
                    ['Preuve : code source annote', 'preuve', 'manuelle', 30],
                ],
            ],
            [
                'code' => 'Q-EXP-002', 'title' => 'Veille technologique', 'track' => 'explorateur',
                'difficulty' => 'intermediaire', 'xp' => 110, 'minutes' => 60,
                'description' => 'Synthetiser une nouveaute technique et la presenter a la promo.',
                'steps' => [
                    ['Atelier : synthese d un article', 'atelier', 'manuelle', 45],
                    ['Preuve : fiche de veille partagee', 'preuve', 'manuelle', 30],
                ],
            ],
        ];

        foreach ($quests as $index => $data) {
            $quest = Quest::query()->updateOrCreate(
                ['code' => $data['code']],
                [
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'track_code' => $data['track'],
                    'difficulty' => $data['difficulty'],
                    'status' => 'publie',
                    'xp_reward' => $data['xp'],
                    'germes_reward' => (int) round($data['xp'] / 5),
                    'estimated_minutes' => $data['minutes'],
                    'position' => $index + 1,
                ]
            );

            foreach ($data['steps'] as $sIndex => $stepData) {
                QuestStep::query()->updateOrCreate(
                    ['quest_id' => $quest->getKey(), 'order_index' => $sIndex + 1],
                    [
                        'title' => $stepData[0],
                        'type' => $stepData[1],
                        'validation_mode' => $stepData[2],
                        'xp_reward' => $stepData[3],
                        'description' => $stepData[4] ?? null,
                        'duration_minutes' => 30,
                    ]
                );
            }
        }
    }
}
