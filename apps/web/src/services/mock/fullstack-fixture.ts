/**
 * Contenu du parcours Full-Stack pour le mode mock.
 *
 * Généré à partir de apps/api/database/seeders/LearningPathSeeder.php
 * (base seedée, identifiants identiques). À régénérer quand le seeder change.
 * Les bonnes réponses ne servent qu'à simuler la correction côté mock : en
 * mode API, elles ne quittent jamais le serveur.
 */

export interface MockQcmQuestion {
  id: string
  question: string
  options: { id: string; label: string }[]
  correct: string
  explanation: string
}

export interface MockExercise {
  id: number
  title: string
  order: number
  pool: MockQcmQuestion[]
}

export interface MockLesson {
  id: number
  title: string
  summary: string
  keyPoints: string[]
  content: string
  exampleCode: string
  exampleExplanation: string
  order: number
  durationMinutes: number
  exercises: MockExercise[]
}

export interface MockModule {
  id: number
  order: number
  title: string
  description: string
  finalQuest: { id: number; code: string; title: string; description: string; stepId: number; xp: number; germs: number }
  lessons: MockLesson[]
}

export const FULLSTACK_PATH_ID = 1

export const fullStackModules: MockModule[] = [
  {
    "id": 1,
    "order": 1,
    "title": "Module 1 : Fondations Web (HTML & CSS Modernes)",
    "description": "Maîtriser la sémantique HTML5, la mise en page Flexbox et soumettre votre première quête validée par un formateur.",
    "finalQuest": {
      "id": 1,
      "code": "Q-FULLSTACK-001",
      "title": "Quête finale : Page de profil responsive",
      "description": "Quête finale du Module 1 : Concevez une carte de profil utilisateur responsive et sémantique en HTML5 et CSS Flexbox.",
      "stepId": 1,
      "xp": 150,
      "germs": 30
    },
    "lessons": [
      {
        "id": 1,
        "title": "Structure & Sémantique HTML5",
        "summary": "Organiser un document web avec des repères sémantiques clairs et accessibles.",
        "keyPoints": [
          "<main> identifie le contenu central et unique de la page web.",
          "<article> encapsule un contenu autonome et réutilisable (carte, billet de blog).",
          "<section> regroupe des éléments thématiques connexes avec leur propre titre.",
          "L’accessibilité (a11y) s’appuie sur les balises natives pour les lecteurs d’écran."
        ],
        "content": "En HTML5 moderne, la structure d’un document repose sur des balises sémantiques qui donnent un sens explicite au contenu pour les navigateurs, les moteurs d'indexation et les technologies d'assistance.",
        "exampleCode": "<main class=\"content-wrapper\">\n  <article class=\"mission-card\">\n    <header>\n      <h2>Déploiement du Noyau Orbital</h2>\n      <time datetime=\"2026-11-27\">27 nov. 2026</time>\n    </header>\n    <p>Initialisation des micro-services de communication avec la station sol.</p>\n    <footer>\n      <span class=\"badge\">Architecture V1</span>\n    </footer>\n  </article>\n</main>",
        "exampleExplanation": "Chaque balise (<main>, <article>, <header>, <footer>) explicite directement sa portée structurelle sans classes CSS artificielles requises pour les technologies d’assistance.",
        "order": 1,
        "durationMinutes": 15,
        "exercises": [
          {
            "id": 1,
            "title": "Quiz : Sémantique HTML5",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Quelle balise HTML5 est spécialement dédiée à englober le bloc de contenu principal et unique d’une page web ?",
                "options": [
                  {
                    "id": "a",
                    "label": "<section>"
                  },
                  {
                    "id": "b",
                    "label": "<main>"
                  },
                  {
                    "id": "c",
                    "label": "<div>"
                  },
                  {
                    "id": "d",
                    "label": "<content>"
                  }
                ],
                "correct": "b",
                "explanation": "La balise <main> identifie formellement le contenu principal unique du document."
              },
              {
                "id": "q2",
                "question": "Quelle balise convient pour une carte de quête autonome qui garde son sens si on la déplace ailleurs ?",
                "options": [
                  {
                    "id": "a",
                    "label": "<article>"
                  },
                  {
                    "id": "b",
                    "label": "<aside>"
                  },
                  {
                    "id": "c",
                    "label": "<span>"
                  },
                  {
                    "id": "d",
                    "label": "<nav>"
                  }
                ],
                "correct": "a",
                "explanation": "<article> représente un contenu autonome et réutilisable."
              },
              {
                "id": "q3",
                "question": "Un lecteur d’écran doit annoncer le menu principal du site. Quelle balise l’entoure ?",
                "options": [
                  {
                    "id": "a",
                    "label": "<menu-bar>"
                  },
                  {
                    "id": "b",
                    "label": "<nav>"
                  },
                  {
                    "id": "c",
                    "label": "<header>"
                  },
                  {
                    "id": "d",
                    "label": "<ul> seule"
                  }
                ],
                "correct": "b",
                "explanation": "<nav> signale un bloc de liens de navigation principal."
              }
            ]
          }
        ]
      },
      {
        "id": 2,
        "title": "Alignement & Mise en Page avec Flexbox",
        "summary": "Maîtriser le positionnement flexible, l’alignement transversal et les espaces responsives.",
        "keyPoints": [
          "display: flex active le modèle de boîte flexible unidimensionnel.",
          "justify-content contrôle la distribution le long de l’axe principal (row ou column).",
          "align-items positionne et aligne les éléments sur l’axe transversal.",
          "gap définit un espacement uniforme et propre sans marges parasites."
        ],
        "content": "Flexbox simplifie la disposition et le centrage horizontal et vertical des composants sur tous les formats d’écran.",
        "exampleCode": ".toolbar-actions {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1.25rem;\n  padding: 1rem;\n}",
        "exampleExplanation": "Le conteneur distribue les boutons aux extrémités (space-between), les centre sur la hauteur (align-items: center) et garantit 1.25rem d'espace régulier.",
        "order": 2,
        "durationMinutes": 20,
        "exercises": [
          {
            "id": 2,
            "title": "Quiz : Alignement Flexbox",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Dans un conteneur en ligne (display: flex), quelle propriété CSS contrôle l’alignement des enfants sur l’axe transversal vertical ?",
                "options": [
                  {
                    "id": "a",
                    "label": "align-items"
                  },
                  {
                    "id": "b",
                    "label": "justify-content"
                  },
                  {
                    "id": "c",
                    "label": "flex-align"
                  },
                  {
                    "id": "d",
                    "label": "text-align"
                  }
                ],
                "correct": "a",
                "explanation": "align-items régit l’axe transversal, tandis que justify-content gère l’axe principal."
              },
              {
                "id": "q2",
                "question": "Quelle propriété ajoute un espace régulier entre les enfants d’un conteneur flex sans marges ?",
                "options": [
                  {
                    "id": "a",
                    "label": "padding"
                  },
                  {
                    "id": "b",
                    "label": "margin-inline"
                  },
                  {
                    "id": "c",
                    "label": "gap"
                  },
                  {
                    "id": "d",
                    "label": "spacing"
                  }
                ],
                "correct": "c",
                "explanation": "gap espace les enfants sans ajouter de marge sur les bords."
              },
              {
                "id": "q3",
                "question": "Avec flex-direction: column, quel axe contrôle justify-content ?",
                "options": [
                  {
                    "id": "a",
                    "label": "L’axe horizontal"
                  },
                  {
                    "id": "b",
                    "label": "L’axe vertical"
                  },
                  {
                    "id": "c",
                    "label": "Aucun axe"
                  },
                  {
                    "id": "d",
                    "label": "Les deux axes"
                  }
                ],
                "correct": "b",
                "explanation": "justify-content suit l’axe principal, qui devient vertical en colonne."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "order": 2,
    "title": "Module 2 : Dynamique Frontend (JavaScript ES6+)",
    "description": "Interactions DOM, événements et asynchronisme. Verrouillé jusqu à validation du Module 1.",
    "finalQuest": {
      "id": 2,
      "code": "Q-FULLSTACK-002",
      "title": "Quête finale : Application interactive de filtrage",
      "description": "Quête finale du Module 2 : Construisez un composant interactif en JavaScript pur manipulant le DOM et consommant une API en asynchrone.",
      "stepId": 2,
      "xp": 160,
      "germs": 32
    },
    "lessons": [
      {
        "id": 3,
        "title": "Manipulation du DOM & Écouteurs d’Événements",
        "summary": "Rendre vos pages interactives et réactives en réponse aux actions des utilisateurs.",
        "keyPoints": [
          "document.querySelector() sélectionne un élément DOM via un sélecteur CSS standard.",
          "addEventListener() attache un observateur sans écraser les gestionnaires déjà en place.",
          "event.preventDefault() bloque l’action par défaut (ex: soumission synchrone de formulaire).",
          "element.classList.toggle() bascule un état graphique proprement."
        ],
        "content": "JavaScript connecte la logique de programmation aux éléments visuels du navigateur en interceptant les signaux émis par les actions de l'utilisateur.",
        "exampleCode": "const filterButton = document.querySelector('#btn-toggle-filters');\nconst sidebar = document.querySelector('.filters-panel');\n\nfilterButton.addEventListener('click', (event) => {\n  event.preventDefault();\n  const isOpen = sidebar.classList.toggle('is-visible');\n  filterButton.setAttribute('aria-expanded', String(isOpen));\n});",
        "exampleExplanation": "L’écouteur intercepte le clic, commute la classe CSS de visibilité et synchronise l’attribut d’accessibilité aria-expanded.",
        "order": 1,
        "durationMinutes": 20,
        "exercises": [
          {
            "id": 3,
            "title": "Quiz : Gestion des Événements DOM",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Quelle méthode permet d’empêcher la soumission synchrone par défaut d’un formulaire HTML dans un écouteur d’événement ?",
                "options": [
                  {
                    "id": "a",
                    "label": "event.preventDefault()"
                  },
                  {
                    "id": "b",
                    "label": "event.stopPropagation()"
                  },
                  {
                    "id": "c",
                    "label": "window.cancelAction()"
                  },
                  {
                    "id": "d",
                    "label": "form.abort()"
                  }
                ],
                "correct": "a",
                "explanation": "preventDefault() neutralise le comportement par défaut défini par le navigateur."
              },
              {
                "id": "q2",
                "question": "Quelle méthode renvoie le premier élément qui correspond au sélecteur CSS « .btn-valider » ?",
                "options": [
                  {
                    "id": "a",
                    "label": "document.getElementsByClassName('.btn-valider')"
                  },
                  {
                    "id": "b",
                    "label": "document.querySelector('.btn-valider')"
                  },
                  {
                    "id": "c",
                    "label": "document.find('.btn-valider')"
                  },
                  {
                    "id": "d",
                    "label": "document.select('.btn-valider')"
                  }
                ],
                "correct": "b",
                "explanation": "querySelector accepte un sélecteur CSS et renvoie le premier élément trouvé."
              },
              {
                "id": "q3",
                "question": "Pourquoi préférer addEventListener à element.onclick = ... ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Il est plus rapide à l’exécution"
                  },
                  {
                    "id": "b",
                    "label": "Il permet plusieurs écouteurs sur le même événement"
                  },
                  {
                    "id": "c",
                    "label": "Il fonctionne sans navigateur"
                  },
                  {
                    "id": "d",
                    "label": "Il empêche les erreurs JavaScript"
                  }
                ],
                "correct": "b",
                "explanation": "addEventListener ajoute un écouteur sans remplacer ceux déjà attachés."
              }
            ]
          }
        ]
      },
      {
        "id": 4,
        "title": "Asynchronisme avec Fetch & Async/Await",
        "summary": "Consommer des API distantes et gérer les données JSON sans figer l’interface.",
        "keyPoints": [
          "fetch() déclenche une requête HTTP asynchrone et renvoie une promesse (Promise).",
          "async / await offre une écriture séquentielle et hautement lisible pour le flux asynchrone.",
          "response.ok vérifie si le code de statut HTTP se situe dans l’intervalle de succès 200–299.",
          "Le bloc try / catch intercepte et isole proprement les erreurs réseau."
        ],
        "content": "L’asynchronisme permet aux applications frontales de dialoguer avec des serveurs d’API en temps réel sans jamais interrompre la réactivité de l’affichage.",
        "exampleCode": "async function loadQuestDetails(questId) {\n  try {\n    const res = await fetch(`/api/v1/quests/${questId}`, {\n      headers: { 'Accept': 'application/json' },\n    });\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const { data } = await res.json();\n    return data;\n  } catch (err) {\n    console.error('Impossible de charger la quête :', err.message);\n    return null;\n  }\n}",
        "exampleExplanation": "L’appel combiné de await fetch() et de la vérification res.ok garantit un traitement des réponses robuste et résistant aux pannes.",
        "order": 2,
        "durationMinutes": 25,
        "exercises": [
          {
            "id": 4,
            "title": "Quiz : Statut HTTP avec Fetch",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Que vérifie la propriété booléenne response.ok retournée par l’appel fetch() ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Si le code HTTP est compris entre 200 et 299"
                  },
                  {
                    "id": "b",
                    "label": "Si la réponse contient un JSON valide"
                  },
                  {
                    "id": "c",
                    "label": "Si le temps de latence est sous 200ms"
                  },
                  {
                    "id": "d",
                    "label": "Si le token d’authentification est valide"
                  }
                ],
                "correct": "a",
                "explanation": "response.ok est true uniquement pour les statuts HTTP de succès compris entre 200 et 299."
              },
              {
                "id": "q2",
                "question": "fetch() reçoit une réponse 404. Que se passe-t-il par défaut ?",
                "options": [
                  {
                    "id": "a",
                    "label": "La promesse est rejetée"
                  },
                  {
                    "id": "b",
                    "label": "La promesse est résolue avec response.ok à false"
                  },
                  {
                    "id": "c",
                    "label": "Le navigateur recharge la page"
                  },
                  {
                    "id": "d",
                    "label": "Une exception est levée côté serveur"
                  }
                ],
                "correct": "b",
                "explanation": "fetch ne rejette qu’en cas d’erreur réseau ; il faut tester response.ok."
              },
              {
                "id": "q3",
                "question": "Que fait « await » devant un appel qui renvoie une promesse ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Il annule la promesse"
                  },
                  {
                    "id": "b",
                    "label": "Il attend sa résolution et renvoie la valeur"
                  },
                  {
                    "id": "c",
                    "label": "Il exécute l’appel deux fois"
                  },
                  {
                    "id": "d",
                    "label": "Il convertit la réponse en JSON"
                  }
                ],
                "correct": "b",
                "explanation": "await suspend la fonction async jusqu’à la résolution de la promesse."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "order": 3,
    "title": "Module 3 : Backend & API (PHP & Laravel)",
    "description": "Modélisation relationnelle, contrôleurs et API REST. Verrouillé jusqu à validation du Module 2.",
    "finalQuest": {
      "id": 3,
      "code": "Q-FULLSTACK-003",
      "title": "Quête finale : API RESTful sécurisée avec Laravel",
      "description": "Quête finale du Module 3 : Développez un contrôleur d’API Laravel avec validation FormRequest, relations Eloquent et ressource JSON normée.",
      "stepId": 3,
      "xp": 180,
      "germs": 36
    },
    "lessons": [
      {
        "id": 5,
        "title": "Routage RESTful & Contrôleurs Laravel",
        "summary": "Concevoir des points d’entrée d’API prévisibles, cohérents et sécurisés.",
        "keyPoints": [
          "Route::apiResource() déclare les 5 endpoints CRUD standard pour les API.",
          "Les contrôleurs d’API sérialisent les données dans une enveloppe JSON { data } normée.",
          "Le Route Model Binding résout automatiquement l’entité Eloquent depuis l’URI.",
          "L’autorisation d’action s’effectue via les Policies avant l’exécution de la logique."
        ],
        "content": "Laravel structure le développement d’API modernes grâce à un routeur expressif et des contrôleurs dédiés à la manipulation de charges JSON.",
        "exampleCode": "namespace App\\Http\\Controllers\\Api\\V1;\n\nuse App\\Http\\Resources\\QuestResource;\nuse App\\Models\\Quest;\n\nclass QuestController extends Controller\n{\n    public function show(Quest $quest): QuestResource\n    {\n        $this->authorize('view', $quest);\n        return new QuestResource($quest->load('steps'));\n    }\n}",
        "exampleExplanation": "Le contrôleur s’appuie sur le Route Model Binding, valide la politique d’accès et délègue la transformation JSON à la ressource d’API.",
        "order": 1,
        "durationMinutes": 20,
        "exercises": [
          {
            "id": 5,
            "title": "Quiz : Routage REST dans Laravel",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Quelle méthode du routeur Laravel déclare automatiquement les routes CRUD pour une API sans créer les routes HTML create et edit ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Route::apiResource(...)"
                  },
                  {
                    "id": "b",
                    "label": "Route::resource(...)"
                  },
                  {
                    "id": "c",
                    "label": "Route::crud(...)"
                  },
                  {
                    "id": "d",
                    "label": "Route::restEndpoint(...)"
                  }
                ],
                "correct": "a",
                "explanation": "Route::apiResource() exclut les routes HTML create et edit pour ne retenir que les 5 verbes JSON de l’API."
              },
              {
                "id": "q2",
                "question": "Quel verbe HTTP utilise la route qui met à jour une ressource existante avec apiResource ?",
                "options": [
                  {
                    "id": "a",
                    "label": "POST"
                  },
                  {
                    "id": "b",
                    "label": "GET"
                  },
                  {
                    "id": "c",
                    "label": "PUT/PATCH"
                  },
                  {
                    "id": "d",
                    "label": "DELETE"
                  }
                ],
                "correct": "c",
                "explanation": "apiResource associe update aux verbes PUT et PATCH."
              },
              {
                "id": "q3",
                "question": "Dans Route::get('quests/{quest}', ...), que fait le Route Model Binding ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Il valide le JSON reçu"
                  },
                  {
                    "id": "b",
                    "label": "Il charge le modèle Quest correspondant à l’identifiant"
                  },
                  {
                    "id": "c",
                    "label": "Il crée la table quests"
                  },
                  {
                    "id": "d",
                    "label": "Il met la réponse en cache"
                  }
                ],
                "correct": "b",
                "explanation": "Laravel résout {quest} en instance du modèle, ou renvoie 404."
              }
            ]
          }
        ]
      },
      {
        "id": 6,
        "title": "Eloquent ORM & Transformation JSON",
        "summary": "Interagir avec la base PostgreSQL et découpler le schéma interne du contrat d’API.",
        "keyPoints": [
          "Eloquent mappe les tables relationnelles en classes de modèles PHP typées.",
          "with() précharge les relations (Eager Loading) pour éliminer le problème de requêtes N+1.",
          "JsonResource découple le schéma interne de la base de données du contrat d’API public.",
          "DB::transaction() assure l’intégrité transactionnelle lors des mutations critiques."
        ],
        "content": "L’ORM Eloquent offre un pont expressif entre les structures de données PostgreSQL et les représentations JSON attendues par le front-end.",
        "exampleCode": "use App\\Models\\LearningPath;\nuse App\\Http\\Resources\\LearningPathResource;\n\n$path = LearningPath::query()\n    ->with(['steps' => fn ($query) => $query->orderBy('order_index')])\n    ->where('published', true)\n    ->findOrFail($pathId);\n\nreturn new LearningPathResource($path);",
        "exampleExplanation": "L’instruction with() charge les étapes ordonnées en deux requêtes SQL optimisées, éliminant tout risque de surcoût N+1.",
        "order": 2,
        "durationMinutes": 25,
        "exercises": [
          {
            "id": 6,
            "title": "Quiz : Optimisation N+1 avec Eloquent",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Comment appelle-t-on le chargement préalable des relations dans Eloquent pour éviter d’exécuter une requête SQL par élément ?",
                "options": [
                  {
                    "id": "a",
                    "label": "L’Eager Loading (chargement anticipé)"
                  },
                  {
                    "id": "b",
                    "label": "Le Lazy Loading (chargement tardif)"
                  },
                  {
                    "id": "c",
                    "label": "Le Sharding de base de données"
                  },
                  {
                    "id": "d",
                    "label": "La réplication transactionnelle"
                  }
                ],
                "correct": "a",
                "explanation": "L’Eager Loading (via with()) regroupe le chargement des modèles enfants en une requête SQL optimisée."
              },
              {
                "id": "q2",
                "question": "Quel rôle joue une JsonResource dans une API Laravel ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Elle exécute les migrations"
                  },
                  {
                    "id": "b",
                    "label": "Elle contrôle la forme du JSON renvoyé au client"
                  },
                  {
                    "id": "c",
                    "label": "Elle chiffre la base de données"
                  },
                  {
                    "id": "d",
                    "label": "Elle remplace les contrôleurs"
                  }
                ],
                "correct": "b",
                "explanation": "La ressource découple le schéma interne du contrat exposé."
              },
              {
                "id": "q3",
                "question": "Pourquoi entourer une approbation qui écrit XP et statut d’un DB::transaction() ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Pour accélérer les requêtes"
                  },
                  {
                    "id": "b",
                    "label": "Pour que tout soit enregistré, ou rien en cas d’erreur"
                  },
                  {
                    "id": "c",
                    "label": "Pour contourner les contraintes SQL"
                  },
                  {
                    "id": "d",
                    "label": "Pour journaliser les requêtes"
                  }
                ],
                "correct": "b",
                "explanation": "La transaction garantit que les écritures liées réussissent ou échouent ensemble."
              }
            ]
          }
        ]
      },
      {
        "id": 7,
        "title": "SQL relationnel : requêtes, jointures et contraintes",
        "summary": "Lire et écrire les requêtes SQL qu’Eloquent génère, et laisser PostgreSQL protéger les données.",
        "keyPoints": [
          "SELECT … WHERE filtre les lignes ; ORDER BY et LIMIT bornent le résultat.",
          "INNER JOIN relie deux tables par une clé étrangère et ne garde que les lignes appariées.",
          "Une contrainte UNIQUE ou CHECK refuse une donnée invalide même si le code oublie de la vérifier.",
          "Un index sur les colonnes filtrées évite de parcourir toute la table."
        ],
        "content": "Eloquent écrit le SQL pour vous, mais c’est PostgreSQL qui l’exécute. Savoir lire une requête permet de repérer un N+1, une jointure manquante ou un filtre non indexé, et de placer les règles critiques (unicité, bornes) directement dans le schéma.",
        "exampleCode": "-- Apprenants ayant au moins une soumission en attente sur une quête\nSELECT u.pseudonym, q.title, s.submitted_at\nFROM quest_submissions s\nINNER JOIN users  u ON u.id = s.user_id\nINNER JOIN quests q ON q.id = s.quest_id\nWHERE s.status = 'en_attente'\nORDER BY s.submitted_at ASC\nLIMIT 20;\n\n-- Une seule inscription par apprenant et par parcours\nALTER TABLE learning_path_enrollments\n  ADD CONSTRAINT enrollments_user_path_unique UNIQUE (user_id, learning_path_id);",
        "exampleExplanation": "La première requête construit la file de revue la plus ancienne d’abord. La contrainte UNIQUE empêche une double inscription, même si deux requêtes arrivent en même temps.",
        "order": 3,
        "durationMinutes": 25,
        "exercises": [
          {
            "id": 7,
            "title": "Quiz : Requêtes SQL et contraintes",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Quelle clause garde uniquement les lignes qui ont une correspondance dans les deux tables ?",
                "options": [
                  {
                    "id": "a",
                    "label": "LEFT JOIN"
                  },
                  {
                    "id": "b",
                    "label": "INNER JOIN"
                  },
                  {
                    "id": "c",
                    "label": "UNION"
                  },
                  {
                    "id": "d",
                    "label": "GROUP BY"
                  }
                ],
                "correct": "b",
                "explanation": "INNER JOIN ne conserve que les lignes appariées des deux côtés."
              },
              {
                "id": "q2",
                "question": "Où placer la règle « une seule inscription par apprenant et par parcours » pour qu’elle tienne même sous charge ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Dans un commentaire du contrôleur"
                  },
                  {
                    "id": "b",
                    "label": "Dans une contrainte UNIQUE en base"
                  },
                  {
                    "id": "c",
                    "label": "Dans le localStorage du navigateur"
                  },
                  {
                    "id": "d",
                    "label": "Dans le fichier .env"
                  }
                ],
                "correct": "b",
                "explanation": "Seule la base garantit l’unicité face aux requêtes concurrentes."
              },
              {
                "id": "q3",
                "question": "Une requête filtre souvent sur status et submitted_at. Quelle action réduit son coût ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Ajouter un index sur ces colonnes"
                  },
                  {
                    "id": "b",
                    "label": "Ajouter SELECT *"
                  },
                  {
                    "id": "c",
                    "label": "Supprimer la clé primaire"
                  },
                  {
                    "id": "d",
                    "label": "Passer la colonne en TEXT"
                  }
                ],
                "correct": "a",
                "explanation": "Un index permet à PostgreSQL de ne lire que les lignes utiles."
              }
            ]
          }
        ]
      },
      {
        "id": 8,
        "title": "Relier le frontend React à l’API Laravel",
        "summary": "Appeler l’API avec un jeton, lire l’enveloppe { data } et afficher les erreurs de validation 422.",
        "keyPoints": [
          "Le jeton Sanctum part dans l’en-tête Authorization: Bearer <jeton>.",
          "Les réponses réussies sont enveloppées dans { data } ; les erreurs dans { message, errors }.",
          "Un 422 détaille les champs invalides : on les affiche à côté du champ concerné.",
          "Un même service API sert le mode mock et le mode réel (VITE_USE_MOCK)."
        ],
        "content": "Le frontend ne doit pas deviner l’état du serveur. Il envoie la requête, lit le statut HTTP, puis affiche ce que l’API renvoie : les données, l’erreur de validation ou le message d’accès refusé. Aucune progression n’est stockée dans le navigateur.",
        "exampleCode": "async function submitFinalQuest(questId, stepId, contenu, token) {\n  const res = await fetch(`/api/v1/quests/${questId}/steps/${stepId}/submit`, {\n    method: 'POST',\n    headers: {\n      'Accept': 'application/json',\n      'Content-Type': 'application/json',\n      'Authorization': `Bearer ${token}`,\n    },\n    body: JSON.stringify({ contenu }),\n  });\n\n  const body = await res.json();\n  if (res.status === 422) return { errors: body.errors };\n  if (!res.ok) throw new Error(body.message);\n  return { submission: body.data }; // statut « en_attente »\n}",
        "exampleExplanation": "La fonction distingue la validation (422, erreurs par champ) des autres échecs, et renvoie la soumission en attente telle que l’API l’a enregistrée.",
        "order": 4,
        "durationMinutes": 25,
        "exercises": [
          {
            "id": 8,
            "title": "Quiz : Intégration frontend et API",
            "order": 1,
            "pool": [
              {
                "id": "q1",
                "question": "Où le frontend place-t-il le jeton Sanctum pour appeler une route protégée ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Dans l’URL ?token="
                  },
                  {
                    "id": "b",
                    "label": "Dans l’en-tête Authorization: Bearer"
                  },
                  {
                    "id": "c",
                    "label": "Dans un cookie lisible en JavaScript"
                  },
                  {
                    "id": "d",
                    "label": "Dans le corps de chaque GET"
                  }
                ],
                "correct": "b",
                "explanation": "Les routes auth:sanctum lisent le jeton dans l’en-tête Authorization."
              },
              {
                "id": "q2",
                "question": "L’API répond 422 avec { message, errors }. Que doit faire l’interface ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Afficher les erreurs à côté des champs concernés"
                  },
                  {
                    "id": "b",
                    "label": "Réessayer la requête en boucle"
                  },
                  {
                    "id": "c",
                    "label": "Considérer la soumission comme acceptée"
                  },
                  {
                    "id": "d",
                    "label": "Vider le formulaire sans rien dire"
                  }
                ],
                "correct": "a",
                "explanation": "Le 422 décrit les champs à corriger : on les montre à l’apprenant."
              },
              {
                "id": "q3",
                "question": "Après une soumission de quête, où lire son statut « en attente » ?",
                "options": [
                  {
                    "id": "a",
                    "label": "Dans le localStorage"
                  },
                  {
                    "id": "b",
                    "label": "Dans la réponse de l’API (data.statut)"
                  },
                  {
                    "id": "c",
                    "label": "Dans une variable globale"
                  },
                  {
                    "id": "d",
                    "label": "Dans le titre de la page"
                  }
                ],
                "correct": "b",
                "explanation": "L’état fait foi côté serveur ; le front affiche ce que l’API renvoie."
              }
            ]
          }
        ]
      }
    ]
  }
]
