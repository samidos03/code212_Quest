<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Plafond journalier d'XP atteint : garde-fou anti-abus.
 */
class XpCapExceededException extends BusinessRuleException
{
    public function __construct(
        string $message = 'Plafond journalier d\'XP atteint pour cette regle.',
        array $errors = [],
    ) {
        parent::__construct($message, $errors === [] ? ['xp' => [$message]] : $errors, 422);
    }
}
