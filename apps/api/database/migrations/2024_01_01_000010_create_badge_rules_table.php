<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Catalogue des badges : regles d'obtention, emetteur, rarete, voie.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('badge_rules', function (Blueprint $table): void {
            $table->string('code', 80)->primary();
            $table->string('name', 160);
            $table->text('description')->nullable();
            $table->jsonb('rule')->default(DB::raw("'{}'::jsonb"));
            $table->string('issuer', 160)->default('CODE212 - Universite Cadi Ayyad');
            $table->string('rarity', 32)->default('commune');
            $table->string('track_code', 32)->nullable();
            $table->string('image_url', 255)->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('badge_rules');
    }
};
