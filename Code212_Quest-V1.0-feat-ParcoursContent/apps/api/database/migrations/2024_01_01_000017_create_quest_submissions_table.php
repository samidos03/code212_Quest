<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Soumissions d'etape : idempotentes par (user_id, quest_id, quest_step_id).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quest_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('quest_id')->constrained('quests')->cascadeOnDelete();
            $table->foreignId('quest_step_id')->constrained('quest_steps')->cascadeOnDelete();
            $table->foreignId('quest_enrollment_id')->nullable()->constrained('quest_enrollments')->nullOnDelete();

            $table->jsonb('content')->default(DB::raw("'{}'::jsonb"));
            $table->text('notes')->nullable();
            $table->string('status', 24)->default('en_attente');

            // Cle d'idempotence : derivee de (user_id, quest_id, step_id).
            $table->string('idempotency_key', 190);
            $table->string('content_hash', 64);

            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('feedback')->nullable();
            $table->integer('xp_awarded')->default(0);
            $table->timestamps();

            $table->unique(
                ['user_id', 'quest_id', 'quest_step_id'],
                'quest_submissions_idempotency_unique'
            );
            $table->unique(['user_id', 'idempotency_key'], 'quest_submissions_user_key_unique');
            $table->index(['status', 'submitted_at'], 'quest_submissions_status_index');
        });

        DB::statement(
            "ALTER TABLE quest_submissions ADD CONSTRAINT quest_submissions_status_check "
            ."CHECK (status IN ('en_attente','approuvee','rejetee','a_revoir'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('quest_submissions');
    }
};
