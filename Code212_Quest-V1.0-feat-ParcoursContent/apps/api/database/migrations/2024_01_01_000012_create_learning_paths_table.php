<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Parcours d'apprentissage (scenarios ordonnes d'etapes de toute nature).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_paths', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('track_code', 32)->nullable();
            $table->unsignedSmallInteger('level_no_from')->default(1);
            $table->unsignedSmallInteger('level_no_to')->default(10);
            $table->integer('xp_bonus')->default(0);
            $table->integer('germes_bonus')->default(0);
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('published')->default(true);
            $table->timestamps();

            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_paths');
    }
};
