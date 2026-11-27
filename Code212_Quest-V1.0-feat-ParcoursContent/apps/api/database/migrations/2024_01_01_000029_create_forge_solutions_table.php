<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Solutions proposees sur un fil de la Forge.
 *
 * Invariant : une seule solution acceptee par fil (index unique partiel).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_solutions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('thread_id')->constrained('forge_threads')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->text('code_snippet')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->foreignId('accepted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('germes_rewarded')->default(0);
            $table->integer('xp_rewarded')->default(0);
            $table->timestamp('rewarded_at')->nullable();
            $table->timestamps();

            $table->index(['thread_id', 'created_at'], 'forge_solutions_thread_created_index');
            $table->index('author_id', 'forge_solutions_author_index');
        });

        // Index unique partiel : une seule solution acceptee par fil.
        DB::unprepared(
            'CREATE UNIQUE INDEX forge_solutions_one_accepted_per_thread '
            .'ON forge_solutions (thread_id) WHERE accepted_at IS NOT NULL'
        );
    }

    public function down(): void
    {
        DB::unprepared('DROP INDEX IF EXISTS forge_solutions_one_accepted_per_thread');

        Schema::dropIfExists('forge_solutions');
    }
};
