<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Inscriptions aux parcours d'apprentissage
        Schema::create('learning_path_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('learning_path_id')->constrained('learning_paths')->cascadeOnDelete();
            $table->string('status', 24)->default('en_cours');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'learning_path_id'], 'path_enrollments_user_path_unique');
            $table->index(['user_id', 'status'], 'path_enrollments_user_status_index');
        });

        // 2. Lien quête finale sur path_steps
        Schema::table('path_steps', function (Blueprint $table): void {
            $table->foreignId('quest_id')->nullable()->after('ref_id')->constrained('quests')->nullOnDelete();
        });

        // 3. Leçons d'un module
        Schema::create('module_lessons', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('path_step_id')->constrained('path_steps')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('summary')->nullable();
            $table->text('content');
            $table->unsignedSmallInteger('order_index');
            $table->unsignedSmallInteger('estimated_minutes')->default(15);
            $table->timestamps();

            $table->unique(['path_step_id', 'order_index'], 'module_lessons_step_order_unique');
        });

        // 4. Exercices d'une leçon
        Schema::create('lesson_exercises', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('module_lesson_id')->constrained('module_lessons')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('instructions');
            $table->text('starter_code')->nullable();
            $table->string('validation_type', 32)->default('keywords');
            $table->jsonb('validation_rules')->default(DB::raw("'{}'::jsonb"));
            $table->unsignedSmallInteger('order_index');
            $table->timestamps();

            $table->unique(['module_lesson_id', 'order_index'], 'lesson_exercises_lesson_order_unique');
        });

        // 5. Tentatives d'exercices
        Schema::create('exercise_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lesson_exercise_id')->constrained('lesson_exercises')->cascadeOnDelete();
            $table->text('answer');
            $table->boolean('passed')->default(false);
            $table->text('feedback')->nullable();
            $table->unsignedInteger('attempt_number')->default(1);
            $table->timestamps();

            $table->index(['user_id', 'lesson_exercise_id', 'passed'], 'exercise_attempts_user_ex_passed_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_attempts');
        Schema::dropIfExists('lesson_exercises');
        Schema::dropIfExists('module_lessons');

        Schema::table('path_steps', function (Blueprint $table): void {
            $table->dropForeign(['quest_id']);
            $table->dropColumn('quest_id');
        });

        Schema::dropIfExists('learning_path_enrollments');
    }
};
