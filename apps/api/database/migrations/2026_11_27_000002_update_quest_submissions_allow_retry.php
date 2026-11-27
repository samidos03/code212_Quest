<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quest_submissions', function (Blueprint $table): void {
            $table->unsignedSmallInteger('attempt_number')->default(1)->after('status');
            $table->dropUnique('quest_submissions_idempotency_unique');
            $table->unique(
                ['user_id', 'quest_id', 'quest_step_id', 'attempt_number'],
                'quest_submissions_attempt_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('quest_submissions', function (Blueprint $table): void {
            $table->dropUnique('quest_submissions_attempt_unique');
            $table->dropColumn('attempt_number');
            $table->unique(
                ['user_id', 'quest_id', 'quest_step_id'],
                'quest_submissions_idempotency_unique'
            );
        });
    }
};
