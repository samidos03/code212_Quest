<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Tableau de bord personnel (structure produite par DashboardService).
 */
class DashboardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $dashboard */
        $dashboard = is_array($this->resource) ? $this->resource : [];

        return $dashboard;
    }
}
