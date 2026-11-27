<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Les quatre voies de progression de Code212 Quest (cle primaire textuelle).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('progression_tracks', function (Blueprint $table): void {
            $table->string('code', 32)->primary();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->string('color', 16)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });

        DB::statement(
            "ALTER TABLE progression_tracks ADD CONSTRAINT progression_tracks_code_format_check
             CHECK (code ~ '^[a-z_]+$')"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('progression_tracks');
    }
};
