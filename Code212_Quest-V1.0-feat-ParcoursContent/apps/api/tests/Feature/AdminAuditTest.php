<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\XpRule;
use App\Support\XpSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

/**
 * Invariant 8 : toutes les actions d administration sont auditees.
 */
class AdminAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedLevels();
        $this->seedXpRule(XpSource::QUEST_STEP_APPROVED, 40);
    }

    #[Test]
    public function la_modification_d_un_bareme_xp_est_auditee(): void
    {
        $admin = $this->makeUser(['roles' => ['admin']]);
        $rule = XpRule::query()->where('source_event', XpSource::QUEST_STEP_APPROVED)->firstOrFail();

        Sanctum::actingAs($admin, ['read', 'write']);

        $this->putJson('/api/v1/admin/rules/xp', [
            'id' => $rule->getKey(),
            'xp' => 55,
            'plafond_journalier' => 220,
            'justification' => 'Reequilibrage du bareme.',
        ])->assertOk();

        $log = AuditLog::query()->where('action', 'admin.xp_rule_updated')->first();

        $this->assertNotNull($log);
        $this->assertSame($admin->getKey(), (int) $log->actor_id);
        $this->assertSame('xp_rule', $log->target_type);
        $this->assertSame('Reequilibrage du bareme.', $log->justification);
        $this->assertSame(55, (int) $rule->refresh()->xp_amount);
    }

    #[Test]
    public function la_modification_d_une_fiche_apprenant_est_auditee(): void
    {
        $admin = $this->makeUser(['roles' => ['admin']]);
        $student = $this->makeUser(['roles' => ['student'], 'filiere' => 'Informatique']);

        Sanctum::actingAs($admin, ['read', 'write']);

        $this->patchJson("/api/v1/admin/students/{$student->getKey()}", [
            'filiere' => 'Genie Logiciel',
            'roles' => ['student', 'trainer'],
            'justification' => 'Promotion en tant que formateur.',
        ])->assertOk();

        $log = AuditLog::query()->where('action', 'admin.student_updated')->first();

        $this->assertNotNull($log);
        $this->assertSame($student->getKey(), (int) $log->target_id);
        $this->assertSame('Genie Logiciel', $student->refresh()->filiere);
        $this->assertContains('trainer', $student->refresh()->roles);
    }

    #[Test]
    public function la_creation_d_une_quete_est_auditee(): void
    {
        $admin = $this->makeUser(['roles' => ['admin']]);

        Sanctum::actingAs($admin, ['read', 'write']);

        $this->postJson('/api/v1/admin/quests', [
            'code' => 'Q-AUDIT-001',
            'titre' => 'Quete auditee',
            'difficulte' => 'debutant',
            'etapes' => [
                ['titre' => 'Etape une', 'type' => 'qcm', 'xp' => 10],
            ],
        ])->assertCreated();

        $this->assertSame(1, AuditLog::query()->where('action', 'admin.quest_created')->count());
    }

    #[Test]
    public function les_actions_non_administratives_ne_creent_pas_d_audit_administratif(): void
    {
        $apprenant = $this->makeUser(['roles' => ['student']]);

        Sanctum::actingAs($apprenant, ['read', 'write']);

        $this->getJson('/api/v1/dashboard')->assertOk();

        $this->assertSame(0, AuditLog::query()->where('action', 'like', 'admin.%')->count());
    }
}
