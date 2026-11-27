<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Candidatures aux roles de formateur / moderateur / administrateur.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role_code', 32);
            $table->jsonb('evidence')->default(DB::raw("'{}'::jsonb"));
            $table->string('status', 24)->default('en_attente');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'role_code'], 'role_applications_user_role_unique');
            $table->index('status', 'role_applications_status_index');
        });

        DB::statement(
            "ALTER TABLE role_applications ADD CONSTRAINT role_applications_role_code_check "
            ."CHECK (role_code IN ('trainer','moderator','admin'))"
        );
        DB::statement(
            "ALTER TABLE role_applications ADD CONSTRAINT role_applications_status_check "
            ."CHECK (status IN ('en_attente','approuvee','rejetee'))"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('role_applications');
    }
};
