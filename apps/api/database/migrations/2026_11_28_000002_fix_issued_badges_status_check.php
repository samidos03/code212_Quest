<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * La contrainte d'origine attendait 'pending'/'issued'/'revoked' alors que
 * l'enum IssuedBadgeStatus écrit 'en_attente'/'delivre'/'revoque' : toute
 * délivrance de badge échouait (par ex. à l'inscription à une quête).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('issued_badges') || DB::getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('ALTER TABLE issued_badges DROP CONSTRAINT IF EXISTS issued_badges_status_check');
        DB::statement("UPDATE issued_badges SET status = CASE status WHEN 'pending' THEN 'en_attente' WHEN 'issued' THEN 'delivre' WHEN 'revoked' THEN 'revoque' ELSE status END");
        DB::statement("ALTER TABLE issued_badges ALTER COLUMN status SET DEFAULT 'en_attente'");
        DB::statement("ALTER TABLE issued_badges ADD CONSTRAINT issued_badges_status_check CHECK (status IN ('en_attente', 'delivre', 'revoque'))");
    }

    public function down(): void
    {
        // Forward-only.
    }
};
