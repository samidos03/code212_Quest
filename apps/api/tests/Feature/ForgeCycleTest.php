<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\ForgeCategory;
use App\Models\ForgeReport;
use App\Models\User;
use Database\Seeders\ForgeCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Cycle réel de la Forge via l'API : fil → réponse → solution acceptée,
 * permissions, validations et signalement.
 */
class ForgeCycleTest extends TestCase
{
    use RefreshDatabase;

    private User $asker;

    private User $helper;

    private User $other;

    private int $categoryId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seed(ForgeCategorySeeder::class);
        $this->categoryId = (int) ForgeCategory::query()->value('id');

        $this->asker = $this->makeUser();
        $this->helper = $this->makeUser();
        $this->other = $this->makeUser();
    }

    #[Test]
    public function fil_reponse_puis_solution_acceptee_par_le_demandeur(): void
    {
        $threadId = $this->createThread();

        $this->signIn($this->helper);
        $solutionId = $this->postJson("/api/v1/forge/threads/{$threadId}/replies", [
            'contenu' => 'Ajoute await devant fetch puis vérifie response.ok avant de lire le JSON.',
        ])->assertCreated()->assertJsonPath('data.acceptee', false)->json('data.id');

        $this->assertSame(1, AuditLog::query()->where('action', 'forge.reply_created')->count());

        // Un tiers ne peut pas choisir la solution à la place du demandeur.
        $this->signIn($this->other);
        $this->postJson("/api/v1/forge/solutions/{$solutionId}/accept")->assertForbidden();

        // L'auteur de la réponse ne peut pas s'auto-valider.
        $this->signIn($this->helper);
        $this->postJson("/api/v1/forge/solutions/{$solutionId}/accept")->assertStatus(403);

        $this->signIn($this->asker);
        $this->postJson("/api/v1/forge/solutions/{$solutionId}/accept", ['note' => 'Merci, ça marche.'])
            ->assertOk()
            ->assertJsonPath('data.acceptee', true);

        $this->getJson("/api/v1/forge/threads/{$threadId}")
            ->assertOk()
            ->assertJsonPath('data.statut', 'resolue')
            ->assertJsonPath('data.solutions.0.acceptee', true);

        // Une seule solution acceptée par fil.
        $this->signIn($this->other);
        $second = $this->postJson("/api/v1/forge/threads/{$threadId}/replies", [
            'contenu' => 'Autre piste : utiliser .then() et gérer le catch explicitement.',
        ])->assertCreated()->json('data.id');

        $this->signIn($this->asker);
        $this->postJson("/api/v1/forge/solutions/{$second}/accept")->assertStatus(409);
    }

    #[Test]
    public function les_contributions_trop_courtes_sont_refusees_en_422(): void
    {
        $this->signIn($this->asker);
        $this->postJson('/api/v1/forge/threads', ['categorie_id' => $this->categoryId, 'titre' => 'Aide', 'contenu' => 'court'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['titre', 'contenu']);

        $threadId = $this->createThread();
        $this->postJson("/api/v1/forge/threads/{$threadId}/replies", ['contenu' => 'ok'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('contenu');
    }

    #[Test]
    public function signalement_avec_motif_unique_et_cible_verifiee(): void
    {
        $threadId = $this->createThread();
        $otherThreadId = $this->createThread('Autre question sur Flexbox et gap');

        $this->signIn($this->helper);
        $foreignSolution = $this->postJson("/api/v1/forge/threads/{$otherThreadId}/replies", [
            'contenu' => 'Réponse placée sur un autre fil que celui signalé.',
        ])->json('data.id');

        $this->signIn($this->other);
        $this->postJson("/api/v1/forge/threads/{$threadId}/report", ['raison' => 'spam'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('raison');

        $this->postJson("/api/v1/forge/threads/{$threadId}/report", ['raison' => 'Lien publicitaire sans rapport.', 'solution_id' => $foreignSolution])
            ->assertStatus(422)
            ->assertJsonValidationErrors('solution_id');

        $this->postJson("/api/v1/forge/threads/{$threadId}/report", ['raison' => 'Lien publicitaire sans rapport.'])
            ->assertCreated()
            ->assertJsonPath('data.statut', 'ouverte');

        $this->postJson("/api/v1/forge/threads/{$threadId}/report", ['raison' => 'Je le signale une deuxième fois.'])
            ->assertStatus(409);

        $this->assertSame(1, ForgeReport::query()->count());
    }

    private function createThread(string $title = 'Fetch renvoie une promesse vide'): int
    {
        $this->signIn($this->asker);

        return (int) $this->postJson('/api/v1/forge/threads', [
            'categorie_id' => $this->categoryId,
            'titre' => $title,
            'contenu' => "Contexte : page Parcours.\nCode : const d = fetch('/api').json()\nAttendu : la liste des modules.\nDéjà essayé : console.log(d).",
            'tags' => ['javascript'],
        ])->assertCreated()->json('data.id');
    }

    private function signIn(User $user): void
    {
        Sanctum::actingAs($user, ['read', 'write']);
    }
}
