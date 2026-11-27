<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Journal XP append-only.
 *
 * Invariant central : aucune mise a jour ni suppression n'est possible.
 * Une correction se fait par ecriture compensatoire (xp_delta negatif).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('xp_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // null = XP global (niveaux) ; valeur = XP de voie.
            $table->string('track_type', 32)->nullable();

            $table->integer('xp_delta');
            $table->string('source_event', 64);
            $table->string('reference_id', 64);
            $table->integer('rule_version')->default(1);
            $table->text('admin_justification')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(
                ['user_id', 'source_event', 'reference_id'],
                'xp_ledger_user_source_reference_unique'
            );
            $table->index(['user_id', 'created_at'], 'xp_ledger_user_created_index');
            $table->index(['source_event', 'created_at'], 'xp_ledger_source_created_index');
            $table->foreign('track_type')->references('code')->on('progression_tracks')->nullOnDelete();
        });

        DB::statement(
            'ALTER TABLE xp_ledger ADD CONSTRAINT xp_ledger_xp_delta_check CHECK (xp_delta <> 0)'
        );

        // Garde-fou applicatif : table strictement append-only, y compris en base.
        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION xp_ledger_append_only() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'xp_ledger est append-only : operation % interdite', TG_OP
                    USING ERRCODE = 'restrict_violation';
            END;
            $$ LANGUAGE plpgsql;
        SQL);

        DB::unprepared(
            'CREATE TRIGGER xp_ledger_no_update BEFORE UPDATE ON xp_ledger '
            .'FOR EACH ROW EXECUTE FUNCTION xp_ledger_append_only()'
        );
        DB::unprepared(
            'CREATE TRIGGER xp_ledger_no_delete BEFORE DELETE ON xp_ledger '
            .'FOR EACH ROW EXECUTE FUNCTION xp_ledger_append_only()'
        );
        DB::unprepared(
            'CREATE TRIGGER xp_ledger_no_truncate BEFORE TRUNCATE ON xp_ledger '
            .'FOR EACH STATEMENT EXECUTE FUNCTION xp_ledger_append_only()'
        );
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS xp_ledger_no_truncate ON xp_ledger');
        DB::unprepared('DROP TRIGGER IF EXISTS xp_ledger_no_delete ON xp_ledger');
        DB::unprepared('DROP TRIGGER IF EXISTS xp_ledger_no_update ON xp_ledger');
        DB::unprepared('DROP FUNCTION IF EXISTS xp_ledger_append_only()');

        Schema::dropIfExists('xp_ledger');
    }
};
