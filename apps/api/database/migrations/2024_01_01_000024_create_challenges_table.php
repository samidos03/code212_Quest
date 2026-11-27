<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Challenges (defis code en equipe ou solo, avec ou sans code source).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenges', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('track_code', 32)->nullable();
            $table->string('difficulty', 24)->default('debutant');
            $table->string('status', 24)->default('a_venir');
            $table->string('mode', 16)->default('solo');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->jsonb('rules')->default(DB::raw("'{}'::jsonb"));
            $table->integer('xp_reward')->default(0);
            $table->integer('germes_reward')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'track_code'], 'challenges_status_track_index');
            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement(
            "ALTER TABLE challenges ADD CONSTRAINT challenges_status_check "
            ."CHECK (status IN ('a_venir','ouverte','closee','archivee'))"
        );
        DB::statement(
            "ALTER TABLE challenges ADD CONSTRAINT challenges_mode_check CHECK (mode IN ('solo','duo','equipe'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
