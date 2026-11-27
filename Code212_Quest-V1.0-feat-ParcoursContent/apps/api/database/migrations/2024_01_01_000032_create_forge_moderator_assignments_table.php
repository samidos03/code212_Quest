<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Moderateurs affekes a une categorie de la Forge.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_moderator_assignments', function (Blueprint $table): void {
            $table->foreignId('category_id')->constrained('forge_categories')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['category_id', 'user_id']);
            $table->index('user_id', 'forge_moderator_assignments_user_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_moderator_assignments');
    }
};
