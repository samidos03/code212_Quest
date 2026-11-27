<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\LearningPath;
use App\Models\LessonExercise;
use App\Models\ModuleLesson;
use App\Models\PathStep;
use App\Models\Quest;
use Illuminate\Database\Seeder;

/**
 * 5 parcours d'apprentissage dont le parcours Développeur Full-Stack en 3 modules.
 */
class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $paths = [
            [
                'code' => 'P-FULLSTACK', 'title' => 'Parcours Développeur Full-Stack', 'track' => 'codeur',
                'levels' => [1, 4], 'xp' => 500, 'germes' => 100,
                'description' => 'Parcours débutant Full-Stack en 3 modules progressifs : Fondations HTML/CSS, Dynamique JavaScript et Backend Laravel API.',
                'steps' => [
                    ['Module 1 : Fondations Web (HTML & CSS Modernes)', 'module', 'Q-FULLSTACK-001', 150, 'Maîtriser la sémantique HTML5, la mise en page Flexbox et soumettre votre première quête validée par un formateur.'],
                    ['Module 2 : Dynamique Frontend (JavaScript ES6+)', 'module', 'Q-FULLSTACK-002', 160, 'Interactions DOM, événements et asynchronisme. Verrouillé jusqu à validation du Module 1.'],
                    ['Module 3 : Backend & API (PHP & Laravel)', 'module', 'Q-FULLSTACK-003', 180, 'Modélisation relationnelle, contrôleurs et API REST. Verrouillé jusqu à validation du Module 2.'],
                ],
            ],
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
                $quest = Quest::query()->where('code', $step[2])->first();

                $stepModel = PathStep::query()->updateOrCreate(
                    ['learning_path_id' => $model->getKey(), 'order_index' => $index + 1],
                    [
                        'title' => $step[0],
                        'description' => $step[4] ?? null,
                        'kind' => $step[1],
                        'ref_type' => 'quete',
                        'ref_id' => $step[2],
                        'quest_id' => $quest?->getKey(),
                        'xp_reward' => $step[3],
                    ]
                );

                // Alimentation des 3 modules du parcours Full-Stack
                if ($path['code'] === 'P-FULLSTACK') {
                    if ($index === 0) {
                        $this->seedFullStackModule1($stepModel);
                    } elseif ($index === 1) {
                        $this->seedFullStackModule2($stepModel);
                    } elseif ($index === 2) {
                        $this->seedFullStackModule3($stepModel);
                    }
                }
            }
        }
    }

    /**
     * Module 1 : HTML & CSS Fondations
     */
    private function seedFullStackModule1(PathStep $step): void
    {
        // Chapitre 1 : Sémantique HTML5
        $lesson1 = ModuleLesson::query()->updateOrCreate(
            ['path_step_id' => $step->getKey(), 'order_index' => 1],
            [
                'title' => 'Structure & Sémantique HTML5',
                'summary' => 'Organiser un document web avec des repères sémantiques clairs et accessibles.',
                'key_points' => [
                    '<main> identifie le contenu central et unique de la page web.',
                    '<article> encapsule un contenu autonome et réutilisable (carte, billet de blog).',
                    '<section> regroupe des éléments thématiques connexes avec leur propre titre.',
                    'L’accessibilité (a11y) s’appuie sur les balises natives pour les lecteurs d’écran.',
                ],
                'content' => "En HTML5 moderne, la structure d’un document repose sur des balises sémantiques qui donnent un sens explicite au contenu pour les navigateurs, les moteurs d'indexation et les technologies d'assistance.",
                'example_code' => "<main class=\"content-wrapper\">\n  <article class=\"mission-card\">\n    <header>\n      <h2>Déploiement du Noyau Orbital</h2>\n      <time datetime=\"2026-11-27\">27 nov. 2026</time>\n    </header>\n    <p>Initialisation des micro-services de communication avec la station sol.</p>\n    <footer>\n      <span class=\"badge\">Architecture V1</span>\n    </footer>\n  </article>\n</main>",
                'example_explanation' => "Chaque balise (<main>, <article>, <header>, <footer>) explicite directement sa portée structurelle sans classes CSS artificielles requises pour les technologies d’assistance.",
                'estimated_minutes' => 15,
            ]
        );

        LessonExercise::query()->updateOrCreate(
            ['module_lesson_id' => $lesson1->getKey(), 'order_index' => 1],
            [
                'title' => 'Quiz : Sémantique HTML5',
                'instructions' => 'Quelle balise HTML5 est spécialement dédiée à englober le bloc de contenu principal et unique d’une page web ?',
                'starter_code' => null,
                'validation_type' => 'qcm',
                'validation_rules' => [
                    'options' => [
                        ['id' => 'a', 'label' => '<section>'],
                        ['id' => 'b', 'label' => '<main>'],
                        ['id' => 'c', 'label' => '<div>'],
                        ['id' => 'd', 'label' => '<content>'],
                    ],
                    'correct' => 'b',
                    'explanation' => 'La balise <main> identifie formellement le contenu principal unique du document.',
                ],
            ]
        );

        // Chapitre 2 : Mise en page Flexbox
        $lesson2 = ModuleLesson::query()->updateOrCreate(
            ['path_step_id' => $step->getKey(), 'order_index' => 2],
            [
                'title' => 'Alignement & Mise en Page avec Flexbox',
                'summary' => 'Maîtriser le positionnement flexible, l’alignement transversal et les espaces responsives.',
                'key_points' => [
                    'display: flex active le modèle de boîte flexible unidimensionnel.',
                    'justify-content contrôle la distribution le long de l’axe principal (row ou column).',
                    'align-items positionne et aligne les éléments sur l’axe transversal.',
                    'gap définit un espacement uniforme et propre sans marges parasites.',
                ],
                'content' => "Flexbox simplifie la disposition et le centrage horizontal et vertical des composants sur tous les formats d’écran.",
                'example_code' => ".toolbar-actions {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1.25rem;\n  padding: 1rem;\n}",
                'example_explanation' => "Le conteneur distribue les boutons aux extrémités (space-between), les centre sur la hauteur (align-items: center) et garantit 1.25rem d'espace régulier.",
                'estimated_minutes' => 20,
            ]
        );

        LessonExercise::query()->updateOrCreate(
            ['module_lesson_id' => $lesson2->getKey(), 'order_index' => 1],
            [
                'title' => 'Quiz : Alignement Flexbox',
                'instructions' => 'Dans un conteneur en ligne (display: flex), quelle propriété CSS contrôle l’alignement des enfants sur l’axe transversal vertical ?',
                'starter_code' => null,
                'validation_type' => 'qcm',
                'validation_rules' => [
                    'options' => [
                        ['id' => 'a', 'label' => 'align-items'],
                        ['id' => 'b', 'label' => 'justify-content'],
                        ['id' => 'c', 'label' => 'flex-align'],
                        ['id' => 'd', 'label' => 'text-align'],
                    ],
                    'correct' => 'a',
                    'explanation' => 'align-items régit l’axe transversal, tandis que justify-content gère l’axe principal.',
                ],
            ]
        );
    }

    /**
     * Module 2 : JavaScript Dynamique & Asynchronisme
     */
    private function seedFullStackModule2(PathStep $step): void
    {
        // Chapitre 1 : Manipulation du DOM & Événements
        $lesson1 = ModuleLesson::query()->updateOrCreate(
            ['path_step_id' => $step->getKey(), 'order_index' => 1],
            [
                'title' => 'Manipulation du DOM & Écouteurs d’Événements',
                'summary' => 'Rendre vos pages interactives et réactives en réponse aux actions des utilisateurs.',
                'key_points' => [
                    'document.querySelector() sélectionne un élément DOM via un sélecteur CSS standard.',
                    'addEventListener() attache un observateur sans écraser les gestionnaires déjà en place.',
                    'event.preventDefault() bloque l’action par défaut (ex: soumission synchrone de formulaire).',
                    'element.classList.toggle() bascule un état graphique proprement.',
                ],
                'content' => "JavaScript connecte la logique de programmation aux éléments visuels du navigateur en interceptant les signaux émis par les actions de l'utilisateur.",
                'example_code' => "const filterButton = document.querySelector('#btn-toggle-filters');\nconst sidebar = document.querySelector('.filters-panel');\n\nfilterButton.addEventListener('click', (event) => {\n  event.preventDefault();\n  const isOpen = sidebar.classList.toggle('is-visible');\n  filterButton.setAttribute('aria-expanded', String(isOpen));\n});",
                'example_explanation' => "L’écouteur intercepte le clic, commute la classe CSS de visibilité et synchronise l’attribut d’accessibilité aria-expanded.",
                'estimated_minutes' => 20,
            ]
        );

        LessonExercise::query()->updateOrCreate(
            ['module_lesson_id' => $lesson1->getKey(), 'order_index' => 1],
            [
                'title' => 'Quiz : Gestion des Événements DOM',
                'instructions' => 'Quelle méthode permet d’empêcher la soumission synchrone par défaut d’un formulaire HTML dans un écouteur d’événement ?',
                'starter_code' => null,
                'validation_type' => 'qcm',
                'validation_rules' => [
                    'options' => [
                        ['id' => 'a', 'label' => 'event.preventDefault()'],
                        ['id' => 'b', 'label' => 'event.stopPropagation()'],
                        ['id' => 'c', 'label' => 'window.cancelAction()'],
                        ['id' => 'd', 'label' => 'form.abort()'],
                    ],
                    'correct' => 'a',
                    'explanation' => 'preventDefault() neutralise le comportement par défaut défini par le navigateur.',
                ],
            ]
        );

        // Chapitre 2 : Asynchronisme & Fetch API
        $lesson2 = ModuleLesson::query()->updateOrCreate(
            ['path_step_id' => $step->getKey(), 'order_index' => 2],
            [
                'title' => 'Asynchronisme avec Fetch & Async/Await',
                'summary' => 'Consommer des API distantes et gérer les données JSON sans figer l’interface.',
                'key_points' => [
                    'fetch() déclenche une requête HTTP asynchrone et renvoie une promesse (Promise).',
                    'async / await offre une écriture séquentielle et hautement lisible pour le flux asynchrone.',
                    'response.ok vérifie si le code de statut HTTP se situe dans l’intervalle de succès 200–299.',
                    'Le bloc try / catch intercepte et isole proprement les erreurs réseau.',
                ],
                'content' => "L’asynchronisme permet aux applications frontales de dialoguer avec des serveurs d’API en temps réel sans jamais interrompre la réactivité de l’affichage.",
                'example_code' => "async function loadQuestDetails(questId) {\n  try {\n    const res = await fetch(`/api/v1/quests/\${questId}`, {\n      headers: { 'Accept': 'application/json' },\n    });\n    if (!res.ok) throw new Error(`HTTP \${res.status}`);\n    const { data } = await res.json();\n    return data;\n  } catch (err) {\n    console.error('Impossible de charger la quête :', err.message);\n    return null;\n  }\n}",
                'example_explanation' => "L’appel combiné de await fetch() et de la vérification res.ok garantit un traitement des réponses robuste et résistant aux pannes.",
                'estimated_minutes' => 25,
            ]
        );

        LessonExercise::query()->updateOrCreate(
            ['module_lesson_id' => $lesson2->getKey(), 'order_index' => 1],
            [
                'title' => 'Quiz : Statut HTTP avec Fetch',
                'instructions' => 'Que vérifie la propriété booléenne response.ok retournée par l’appel fetch() ?',
                'starter_code' => null,
                'validation_type' => 'qcm',
                'validation_rules' => [
                    'options' => [
                        ['id' => 'a', 'label' => 'Si le code HTTP est compris entre 200 et 299'],
                        ['id' => 'b', 'label' => 'Si la réponse contient un JSON valide'],
                        ['id' => 'c', 'label' => 'Si le temps de latence est sous 200ms'],
                        ['id' => 'd', 'label' => 'Si le token d’authentification est valide'],
                    ],
                    'correct' => 'a',
                    'explanation' => 'response.ok est true uniquement pour les statuts HTTP de succès compris entre 200 et 299.',
                ],
            ]
        );
    }

    /**
     * Module 3 : Backend & API (PHP & Laravel)
     */
    private function seedFullStackModule3(PathStep $step): void
    {
        // Chapitre 1 : Routage REST & Contrôleurs
        $lesson1 = ModuleLesson::query()->updateOrCreate(
            ['path_step_id' => $step->getKey(), 'order_index' => 1],
            [
                'title' => 'Routage RESTful & Contrôleurs Laravel',
                'summary' => 'Concevoir des points d’entrée d’API prévisibles, cohérents et sécurisés.',
                'key_points' => [
                    'Route::apiResource() déclare les 5 endpoints CRUD standard pour les API.',
                    'Les contrôleurs d’API sérialisent les données dans une enveloppe JSON { data } normée.',
                    'Le Route Model Binding résout automatiquement l’entité Eloquent depuis l’URI.',
                    'L’autorisation d’action s’effectue via les Policies avant l’exécution de la logique.',
                ],
                'content' => "Laravel structure le développement d’API modernes grâce à un routeur expressif et des contrôleurs dédiés à la manipulation de charges JSON.",
                'example_code' => 'namespace App\Http\Controllers\Api\V1;' . "\n\n" . 'use App\Http\Resources\QuestResource;' . "\n" . 'use App\Models\Quest;' . "\n\n" . 'class QuestController extends Controller' . "\n" . '{' . "\n" . '    public function show(Quest $quest): QuestResource' . "\n" . '    {' . "\n" . '        $this->authorize(\'view\', $quest);' . "\n" . '        return new QuestResource($quest->load(\'steps\'));' . "\n" . '    }' . "\n" . '}',
                'example_explanation' => "Le contrôleur s’appuie sur le Route Model Binding, valide la politique d’accès et délègue la transformation JSON à la ressource d’API.",
                'estimated_minutes' => 20,
            ]
        );

        LessonExercise::query()->updateOrCreate(
            ['module_lesson_id' => $lesson1->getKey(), 'order_index' => 1],
            [
                'title' => 'Quiz : Routage REST dans Laravel',
                'instructions' => 'Quelle méthode du routeur Laravel déclare automatiquement les routes CRUD pour une API sans créer les routes HTML create et edit ?',
                'starter_code' => null,
                'validation_type' => 'qcm',
                'validation_rules' => [
                    'options' => [
                        ['id' => 'a', 'label' => 'Route::apiResource(...)'],
                        ['id' => 'b', 'label' => 'Route::resource(...)'],
                        ['id' => 'c', 'label' => 'Route::crud(...)'],
                        ['id' => 'd', 'label' => 'Route::restEndpoint(...)'],
                    ],
                    'correct' => 'a',
                    'explanation' => 'Route::apiResource() exclut les routes HTML create et edit pour ne retenir que les 5 verbes JSON de l’API.',
                ],
            ]
        );

        // Chapitre 2 : Eloquent ORM & Ressources API
        $lesson2 = ModuleLesson::query()->updateOrCreate(
            ['path_step_id' => $step->getKey(), 'order_index' => 2],
            [
                'title' => 'Eloquent ORM & Transformation JSON',
                'summary' => 'Interagir avec la base PostgreSQL et découpler le schéma interne du contrat d’API.',
                'key_points' => [
                    'Eloquent mappe les tables relationnelles en classes de modèles PHP typées.',
                    'with() précharge les relations (Eager Loading) pour éliminer le problème de requêtes N+1.',
                    'JsonResource découple le schéma interne de la base de données du contrat d’API public.',
                    'DB::transaction() assure l’intégrité transactionnelle lors des mutations critiques.',
                ],
                'content' => "L’ORM Eloquent offre un pont expressif entre les structures de données PostgreSQL et les représentations JSON attendues par le front-end.",
                'example_code' => 'use App\Models\LearningPath;' . "\n" . 'use App\Http\Resources\LearningPathResource;' . "\n\n" . '$path = LearningPath::query()' . "\n" . '    ->with([\'steps\' => fn ($query) => $query->orderBy(\'order_index\')])' . "\n" . '    ->where(\'published\', true)' . "\n" . '    ->findOrFail($pathId);' . "\n\n" . 'return new LearningPathResource($path);',
                'example_explanation' => "L’instruction with() charge les étapes ordonnées en deux requêtes SQL optimisées, éliminant tout risque de surcoût N+1.",
                'estimated_minutes' => 25,
            ]
        );

        LessonExercise::query()->updateOrCreate(
            ['module_lesson_id' => $lesson2->getKey(), 'order_index' => 1],
            [
                'title' => 'Quiz : Optimisation N+1 avec Eloquent',
                'instructions' => 'Comment appelle-t-on le chargement préalable des relations dans Eloquent pour éviter d’exécuter une requête SQL par élément ?',
                'starter_code' => null,
                'validation_type' => 'qcm',
                'validation_rules' => [
                    'options' => [
                        ['id' => 'a', 'label' => 'L’Eager Loading (chargement anticipé)'],
                        ['id' => 'b', 'label' => 'Le Lazy Loading (chargement tardif)'],
                        ['id' => 'c', 'label' => 'Le Sharding de base de données'],
                        ['id' => 'd', 'label' => 'La réplication transactionnelle'],
                    ],
                    'correct' => 'a',
                    'explanation' => 'L’Eager Loading (via with()) regroupe le chargement des modèles enfants en une requête SQL optimisée.',
                ],
            ]
        );
    }
}
