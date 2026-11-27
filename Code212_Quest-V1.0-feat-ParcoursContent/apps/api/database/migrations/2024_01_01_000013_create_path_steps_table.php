<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Etapes d'un parcours (references vers quetes, missions, challenges...).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('path_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('learning_path_id')->constrained('learning_paths')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('kind', 32)->default('quete');
            $table->string('ref_type', 32)->nullable();
            $table->string('ref_id', 64)->nullable();
            $table->unsignedSmallInteger('order_index');
            $table->integer('xp_reward')->default(0);
            $table->timestamps();

            $table->unique(['learning_path_id', 'order_index'], 'path_steps_path_order_unique');
            $table->index(['ref_type', 'ref_id'], 'path_steps_reference_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('path_steps');
    }
};
