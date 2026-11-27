<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restreint l'acces a certains roles (alias de middleware : `role`).
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json([
                'message' => 'Authentification requise.',
                'errors' => (object) [],
            ], 401);
        }

        foreach ($roles as $role) {
            if ($user->hasRole(UserRole::tryFrom($role) ?? $role)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Acces refuse : role insuffisant.',
            'errors' => (object) [],
        ], 403);
    }
}
