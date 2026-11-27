<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Inscriptions d'un apprenant a une quete.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quest_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('quest_id')->constrained('quests')->cascadeOnDelete();
            $table->string('status', 24)->default('en_cours');
            $table->unsignedSmallInteger('progress')->default(0);
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'quest_id'], 'quest_enrollments_user_quest_unique');
            $table->index(['quest_id', 'status'], 'quest_enrollments_quest_status_index');
        });

        DB::statement(
            "ALTER TABLE quest_enrollments ADD CONSTRAINT quest_enrollments_status_check "
            ."CHECK (status IN ('en_cours','terminee','abandonnee'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('quest_enrollments');
    }
};
