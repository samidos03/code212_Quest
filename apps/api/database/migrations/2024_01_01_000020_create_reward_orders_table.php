<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Commandes de la boutique (un utilisateur peut commander plusieurs lots).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reward_orders', function (Blueprint $table): void {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 24)->default('en_attente');
            $table->integer('total_cost')->default(0);
            $table->unsignedInteger('items_count')->default(0);
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status'], 'reward_orders_user_status_index');
            $table->index('status', 'reward_orders_status_index');
        });

        DB::statement(
            "ALTER TABLE reward_orders ADD CONSTRAINT reward_orders_status_check "
            ."CHECK (status IN ('en_attente','approuvee','rejetee','annulee','livree'))"
        );
        DB::statement('ALTER TABLE reward_orders ADD CONSTRAINT reward_orders_total_cost_check CHECK (total_cost >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('reward_orders');
    }
};
