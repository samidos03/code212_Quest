<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * Construction des cles d'idempotence.
 *
 * Regle metier : une soumission d'etape est identifiee par le triplet
 * (user_id, quest_id, step_id). Une cle d'idempotence est donc derivee de ce
 * triplet, ce qui rend la soumission rejouable sans double effet.
 */
final class IdempotencyKey
{
    public const HEADER = 'Idempotency-Key';

    public static function forStep(User $user, int $questId, int $stepId): string
    {
        return sprintf('quest-step:%d:%d:%d', $user->getKey(), $questId, $stepId);
    }

    public static function forChallenge(User $user, int $challengeId): string
    {
        return sprintf('challenge:%d:%d', $user->getKey(), $challengeId);
    }

    /**
     * Cle fournie par le client (header Idempotency-Key) ou derivee du perimetre.
     */
    public static function fromRequest(Request $request, string $scope, string $fallback): string
    {
        $provided = trim((string) $request->header(self::HEADER, ''));

        if ($provided !== '') {
            return $scope.':'.$provided;
        }

        return $fallback;
    }

    /**
     * Empreinte du contenu soumis : sert a detecter un conflit d'idempotence.
     *
     * @param array<string, mixed> $payload
     */
    public static function fingerprint(array $payload): string
    {
        ksort($payload);

        return hash('sha256', (string) json_encode($payload, JSON_THROW_ON_ERROR));
    }
}
