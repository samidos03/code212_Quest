<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Etapes d'une quete.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quest_steps', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('quest_id')->constrained('quests')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('type', 24)->default('qcm');
            $table->string('validation_mode', 16)->default('manuelle');
            $table->unsignedSmallInteger('order_index');
            $table->integer('xp_reward')->default(0);
            $table->unsignedSmallInteger('duration_minutes')->default(30);
            $table->timestamps();

            $table->unique(['quest_id', 'order_index'], 'quest_steps_quest_order_unique');
        });

        DB::statement(
            "ALTER TABLE quest_steps ADD CONSTRAINT quest_steps_type_check "
            ."CHECK (type IN ('qcm','code','projet','preuve','atelier'))"
        );
        DB::statement(
            "ALTER TABLE quest_steps ADD CONSTRAINT quest_steps_validation_mode_check "
            ."CHECK (validation_mode IN ('auto','manuelle'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('quest_steps');
    }
};
