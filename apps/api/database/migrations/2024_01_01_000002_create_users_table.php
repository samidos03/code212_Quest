<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Comptes utilisateurs (apprenants, formateurs, moderateurs, administrateurs).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();

            // Identite institutionnelle (UCA).
            $table->string('uca_matricule', 32)->nullable()->unique();
            $table->string('filiere', 120)->nullable();
            $table->string('promotion', 32)->nullable();

            // Identite publique (pseudonyme obligatoire pour le classement).
            $table->string('pseudonym', 64)->nullable()->unique();
            $table->boolean('anonymize_leaderboard')->default(false);
            $table->boolean('competition_opt_in')->default(false);

            // Roles : tableau jsonb de codes UserRole.
            $table->jsonb('roles')->default(DB::raw("'[]'::jsonb"));

            // Preferences d'affichage et de notification.
            $table->jsonb('preferences')->default(DB::raw("'{}'::jsonb"));

            // Progression (valeurs mises en cache, recalculees par LevelService).
            $table->string('track_code', 32)->nullable();
            $table->unsignedSmallInteger('level_no')->default(1);
            $table->bigInteger('xp_total')->default(0);
            $table->integer('germes_balance')->default(0);

            $table->string('avatar_url', 255)->nullable();
            $table->string('locale', 8)->default('fr');
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('track_code')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement(
            'ALTER TABLE users ADD CONSTRAINT users_level_no_check CHECK (level_no BETWEEN 1 AND 10)'
        );
        DB::statement(
            'ALTER TABLE users ADD CONSTRAINT users_germes_balance_check CHECK (germes_balance >= 0)'
        );
        DB::statement(
            'ALTER TABLE users ADD CONSTRAINT users_xp_total_check CHECK (xp_total >= 0)'
        );

        // Table du broker de reinitialisation de mot de passe.
        Schema::create('password_reset_tokens', function (Blueprint $table): void {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
