<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Journal de synchronisation avec l'API Libki (presence / reservations).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('libki_sync_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('external_event_id', 120)->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('reservation_id', 120)->nullable();
            $table->string('event_type', 32);
            $table->timestamp('event_at');
            $table->jsonb('payload')->default(DB::raw("'{}'::jsonb"));
            $table->timestamp('received_at')->useCurrent();
            $table->timestamp('processed_at')->nullable();

            $table->index(['event_type', 'event_at'], 'libki_sync_logs_type_event_index');
            $table->index(['user_id', 'event_at'], 'libki_sync_logs_user_event_index');
        });

        DB::statement(
            "ALTER TABLE libki_sync_logs ADD CONSTRAINT libki_sync_logs_event_type_check "
            ."CHECK (event_type IN ('check_in','check_out','reservation_honored','no_show','session_active'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('libki_sync_logs');
    }
};
