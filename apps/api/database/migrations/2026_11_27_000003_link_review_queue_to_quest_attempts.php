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
        Schema::table('submissions', function (Blueprint $table): void {
            $table->foreignId('quest_submission_id')
                ->nullable()
                ->constrained('quest_submissions')
                ->nullOnDelete();
            $table->unique('quest_submission_id', 'submissions_quest_submission_unique');
        });

        DB::statement(<<<'SQL'
            WITH ranked_queue AS (
                SELECT id, user_id, quest_id, quest_step_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY user_id, quest_id, quest_step_id
                        ORDER BY created_at DESC, id DESC
                    ) AS row_number
                FROM submissions
                WHERE quest_id IS NOT NULL AND quest_step_id IS NOT NULL
            ),
            ranked_attempts AS (
                SELECT id, user_id, quest_id, quest_step_id,
                    ROW_NUMBER() OVER (
                        PARTITION BY user_id, quest_id, quest_step_id
                        ORDER BY attempt_number DESC, id DESC
                    ) AS row_number
                FROM quest_submissions
            )
            UPDATE submissions AS queue
            SET quest_submission_id = attempt.id
            FROM ranked_queue AS ranked_queue
            JOIN ranked_attempts AS attempt
                ON attempt.user_id = ranked_queue.user_id
                AND attempt.quest_id = ranked_queue.quest_id
                AND attempt.quest_step_id = ranked_queue.quest_step_id
                AND attempt.row_number = 1
            WHERE queue.id = ranked_queue.id
                AND ranked_queue.row_number = 1
        SQL);
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table): void {
            $table->dropUnique('submissions_quest_submission_unique');
            $table->dropConstrainedForeignId('quest_submission_id');
        });
    }
};
