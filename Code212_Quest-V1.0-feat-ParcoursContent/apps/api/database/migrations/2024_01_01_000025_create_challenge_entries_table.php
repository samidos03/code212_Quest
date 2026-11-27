<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Inscriptions a un challenge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenge_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teammate_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 24)->default('inscrit');
            $table->integer('score')->default(0);
            $table->unsignedSmallInteger('rank')->nullable();
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->unique(['challenge_id', 'user_id'], 'challenge_entries_challenge_user_unique');
            $table->index(['challenge_id', 'status'], 'challenge_entries_challenge_status_index');
        });

        DB::statement(
            "ALTER TABLE challenge_entries ADD CONSTRAINT challenge_entries_status_check "
            ."CHECK (status IN ('inscrit','en_cours','termine','abandonne'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_entries');
    }
};
