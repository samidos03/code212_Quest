<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * Controleur de base (autorisations via les Policies).
 */
abstract class Controller extends BaseController
{
    use AuthorizesRequests;
}
