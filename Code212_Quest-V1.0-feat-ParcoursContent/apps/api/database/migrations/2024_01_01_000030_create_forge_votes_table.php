<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Votes positifs sur les solutions de la Forge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_votes', function (Blueprint $table): void {
            $table->foreignId('solution_id')->constrained('forge_solutions')->cascadeOnDelete();
            $table->foreignId('voter_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['solution_id', 'voter_id']);
            $table->index('voter_id', 'forge_votes_voter_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_votes');
    }
};
