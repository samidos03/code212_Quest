<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Ordre d execution des seeders (donnees de reference puis comptes de demo).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            TrackSeeder::class,
            LevelSeeder::class,
            XpRuleSeeder::class,
            BadgeRuleSeeder::class,
            ForgeCategorySeeder::class,
            QuestSeeder::class,
            RewardSeeder::class,
            LearningPathSeeder::class,
            MissionSeeder::class,
        ]);

        if (app()->environment('local', 'testing', 'development')) {
            $this->call([
                AdminUserSeeder::class,
                DemoUserSeeder::class,
            ]);
        }
    }
}
