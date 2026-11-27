<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Quetes (devoirs gamifies) : sequence d'etapes validees par un formateur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quests', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('track_code', 32)->nullable();
            $table->string('difficulty', 24)->default('debutant');
            $table->string('status', 24)->default('brouillon');
            $table->integer('xp_reward')->default(0);
            $table->integer('germes_reward')->default(0);
            $table->unsignedSmallInteger('estimated_minutes')->default(60);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('cover_url', 255)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'track_code'], 'quests_status_track_index');
            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement(
            "ALTER TABLE quests ADD CONSTRAINT quests_difficulty_check "
            ."CHECK (difficulty IN ('debutant','intermediaire','avance','expert'))"
        );
        DB::statement(
            "ALTER TABLE quests ADD CONSTRAINT quests_status_check "
            ."CHECK (status IN ('brouillon','publie','archive'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('quests');
    }
};
