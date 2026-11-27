<?php

declare(strict_types=1);

namespace Tests;

use App\Models\Level;
use App\Models\User;
use App\Models\XpRule;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

/**
 * Base des tests : helpers de creation de donnees de reference.
 */
abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Le cache est partage dans le process de test : on le purge entre les tests.
        Cache::flush();
    }

    /**
     * Niveaux de reference (seuils simples et lisibles).
     */
    protected function seedLevels(): void
    {
        foreach ([[1, 0], [2, 100], [3, 300], [4, 1000]] as [$number, $threshold]) {
            Level::query()->updateOrCreate(
                ['level_no' => $number],
                [
                    'title' => 'Niveau '.$number,
                    'xp_threshold' => $threshold,
                    'requirements' => [],
                    'benefits' => [],
                ]
            );
        }
    }

    /**
     * Regle XP de reference (sans plafond, pour isoler l invariant etudie).
     */
    protected function seedXpRule(string $sourceEvent, int $amount, ?int $dailyCap = null): XpRule
    {
        return XpRule::query()->updateOrCreate(
            ['code' => str_replace('.', '_', $sourceEvent)],
            [
                'name' => 'Regle '.$sourceEvent,
                'description' => null,
                'source_event' => $sourceEvent,
                'track_code' => null,
                'xp_amount' => $amount,
                'germes_amount' => 0,
                'daily_cap' => $dailyCap,
                'weekly_cap' => null,
                'version' => 1,
                'active' => true,
            ]
        );
    }

    /**
     * @param array<string, mixed> $attributes
     */
    protected function makeUser(array $attributes = []): User
    {
        static $counter = 0;
        $counter++;

        return User::create(array_merge([
            'name' => 'Apprenant '.$counter,
            'email' => sprintf('apprenant%d@uca.ma', $counter),
            'password' => Hash::make('motdepasse123'),
            'roles' => ['student'],
            'locale' => 'fr',
        ], $attributes));
    }
}
