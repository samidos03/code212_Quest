<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Configuration applicative versionnee (cles -> valeurs jsonb).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_config_rules', function (Blueprint $table): void {
            $table->string('key', 120)->primary();
            $table->jsonb('value')->default(DB::raw("'{}'::jsonb"));
            $table->integer('version')->default(1);
            $table->timestamps();

            $table->index('version', 'system_config_rules_version_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_config_rules');
    }
};
