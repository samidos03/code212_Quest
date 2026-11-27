<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Enums\TrackCode;
use App\Enums\UserRole;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitaires purs (aucune base de donnees necessaire).
 */
class ExampleTest extends TestCase
{
    #[Test]
    public function les_libelles_des_roles_sont_en_francais(): void
    {
        $this->assertSame('Apprenant', UserRole::Student->label());
        $this->assertSame('Formateur', UserRole::Trainer->label());
        $this->assertSame('Moderateur', UserRole::Moderator->label());
        $this->assertSame('Administrateur', UserRole::Admin->label());
    }

    #[Test]
    public function la_charte_graphique_est_respectee_par_les_voies(): void
    {
        $this->assertSame('#c5027f', TrackCode::Codeur->color());
        $this->assertSame('#00dfff', TrackCode::Aidant->color());
        $this->assertSame('#6701e6', TrackCode::Batisseur->color());
    }

    #[Test]
    public function les_voies_de_progression_sont_au_nombre_de_quatre(): void
    {
        $this->assertCount(4, TrackCode::cases());
        $this->assertSame(
            ['codeur', 'aidant', 'batisseur', 'explorateur'],
            TrackCode::values()
        );
    }
}
