<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Catalogue de la boutique (depenses de germes).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rewards', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->string('category', 80)->default('divers');
            $table->string('track_code', 32)->nullable();

            // Cout en germes.
            $table->integer('cost')->default(0);

            // null = stock illimite.
            $table->integer('stock')->nullable();
            $table->string('image_url', 255)->nullable();
            $table->boolean('requires_approval')->default(true);
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['active', 'category'], 'rewards_active_category_index');
            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement('ALTER TABLE rewards ADD CONSTRAINT rewards_cost_check CHECK (cost >= 0)');
        DB::statement('ALTER TABLE rewards ADD CONSTRAINT rewards_stock_check CHECK (stock IS NULL OR stock >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('rewards');
    }
};
