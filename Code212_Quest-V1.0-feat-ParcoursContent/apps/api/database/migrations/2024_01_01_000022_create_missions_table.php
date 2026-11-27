<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Missions (objectifs ponctuels, recurrents ou uniques).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('missions', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('track_code', 32)->nullable();
            $table->string('kind', 24)->default('unique');
            $table->integer('xp_reward')->default(0);
            $table->integer('germes_reward')->default(0);
            $table->jsonb('criteria')->default(DB::raw("'{}'::jsonb"));
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement(
            "ALTER TABLE missions ADD CONSTRAINT missions_kind_check "
            ."CHECK (kind IN ('quotidienne','hebdomadaire','unique'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};
