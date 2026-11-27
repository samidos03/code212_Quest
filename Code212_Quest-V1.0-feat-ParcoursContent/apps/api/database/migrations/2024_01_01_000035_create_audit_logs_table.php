<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Journal d'audit des actions d'administration (et de la Forge).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 120);
            $table->string('target_type', 120)->nullable();
            $table->string('target_id', 64)->nullable();
            $table->text('justification')->nullable();
            $table->jsonb('metadata')->default(DB::raw("'{}'::jsonb"));
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['actor_id', 'created_at'], 'audit_logs_actor_created_index');
            $table->index('action', 'audit_logs_action_index');
            $table->index(['target_type', 'target_id'], 'audit_logs_target_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
