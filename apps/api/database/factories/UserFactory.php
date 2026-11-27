<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\TrackCode;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('motdepasse123'),
            'uca_matricule' => 'UCA-'.Str::upper(Str::random(6)),
            'filiere' => fake()->randomElement(['Genie Logiciel', 'Informatique', 'Mathematiques et Applications']),
            'promotion' => (string) fake()->numberBetween(2022, 2025),
            'pseudonym' => 'Pseudo'.Str::upper(Str::random(5)),
            'roles' => [UserRole::Student->value],
            'track_code' => fake()->randomElement(TrackCode::values()),
            'competition_opt_in' => false,
            'anonymize_leaderboard' => false,
            'locale' => 'fr',
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (): array => ['roles' => [UserRole::Admin->value]]);
    }

    public function trainer(): static
    {
        return $this->state(fn (): array => ['roles' => [UserRole::Trainer->value]]);
    }

    public function moderator(): static
    {
        return $this->state(fn (): array => ['roles' => [UserRole::Moderator->value]]);
    }

    public function optedIn(): static
    {
        return $this->state(fn (): array => ['competition_opt_in' => true]);
    }
}
