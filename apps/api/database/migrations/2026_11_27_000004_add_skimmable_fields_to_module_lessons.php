<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('module_lessons', function (Blueprint $table): void {
            $table->jsonb('key_points')->nullable()->after('summary');
            $table->text('example_code')->nullable()->after('content');
            $table->text('example_explanation')->nullable()->after('example_code');
        });
    }

    public function down(): void
    {
        Schema::table('module_lessons', function (Blueprint $table): void {
            $table->dropColumn(['key_points', 'example_code', 'example_explanation']);
        });
    }
};
