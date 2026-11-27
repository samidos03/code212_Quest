<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Journal des germes (monnaie dépensable de la boutique).
 *
 * Append-only comme le journal XP ; le solde maintenu sur `users.germes_balance`
 * est verrouille (lockForUpdate) lors des operations d'achat et de remboursement.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('germes_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('germes_delta');
            $table->string('source_event', 64);
            $table->string('reference_id', 64);
            $table->string('currency', 16)->default('germes');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(
                ['user_id', 'source_event', 'reference_id'],
                'germes_ledger_user_source_reference_unique'
            );
            $table->index(['user_id', 'created_at'], 'germes_ledger_user_created_index');
        });

        DB::statement(
            'ALTER TABLE germes_ledger ADD CONSTRAINT germes_ledger_delta_check CHECK (germes_delta <> 0)'
        );

        DB::unprepared(<<<'SQL'
            CREATE OR REPLACE FUNCTION germes_ledger_append_only() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'germes_ledger est append-only : operation % interdite', TG_OP
                    USING ERRCODE = 'restrict_violation';
            END;
            $$ LANGUAGE plpgsql;
        SQL);

        DB::unprepared(
            'CREATE TRIGGER germes_ledger_no_update BEFORE UPDATE ON germes_ledger '
            .'FOR EACH ROW EXECUTE FUNCTION germes_ledger_append_only()'
        );
        DB::unprepared(
            'CREATE TRIGGER germes_ledger_no_delete BEFORE DELETE ON germes_ledger '
            .'FOR EACH ROW EXECUTE FUNCTION germes_ledger_append_only()'
        );
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS germes_ledger_no_delete ON germes_ledger');
        DB::unprepared('DROP TRIGGER IF EXISTS germes_ledger_no_update ON germes_ledger');
        DB::unprepared('DROP FUNCTION IF EXISTS germes_ledger_append_only()');

        Schema::dropIfExists('germes_ledger');
    }
};
