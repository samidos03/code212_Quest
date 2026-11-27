<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('forge_threads')) {
            Schema::table('forge_threads', function (Blueprint $table): void {
                if (!Schema::hasColumn('forge_threads', 'last_activity_at')) {
                    $table->timestamp('last_activity_at')->nullable()->index();
                }
                if (!Schema::hasColumn('forge_threads', 'last_reply_id')) {
                    $table->unsignedBigInteger('last_reply_id')->nullable();
                }
                if (!Schema::hasColumn('forge_threads', 'is_pinned')) {
                    $table->boolean('is_pinned')->default(false)->index();
                }
            });
        }
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'forge_last_visit_at')) {
            Schema::table('users', fn (Blueprint $table) => $table->timestamp('forge_last_visit_at')->nullable());
        }
        if (!Schema::hasTable('forge_thread_reads')) {
            Schema::create('forge_thread_reads', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('thread_id')->constrained('forge_threads')->cascadeOnDelete();
                $table->foreignId('last_read_post_id')->nullable()->constrained('forge_solutions')->nullOnDelete();
                $table->timestamp('read_at');
                $table->timestamps();
                $table->unique(['user_id', 'thread_id']);
                $table->index(['user_id', 'read_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('forge_thread_reads');
        if (Schema::hasTable('forge_threads')) {
            Schema::table('forge_threads', function (Blueprint $table): void {
                foreach (['last_activity_at', 'last_reply_id', 'is_pinned'] as $column) {
                    if (Schema::hasColumn('forge_threads', $column)) $table->dropColumn($column);
                }
            });
        }
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'forge_last_visit_at')) {
            Schema::table('users', fn (Blueprint $table) => $table->dropColumn('forge_last_visit_at'));
        }
    }
};
