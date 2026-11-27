<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Reward;
use Illuminate\Database\Seeder;

/**
 * Catalogue de la boutique (recompenses payees en germes).
 */
class RewardSeeder extends Seeder
{
    public function run(): void
    {
        $rewards = [
            ['R-STICKER-CODE212', 'Autocollant CODE212', 'Pack de 3 autocollants aux couleurs de la charte.', 'accessoires', 40, null, 'codeur'],
            ['R-TEE-CODE212', 'T-shirt CODE212', 'T-shirt du centre CODE212, taille unique.', 'vetements', 150, 25, null],
            ['R-HOODIE-MAGENTA', 'Sweat a capuche Magenta', 'Sweat violet #6701e6 avec logo CODE212.', 'vetements', 320, 12, null],
            ['R-CABLE-USBC', 'Cable USB-C', 'Cable de charge USB-C 1m.', 'accessoires', 60, 40, null],
            ['R-CARNET-XP', 'Carnet XP', 'Carnet de suivi des quetes et des badges.', 'papeterie', 80, null, null],
            ['R-COFFEE', 'Cafe du centre', 'Un cafe au centre CODE212.', 'restauration', 30, 60, null],
            ['R-GOOGLE-STICKER', 'Pack stickers voiles', 'Stickers de la communaute.', 'accessoires', 25, null, 'aidant'],
            ['R-MENTOR-KAFFA', 'Cafe mentor', 'Offre un cafe a un etudiant en difficulte.', 'solidarite', 35, null, 'aidant'],
            ['R-PROJECT-README', 'Template de projet', 'Gabarit de README et de revue de code.', 'numerique', 100, null, 'batisseur'],
            ['R-LIGHTROOM', 'Pack icones', 'Pack d icones lumineuses pour l editeur.', 'numerique', 120, null, 'explorateur'],
            ['R-CERTIFICAT', 'Certificat de participation', 'Certificat numerique CODE212 (Open Badges).', 'certification', 200, 20, null],
            ['R-MENTORAT-SESSION', 'Session de mentorat', 'Une heure de mentorat avec un formateur.', 'services', 250, 10, null],
        ];

        foreach ($rewards as $position => [$code, $name, $description, $category, $cost, $stock, $track]) {
            Reward::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $name,
                    'description' => $description,
                    'category' => $category,
                    'track_code' => $track,
                    'cost' => $cost,
                    'stock' => $stock,
                    'requires_approval' => true,
                    'active' => true,
                    'position' => $position + 1,
                ]
            );
        }
    }
}
