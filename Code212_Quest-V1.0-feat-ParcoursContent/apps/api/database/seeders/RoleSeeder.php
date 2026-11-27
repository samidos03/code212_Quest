<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\SystemConfigRule;
use Illuminate\Database\Seeder;

/**
 * Roles applicatifs (reference metier, stockee dans system_config_rules).
 */
class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [];

        foreach (UserRole::cases() as $role) {
            $roles[$role->value] = [
                'libelle' => $role->label(),
                'encadre' => $role->isStaff(),
            ];
        }

        SystemConfigRule::query()->updateOrCreate(
            ['key' => 'roles'],
            ['value' => $roles, 'version' => 1]
        );
    }
}
