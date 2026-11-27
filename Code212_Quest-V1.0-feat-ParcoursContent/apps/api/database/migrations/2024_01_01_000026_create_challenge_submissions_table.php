<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Depots de code d'un participant a un challenge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challenge_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('challenge_entry_id')->constrained('challenge_entries')->cascadeOnDelete();
            $table->string('repository_url', 255)->nullable();
            $table->text('notes')->nullable();
            $table->integer('score')->default(0);
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('challenge_entry_id', 'challenge_submissions_entry_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_submissions');
    }
};
