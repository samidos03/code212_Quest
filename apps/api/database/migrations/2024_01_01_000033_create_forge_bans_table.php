<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bans temporaires sur une categorie de la Forge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_bans', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained('forge_categories')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('reason');
            $table->foreignId('imposed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->foreignId('revoked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'category_id'], 'forge_bans_user_category_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_bans');
    }
};
