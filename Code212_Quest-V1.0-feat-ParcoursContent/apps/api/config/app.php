<?php

declare(strict_types=1);

return [
    'name' => env('APP_NAME', 'Code212 Quest API'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost:8000'),
    'asset_url' => env('ASSET_URL'),
    'timezone' => env('APP_TIMEZONE', 'Africa/Casablanca'),
    'locale' => env('APP_LOCALE', 'fr'),
    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'fr'),
    'faker_locale' => 'fr_FR',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
    ))),
    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => 'cache',
    ],
];
