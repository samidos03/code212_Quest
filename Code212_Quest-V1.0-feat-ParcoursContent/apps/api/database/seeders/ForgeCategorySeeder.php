<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ForgeCategory;
use Illuminate\Database\Seeder;

/**
 * Categories de la Forge.
 */
class ForgeCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['forge-algo', 'Algorithmique', 'Entraide sur les structures de donnees et les algorithmes.', '#c5027f', 'cpu'],
            ['forge-debug', 'Debogage', 'Aide pour comprendre et corriger ses erreurs.', '#00dfff', 'bug'],
            ['forge-web', 'Developpement Web', 'HTML, CSS, JavaScript et frameworks.', '#6701e6', 'globe'],
            ['forge-projets', 'Projets', 'Construction de projets de groupe et revues de code.', '#c5027f', 'rocket'],
            ['forge-carrieres', 'Carrieres et orientation', 'Preparation aux stages, concours et entretiens.', '#00dfff', 'compass'],
        ];

        foreach ($categories as $position => [$code, $name, $description, $color, $icon]) {
            ForgeCategory::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => $description,
                    'color' => $color,
                    'icon' => $icon,
                    'position' => $position + 1,
                ]
            );
        }
    }
}
