<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Badges delivres aux utilisateurs (portefeuille de competences).
 *
 * `credential_jsonld` contient la preuve Open Badges 3.0 (non signee a ce stade).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issued_badges', function (Blueprint $table): void {
            $table->id();
            $table->string('badge_code', 80);
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->jsonb('evidence')->default(DB::raw("'{}'::jsonb"));
            $table->jsonb('credential_jsonld')->nullable();
            $table->string('status', 16)->default('pending');
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->unique(['badge_code', 'user_id'], 'issued_badges_badge_user_unique');
            $table->index(['user_id', 'status'], 'issued_badges_user_status_index');
            $table->foreign('badge_code')->references('code')->on('badge_rules')->cascadeOnDelete();
        });

        DB::statement(
            "ALTER TABLE issued_badges ADD CONSTRAINT issued_badges_status_check "
            ."CHECK (status IN ('pending','issued','revoked'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('issued_badges');
    }
};
