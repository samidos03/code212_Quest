<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Exceptions\BusinessRuleException;
use App\Exceptions\QuotaExceededException;
use App\Models\AuditLog;
use App\Models\ForgeCategory;
use App\Models\ForgeSolution;
use App\Models\ForgeThread;
use App\Services\ForgeRewardService;
use App\Support\XpSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 5 : recompense La Forge (quotas, auto-validation, audit).
 */
class ForgeRewardQuotaTest extends TestCase
{
    use RefreshDatabase;

    private ForgeRewardService $forge;

    private ForgeCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::FORGE_SOLUTION_REWARDED, 50);

        $this->forge = app(ForgeRewardService::class);

        $this->category = ForgeCategory::create([
            'code' => 'forge-test',
            'name' => 'Forge de test',
            'description' => null,
            'color' => '#c5027f',
            'icon' => 'cpu',
            'position' => 1,
        ]);
    }

    private function makeThread(\App\Models\User $author, string $code = 'thread-1'): ForgeThread
    {
        return ForgeThread::create([
            'category_id' => $this->category->getKey(),
            'author_id' => $author->getKey(),
            'title' => 'Question '.$code,
            'body' => 'Voici ma question, merci de m aider.',
            'status' => 'ouverte',
            'tags' => [],
        ]);
    }

    private function makeSolution(ForgeThread $thread, \App\Models\User $author, string $code = 'solution-1'): ForgeSolution
    {
        return ForgeSolution::create([
            'thread_id' => $thread->getKey(),
            'author_id' => $author->getKey(),
            'body' => 'Voici une solution detaillee au probleme.',
            'code_snippet' => null,
        ]);
    }

    #[Test]
    public function l_auto_validation_est_interdite(): void
    {
        $author = $this->makeUser();
        $thread = $this->makeThread($author);
        $solution = $this->makeSolution($thread, $author);

        $this->expectException(BusinessRuleException::class);

        $this->forge->accept($thread, $solution, $author);
    }

    #[Test]
    public function la_recompense_verse_des_germes_et_du_xp_avec_audit(): void
    {
        $demander = $this->makeUser();
        $auteur = $this->makeUser();
        $thread = $this->makeThread($demander);
        $solution = $this->makeSolution($thread, $auteur);

        $this->forge->accept($thread, $solution, $demander, 'Merci !');

        $this->assertNotNull($solution->refresh()->accepted_at);
        $this->assertSame(25, (int) $auteur->refresh()->germes_balance);
        $this->assertSame(50, (int) $auteur->refresh()->xp_total);
        $this->assertSame(1, AuditLog::query()->where('action', 'forge.solution_accepted')->count());
    }

    #[Test]
    public function le_quota_journalier_de_cinq_solutions_est_applique(): void
    {
        $auteur = $this->makeUser();

        for ($i = 1; $i <= 5; $i++) {
            $demander = $this->makeUser();
            $thread = $this->makeThread($demander, 'thread-'.$i);
            $solution = $this->makeSolution($thread, $auteur, 'solution-'.$i);

            $this->forge->accept($thread, $solution, $demander);
        }

        $demander = $this->makeUser();
        $thread = $this->makeThread($demander, 'thread-6');
        $solution = $this->makeSolution($thread, $auteur, 'solution-6');

        $this->expectException(QuotaExceededException::class);

        $this->forge->accept($thread, $solution, $demander);
    }

    #[Test]
    public function le_quota_hebdomadaire_de_deux_solutions_par_demandeur_est_applique(): void
    {
        $demander = $this->makeUser();

        for ($i = 1; $i <= 2; $i++) {
            $auteur = $this->makeUser();
            $thread = $this->makeThread($demander, 'thread-'.$i);
            $solution = $this->makeSolution($thread, $auteur, 'solution-'.$i);

            $this->forge->accept($thread, $solution, $demander);
        }

        $auteur = $this->makeUser();
        $thread = $this->makeThread($demander, 'thread-3');
        $solution = $this->makeSolution($thread, $auteur, 'solution-3');

        $this->expectException(QuotaExceededException::class);

        $this->forge->accept($thread, $solution, $demander);
    }

    #[Test]
    public function une_solution_deja_acceptee_ne_peut_pas_etre_recompensee_deux_fois(): void
    {
        $demander = $this->makeUser();
        $auteur = $this->makeUser();
        $thread = $this->makeThread($demander);
        $solution = $this->makeSolution($thread, $auteur);

        $this->forge->accept($thread, $solution, $demander);

        $this->expectException(BusinessRuleException::class);

        $this->forge->accept($thread, $solution->refresh(), $demander);
    }
}
