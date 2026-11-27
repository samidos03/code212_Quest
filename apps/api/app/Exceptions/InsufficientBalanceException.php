<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Solde de germes insuffisant pour effectuer un achat.
 */
class InsufficientBalanceException extends BusinessRuleException
{
    public function __construct(string $message = 'Solde de germes insuffisant pour cette operation.')
    {
        parent::__construct($message, ['germes' => [$message]], 422);
    }
}
