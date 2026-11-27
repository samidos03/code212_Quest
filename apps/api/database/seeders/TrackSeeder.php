<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\TrackCode;
use App\Models\ProgressionTrack;
use Illuminate\Database\Seeder;

/**
 * Les quatre voies de progression.
 */
class TrackSeeder extends Seeder
{
    public function run(): void
    {
        foreach (TrackCode::cases() as $position => $track) {
            ProgressionTrack::query()->updateOrCreate(
                ['code' => $track->value],
                [
                    'name' => $track->label(),
                    'description' => $track->description(),
                    'color' => $track->color(),
                    'position' => $position + 1,
                ]
            );
        }
    }
}
