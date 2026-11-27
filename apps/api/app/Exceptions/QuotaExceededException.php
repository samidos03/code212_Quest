<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Quota anti-abus atteint (Forge, boutique, claims...).
 */
class QuotaExceededException extends BusinessRuleException
{
    public function __construct(string $message, array $errors = [])
    {
        parent::__construct($message, $errors === [] ? ['quota' => [$message]] : $errors, 422);
    }
}
