<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lignes de commande (lots de recompenses).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reward_order_id')->constrained('reward_orders')->cascadeOnDelete();
            $table->foreignId('reward_id')->constrained('rewards')->restrictOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->integer('unit_cost')->default(0);
            $table->timestamps();

            $table->unique(['reward_order_id', 'reward_id'], 'reward_order_items_order_reward_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_order_items');
    }
};
