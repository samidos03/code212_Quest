<?php

declare(strict_types=1);

return [
    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // --- SSO UCA / OpenID Connect --------------------------------------------
    'uca' => [
        'oidc' => [
            'enabled' => (bool) env('UCA_OIDC_ENABLED', false),
            'issuer' => env('UCA_OIDC_ISSUER', 'https://sso.uca.ma/realms/uca'),
            'client_id' => env('UCA_OIDC_CLIENT_ID', 'code212-quest'),
            'client_secret' => env('UCA_OIDC_CLIENT_SECRET'),
            'redirect_uri' => env('UCA_OIDC_REDIRECT_URI', env('APP_URL', 'http://localhost:8000').'/api/v1/auth/uca/callback'),
            'scopes' => array_values(array_filter(explode(' ', (string) env('UCA_OIDC_SCOPES', 'openid profile email')))),
            'authorize_url' => env('UCA_OIDC_AUTHORIZE_URL'),
            'token_url' => env('UCA_OIDC_TOKEN_URL'),
            'userinfo_url' => env('UCA_OIDC_USERINFO_URL'),
            'jwks_url' => env('UCA_OIDC_JWKS_URL'),
            'timeout' => (int) env('UCA_OIDC_TIMEOUT', 10),
        ],
    ],

    // --- API Libki (presence / reservations) ----------------------------------
    'libki' => [
        'enabled' => (bool) env('LIBKI_API_ENABLED', false),
        'base_url' => env('LIBKI_API_BASE_URL'),
        'token' => env('LIBKI_API_TOKEN'),
        'webhook_secret' => env('LIBKI_WEBHOOK_SECRET'),
        'checkin_xp' => (int) env('LIBKI_CHECKIN_XP', 15),
        'checkout_xp' => (int) env('LIBKI_CHECKOUT_XP', 5),
    ],
];
