<?php

declare(strict_types=1);

use App\Exceptions\BusinessRuleException;
use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: null,
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Alias de middleware metier (role:admin,moderator).
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);

        // Derriere un reverse proxy (Nginx / Traefik).
        $middleware->trustProxies('*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            static fn (Request $request): bool => $request->is('api/*') || $request->expectsJson()
        );

        // Erreurs metier : reponse normalisee {message, errors}.
        $exceptions->render(static function (BusinessRuleException $e): Response {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors() === [] ? (object) [] : $e->errors(),
            ], $e->status());
        });

        $exceptions->render(static function (ValidationException $e): Response {
            return response()->json([
                'message' => 'Les donnees transmises sont invalides.',
                'errors' => $e->errors(),
            ], 422);
        });
    })
    ->create();
