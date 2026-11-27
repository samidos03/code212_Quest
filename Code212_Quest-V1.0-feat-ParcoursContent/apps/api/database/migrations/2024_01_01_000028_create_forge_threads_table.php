<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fils de discussion de la Forge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_threads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained('forge_categories')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 240);
            $table->text('body');
            $table->string('status', 24)->default('ouverte');
            $table->jsonb('tags')->default(DB::raw("'[]'::jsonb"));
            $table->foreignId('accepted_solution_id')->nullable();
            $table->unsignedSmallInteger('view_count')->default(0);
            $table->timestamps();

            $table->index(['status', 'created_at'], 'forge_threads_status_created_index');
            $table->index('author_id', 'forge_threads_author_index');
        });

        DB::statement(
            "ALTER TABLE forge_threads ADD CONSTRAINT forge_threads_status_check "
            ."CHECK (status IN ('ouverte','resolue','masquee','verrouillee'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_threads');
    }
};
