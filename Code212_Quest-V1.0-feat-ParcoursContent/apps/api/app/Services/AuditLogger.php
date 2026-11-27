<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Journalisation des actions sensibles (administration, moderation, Forge).
 */
final class AuditLogger
{
    /**
     * @param array<string, mixed> $metadata
     */
    public function log(
        ?User $actor,
        string $action,
        ?string $targetType = null,
        int|string|null $targetId = null,
        ?string $justification = null,
        array $metadata = [],
    ): AuditLog {
        return AuditLog::create([
            'actor_id' => $actor?->getKey(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId === null ? null : (string) $targetId,
            'justification' => $justification,
            'metadata' => $metadata,
            'ip_address' => $this->ipAddress(),
            'user_agent' => $this->userAgent(),
        ]);
    }

    /**
     * @param array<string, mixed> $metadata
     */
    public function logAction(
        string $action,
        ?int $actorId,
        ?string $targetType = null,
        int|string|null $targetId = null,
        ?string $justification = null,
        array $metadata = [],
    ): AuditLog {
        return AuditLog::create([
            'actor_id' => $actorId,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId === null ? null : (string) $targetId,
            'justification' => $justification,
            'metadata' => $metadata,
            'ip_address' => $this->ipAddress(),
            'user_agent' => $this->userAgent(),
        ]);
    }

    private function ipAddress(): ?string
    {
        if (! app()->bound('request')) {
            return null;
        }

        $ip = request()->ip();

        return $ip === null ? null : substr($ip, 0, 45);
    }

    private function userAgent(): ?string
    {
        if (! app()->bound('request')) {
            return null;
        }

        $agent = request()->userAgent();

        return $agent === null ? null : substr($agent, 0, 255);
    }
}
