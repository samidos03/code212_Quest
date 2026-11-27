<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Compte administrateur initial (et un moderateur pour la Forge).
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = (string) env('SEED_ADMIN_EMAIL', 'admin@code212.ma');
        $password = (string) env('SEED_ADMIN_PASSWORD', 'ChangeMe!2024');

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Administrateur CODE212',
                'password' => Hash::make($password),
                'uca_matricule' => 'ADM-0001',
                'filiere' => 'Centre CODE212',
                'promotion' => '2024',
                'pseudonym' => 'Code212 Admin',
                'roles' => [UserRole::Admin->value, UserRole::Moderator->value, UserRole::Trainer->value],
                'competition_opt_in' => false,
                'locale' => 'fr',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'moderateur@code212.ma'],
            [
                'name' => 'Moderation CODE212',
                'password' => Hash::make($password),
                'uca_matricule' => 'MOD-0001',
                'filiere' => 'Centre CODE212',
                'promotion' => '2024',
                'pseudonym' => 'Moderation',
                'roles' => [UserRole::Moderator->value],
                'competition_opt_in' => false,
                'locale' => 'fr',
            ]
        );
    }
}
