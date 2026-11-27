<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * File d'approbation formateur : productions libres learners.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('quest_id')->nullable()->constrained('quests')->nullOnDelete();
            $table->foreignId('quest_step_id')->nullable()->constrained('quest_steps')->nullOnDelete();
            $table->string('title', 200);
            $table->text('body')->nullable();
            $table->string('artifact_url', 255)->nullable();
            $table->string('status', 24)->default('en_attente');
            $table->integer('xp_reward')->default(0);
            $table->integer('germes_reward')->default(0);
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'submissions_status_index');
            $table->index('user_id', 'submissions_user_index');
        });

        DB::statement(
            "ALTER TABLE submissions ADD CONSTRAINT submissions_status_check "
            ."CHECK (status IN ('en_attente','approuvee','rejetee','a_revoir'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
