<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * Le consentement (mode competition) est necessaire pour exposer des donnees.
 */
class ConsentRequiredException extends BusinessRuleException
{
    public function __construct(string $message = 'Le consentement de l\'utilisateur est requis pour cette operation.')
    {
        parent::__construct($message, ['consentement' => [$message]], 403);
    }
}
