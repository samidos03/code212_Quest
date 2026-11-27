<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Niveaux globaux (1..10) : seuils et benefices configurables.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('levels_config', function (Blueprint $table): void {
            $table->unsignedSmallInteger('level_no')->primary();
            $table->string('title', 120);
            $table->bigInteger('xp_threshold');
            $table->jsonb('requirements')->default(DB::raw("'{}'::jsonb"));
            $table->jsonb('benefits')->default(DB::raw("'{}'::jsonb"));
            $table->timestamps();

            $table->unique('xp_threshold', 'levels_config_xp_threshold_unique');
        });

        DB::statement(
            'ALTER TABLE levels_config ADD CONSTRAINT levels_config_level_no_check CHECK (level_no BETWEEN 1 AND 10)'
        );
        DB::statement(
            'ALTER TABLE levels_config ADD CONSTRAINT levels_config_xp_threshold_check CHECK (xp_threshold >= 0)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('levels_config');
    }
};
