<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\TrackCode;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Comptes de demonstration (apprenants, formateur).
 */
class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = (string) env('SEED_ADMIN_PASSWORD', 'ChangeMe!2024');

        $users = [
            ['Amina Bouzid', 'amina.bouzid@uca.ma', 'UCA-2201', 'Genie Logiciel', '2024', TrackCode::Codeur->value, true, 'AminaCode'],
            ['Youssef El Amine', 'youssef.elamine@uca.ma', 'UCA-2202', 'Genie Logiciel', '2024', TrackCode::Aidant->value, true, 'YoussefAide'],
            ['Salma Nadir', 'salma.nadir@uca.ma', 'UCA-2203', 'Mathematiques et Applications', '2023', TrackCode::Batisseur->value, false, 'SalmaBatit'],
            ['Karim Tazi', 'karim.tazi@uca.ma', 'UCA-2204', 'Informatique', '2023', TrackCode::Explorateur->value, true, 'KarimExplore'],
            ['Hind Lamrani', 'hind.lamrani@uca.ma', 'UCA-2205', 'Genie Logiciel', '2024', TrackCode::Codeur->value, false, 'HindCode'],
            ['Mehdi Alaoui', 'mehdi.alaoui@uca.ma', 'FORM-001', 'Centre CODE212', '2024', null, false, 'MehdiFormateur'],
        ];

        foreach ($users as [$name, $email, $matricule, $filiere, $promotion, $track, $optIn, $pseudonym]) {
            User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($password),
                    'uca_matricule' => $matricule,
                    'filiere' => $filiere,
                    'promotion' => $promotion,
                    'track_code' => $track,
                    'pseudonym' => $pseudonym,
                    'roles' => [$matricule === 'FORM-001' ? UserRole::Trainer->value : UserRole::Student->value],
                    'competition_opt_in' => $optIn,
                    'locale' => 'fr',
                ]
            );
        }
    }
}
