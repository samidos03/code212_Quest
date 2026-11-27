<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Baremes XP parametrables : montant par evenement + plafonds anti-abus.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('xp_rules', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 160);
            $table->text('description')->nullable();

            // Evenement metier source (App\Support\XpSource).
            $table->string('source_event', 64);

            // Voie concernee (null = XP global).
            $table->string('track_code', 32)->nullable();

            $table->integer('xp_amount')->default(0);
            $table->integer('germes_amount')->default(0);
            $table->integer('daily_cap')->nullable();
            $table->integer('weekly_cap')->nullable();
            $table->integer('version')->default(1);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['source_event', 'track_code'], 'xp_rules_source_track_index');
            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement(
            'ALTER TABLE xp_rules ADD CONSTRAINT xp_rules_xp_amount_check CHECK (xp_amount >= 0)'
        );
        DB::statement(
            'ALTER TABLE xp_rules ADD CONSTRAINT xp_rules_daily_cap_check CHECK (daily_cap IS NULL OR daily_cap >= 0)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('xp_rules');
    }
};
