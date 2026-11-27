<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\XpRule;
use App\Support\XpSource;
use Illuminate\Database\Seeder;

/**
 * Baremes XP parametrables (montants + plafonds journaliers anti-abus).
 */
class XpRuleSeeder extends Seeder
{
    public function run(): void
    {
        $rules = [
            [XpSource::QUEST_ENROLLED, 'Inscription a une quete', 10, 60, 'XP accorde a l inscription d une quete.', null],
            [XpSource::QUEST_STEP_APPROVED, 'Etape de quete validee', 40, 200, 'XP accorde quand un formateur valide une etape.', null],
            [XpSource::QUEST_COMPLETED, 'Quete terminee', 100, 300, 'XP de bonus pour une quete entierement terminee.', null],
            [XpSource::SUBMISSION_APPROVED, 'Production approuvee', 50, 200, 'XP accorde par le formateur pour une production libre.', null],
            [XpSource::FORGE_SOLUTION_REWARDED, 'Solution remuneratione (Forge)', 50, 150, 'XP pour une solution acceptee et remuneratione dans la Forge.', null],
            [XpSource::MISSION_CLAIMED, 'Mission revendiquee', 25, 100, 'XP pour une mission revendiquee.', null],
            [XpSource::CHALLENGE_COMPLETED, 'Challenge termine', 80, 160, 'XP pour un challenge termine.', null],
            [XpSource::BADGE_ISSUED, 'Badge delivre', 10, 50, 'XP pour chaque badge delivre.', null],
            [XpSource::LIBKI_CHECK_IN, 'Presence au centre (Libki)', 15, 45, 'XP pour un check-in valide via Libki.', null],
            [XpSource::LIBKI_RESERVATION_HONORED, 'Reservation honoree (Libki)', 25, 75, 'XP pour une reservation honoree.', null],
            [XpSource::DAILY_STREAK, 'Serie quotidienne', 5, 20, 'XP pour le maintien d une serie quotidienne.', null],
        ];

        foreach ($rules as [$sourceEvent, $name, $amount, $dailyCap, $description, $trackCode]) {
            XpRule::query()->updateOrCreate(
                ['code' => str_replace('.', '_', $sourceEvent)],
                [
                    'name' => $name,
                    'description' => $description,
                    'source_event' => $sourceEvent,
                    'track_code' => $trackCode,
                    'xp_amount' => $amount,
                    'germes_amount' => 0,
                    'daily_cap' => $dailyCap,
                    'weekly_cap' => null,
                    'version' => 1,
                    'active' => true,
                ]
            );
        }
    }
}
