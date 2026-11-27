<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Une soumission idempotente existe deja avec un contenu different.
 */
class IdempotencyConflictException extends BusinessRuleException
{
    public function __construct(
        string $message = 'Une soumission existe deja pour cette etape avec un contenu different.',
        array $errors = [],
    ) {
        parent::__construct($message, $errors === [] ? ['idempotence' => [$message]] : $errors, 409);
    }
}
