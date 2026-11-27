<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Categories de la Forge (espaces de discussion entre apprenants).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forge_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 160);
            $table->text('description')->nullable();
            $table->string('color', 16)->nullable();
            $table->string('icon', 32)->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_categories');
    }
};
