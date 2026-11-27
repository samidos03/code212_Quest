<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Signalements (fils ou solutions) de la Forge.
 *
 * Invariant : un signalement cible soit un fil, soit une solution (XOR).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('thread_id')->nullable()->constrained('forge_threads')->cascadeOnDelete();
            $table->foreignId('solution_id')->nullable()->constrained('forge_solutions')->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->text('reason');
            $table->string('status', 24)->default('ouverte');
            $table->text('resolution_note')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'forge_reports_status_created_index');
        });

        DB::statement(
            'ALTER TABLE forge_reports ADD CONSTRAINT forge_reports_target_check '
            .'CHECK ((thread_id IS NOT NULL AND solution_id IS NULL) OR (thread_id IS NULL AND solution_id IS NOT NULL))'
        );
        DB::statement(
            "ALTER TABLE forge_reports ADD CONSTRAINT forge_reports_status_check "
            ."CHECK (status IN ('ouverte','resolue','rejetee'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_reports');
    }
};
