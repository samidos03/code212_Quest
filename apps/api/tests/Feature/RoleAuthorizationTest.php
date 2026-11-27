<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ForgeCategory;
use App\Models\ForgeReport;
use App\Models\ForgeSolution;
use App\Models\ForgeThread;
use App\Models\Submission;
use App\Support\XpSource;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Roles et autorisations : apprenant, formateur, moderateur, administrateur.
 */
class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::SUBMISSION_APPROVED, 50);
    }

    #[Test]
    public function un_apprenant_ne_peut_pas_acceder_aux_routes_d_administration(): void
    {
        Sanctum::actingAs($this->makeUser(['roles' => ['student']]), ['read', 'write']);

        $this->getJson('/api/v1/admin/analytics')->assertForbidden();
        $this->getJson('/api/v1/admin/students')->assertForbidden();
        $this->getJson('/api/v1/admin/rules/xp')->assertForbidden();
    }

    #[Test]
    public function un_administrateur_accede_aux_statistiques(): void
    {
        Sanctum::actingAs($this->makeUser(['roles' => ['admin']]), ['read', 'write']);

        $this->getJson('/api/v1/admin/analytics')->assertOk();
        $this->getJson('/api/v1/admin/students')->assertOk();
    }

    #[Test]
    public function un_formateur_peut_approuver_une_production(): void
    {
        $apprenant = $this->makeUser(['roles' => ['student']]);
        $formateur = $this->makeUser(['roles' => ['trainer']]);

        $submission = Submission::create([
            'user_id' => $apprenant->getKey(),
            'title' => 'Production a corriger',
            'body' => 'Voici mon travail.',
            'status' => 'en_attente',
            'xp_reward' => 50,
            'germes_reward' => 0,
        ]);

        Sanctum::actingAs($formateur, ['read', 'write']);

        $this->postJson("/api/v1/submissions/{$submission->getKey()}/approve", [
            'decision' => 'approuvee',
            'feedback' => 'Bon travail.',
        ])->assertOk();

        $this->assertSame('approuvee', $submission->refresh()->status);
        $this->assertSame(50, (int) $apprenant->refresh()->xp_total);
    }

    #[Test]
    public function un_apprenant_ne_peut_pas_approuver_une_production(): void
    {
        $apprenant = $this->makeUser(['roles' => ['student']]);

        $submission = Submission::create([
            'user_id' => $apprenant->getKey(),
            'title' => 'Production',
            'body' => 'Contenu.',
            'status' => 'en_attente',
            'xp_reward' => 50,
            'germes_reward' => 0,
        ]);

        Sanctum::actingAs($apprenant, ['read', 'write']);

        $this->postJson("/api/v1/submissions/{$submission->getKey()}/approve")->assertForbidden();
    }

    #[Test]
    public function un_moderateur_peut_voir_les_signalements_mais_pas_les_etudiants(): void
    {
        $moderateur = $this->makeUser(['roles' => ['moderator']]);

        Sanctum::actingAs($moderateur, ['read', 'write']);

        $this->getJson('/api/v1/admin/moderation/reports')->assertOk();
        $this->getJson('/api/v1/admin/students')->assertForbidden();
    }

    #[Test]
    public function un_apprenant_ne_peut_pas_creer_de_quete(): void
    {
        Sanctum::actingAs($this->makeUser(['roles' => ['student']]), ['read', 'write']);

        $this->postJson('/api/v1/quests', [
            'code' => 'Q-INTERDITE',
            'titre' => 'Quete interdite',
            'difficulte' => 'debutant',
            'etapes' => [['titre' => 'Etape', 'type' => 'qcm']],
        ])->assertForbidden();
    }

    #[Test]
    public function les_routes_publiques_ne_requierent_pas_de_jeton(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'identifiant' => 'inconnu@uca.ma',
            'mot_de_passe' => 'motdepasse123',
        ])->assertStatus(401);
    }

    #[Test]
    public function un_signalement_de_forge_cible_exclusivement_un_fil_ou_une_solution(): void
    {
        $apprenant = $this->makeUser(['roles' => ['student']]);

        $category = ForgeCategory::create([
            'code' => 'forge-role-test',
            'name' => 'Forge de test',
            'description' => null,
            'color' => '#c5027f',
            'icon' => 'cpu',
            'position' => 1,
        ]);

        $thread = ForgeThread::create([
            'category_id' => $category->getKey(),
            'author_id' => $apprenant->getKey(),
            'title' => 'Un fil signale',
            'body' => 'Contenu du fil a signaler.',
            'status' => 'ouverte',
            'tags' => [],
        ]);

        Sanctum::actingAs($apprenant, ['read', 'write']);

        $this->postJson("/api/v1/forge/threads/{$thread->getKey()}/report", [
            'raison' => 'Contenu hors sujet et injurieux.',
        ])->assertCreated();

        $report = ForgeReport::query()->firstOrFail();

        $this->assertSame((int) $thread->getKey(), (int) $report->thread_id);
        $this->assertNull($report->solution_id);
    }

    #[Test]
    public function la_base_interdit_un_signalement_avec_deux_cibles(): void
    {
        $apprenant = $this->makeUser(['roles' => ['student']]);

        $category = ForgeCategory::create([
            'code' => 'forge-role-test-2',
            'name' => 'Forge de test 2',
            'description' => null,
            'color' => '#00dfff',
            'icon' => 'bug',
            'position' => 2,
        ]);

        $thread = ForgeThread::create([
            'category_id' => $category->getKey(),
            'author_id' => $apprenant->getKey(),
            'title' => 'Un autre fil',
            'body' => 'Contenu du fil.',
            'status' => 'ouverte',
            'tags' => [],
        ]);

        $solution = ForgeSolution::create([
            'thread_id' => $thread->getKey(),
            'author_id' => $apprenant->getKey(),
            'body' => 'Une solution de test.',
            'code_snippet' => null,
        ]);

        $this->expectException(QueryException::class);

        DB::table('forge_reports')->insert([
            'thread_id' => $thread->getKey(),
            'solution_id' => $solution->getKey(),
            'reporter_id' => $apprenant->getKey(),
            'reason' => 'Signalement invalide.',
            'status' => 'ouverte',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
