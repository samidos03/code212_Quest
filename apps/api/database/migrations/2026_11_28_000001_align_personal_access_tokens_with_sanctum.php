<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Aligne personal_access_tokens sur le schéma attendu par Sanctum 4
 * (relation polymorphe tokenable_type/tokenable_id). La migration
 * d'origine créait une colonne user_id, ce qui faisait échouer
 * POST /api/v1/auth/login sur une base neuve.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('personal_access_tokens') || Schema::hasColumn('personal_access_tokens', 'tokenable_id')) {
            return;
        }

        Schema::table('personal_access_tokens', function (Blueprint $table): void {
            $table->string('tokenable_type')->nullable();
            $table->unsignedBigInteger('tokenable_id')->nullable();
        });

        if (Schema::hasColumn('personal_access_tokens', 'user_id')) {
            DB::table('personal_access_tokens')->update([
                'tokenable_type' => 'App\\Models\\User',
                'tokenable_id' => DB::raw('user_id'),
            ]);

            Schema::table('personal_access_tokens', function (Blueprint $table): void {
                $table->dropConstrainedForeignId('user_id');
            });
        }

        Schema::table('personal_access_tokens', function (Blueprint $table): void {
            $table->string('tokenable_type')->nullable(false)->change();
            $table->unsignedBigInteger('tokenable_id')->nullable(false)->change();
            $table->index(['tokenable_type', 'tokenable_id']);
        });
    }

    public function down(): void
    {
        // Forward-only : revenir à user_id casserait Sanctum.
    }
};
