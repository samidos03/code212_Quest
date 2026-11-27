<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Revendications de missions (une seule par mission et par utilisateur).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_claims', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('mission_id')->constrained('missions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('xp_awarded')->default(0);
            $table->integer('germes_awarded')->default(0);
            $table->jsonb('evidence')->default(DB::raw("'{}'::jsonb"));
            $table->timestamp('claimed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['mission_id', 'user_id'], 'mission_claims_mission_user_unique');
            $table->index(['user_id', 'claimed_at'], 'mission_claims_user_claimed_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_claims');
    }
};
