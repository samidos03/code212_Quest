<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Artisan;

// Les commandes planifiees (quotas, challenges, rappels) sont declarees ici.
Artisan::command('code212:verifier-contrat', function (): void {
    $this->info('Contrat API disponible dans docs/API_CONTRACT.md');
})->purpose('Affiche un rappel du contrat API');
