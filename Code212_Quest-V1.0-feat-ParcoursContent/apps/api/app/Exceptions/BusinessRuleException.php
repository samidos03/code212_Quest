<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

/**
 * Erreur metier attendue : la reponse HTTP est deterministe et normalisee
 * au format {message, errors}.
 */
class BusinessRuleException extends RuntimeException
{
    /**
     * @param array<string, list<string>> $errors
     */
    public function __construct(
        string $message,
        private readonly array $errors = [],
        private readonly int $status = 422,
    ) {
        parent::__construct($message);
    }

    /**
     * @return array<string, list<string>>
     */
    public function errors(): array
    {
        return $this->errors;
    }

    public function status(): int
    {
        return $this->status;
    }

    /**
     * @param array<string, list<string>> $errors
     */
    public static function make(string $message, array $errors = [], int $status = 422): self
    {
        return new self($message, $errors, $status);
    }
}
