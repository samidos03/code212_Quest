<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Exceptions\BusinessRuleException;
use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UcaCallbackRequest;
use App\Http\Resources\UserProfileResource;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Http;

/**
 * Authentification : mot de passe local et SSO UCA (OpenID Connect).
 */
class AuthController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    /**
     * Connexion par identifiant (e-mail ou matricule UCA) et mot de passe.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $identifiant = (string) $request->input('identifiant');

        /** @var User|null $user */
        $user = User::query()
            ->where('email', $identifiant)
            ->first(); // La base existante ne possede pas uca_matricule.

        if ($user === null || $user->password === null || ! Hash::check((string) $request->input('mot_de_passe'), $user->password)) {
            if (Schema::hasTable('audit_logs')) {
                $this->audit->logAction('auth.login_failed', null, 'user', null, null, ['identifiant' => $identifiant]);
            }

            return ApiResponse::error('Identifiants invalides.', 401, ['identifiant' => ['Identifiants invalides.']]);
        }

        $token = $user->createToken((string) ($request->input('nom_appareil') ?? 'front-web'), ['read', 'write']);
        $user->touchLastLogin();

        return ApiResponse::data([
            'token' => $token->plainTextToken,
            'type' => 'Bearer',
            'utilisateur' => (new UserProfileResource($user))->resolve($request),
        ]);
    }

    /**
     * Callback du SSO UCA : echange du code d'autorisation contre un jeton API.
     */
    public function ucaCallback(UcaCallbackRequest $request): JsonResponse
    {
        $claims = $this->fetchUcaClaims((string) $request->input('code'));

        $email = (string) ($claims['email'] ?? '');
        $matricule = isset($claims['matricule']) ? (string) $claims['matricule'] : null;

        if ($email === '' && ($matricule === null || $matricule === '')) {
            throw new BusinessRuleException('Le SSO UCA n a pas retourne d identifiant exploitable.', [], 502);
        }

        /** @var User $user */
        $user = User::query()
            ->where('email', $email)
            ->when($matricule !== null && $matricule !== '', static fn ($query) => $query->orWhere('uca_matricule', $matricule))
            ->first();

        if ($user === null) {
            $user = User::create([
                'name' => (string) ($claims['name'] ?? $claims['preferred_username'] ?? 'Apprenant CODE212'),
                'email' => $email !== '' ? $email : sprintf('%s@uca.ma', $matricule),
                'uca_matricule' => $matricule,
                'filiere' => isset($claims['filiere']) ? (string) $claims['filiere'] : null,
                'promotion' => isset($claims['promotion']) ? (string) $claims['promotion'] : null,
                'roles' => ['student'],
                'locale' => 'fr',
            ]);
        }

        $user->forceFill([
            'uca_matricule' => $matricule ?? $user->uca_matricule,
            'filiere' => $claims['filiere'] ?? $user->filiere,
            'promotion' => $claims['promotion'] ?? $user->promotion,
        ])->save();

        $token = $user->createToken('sso-uca', ['read', 'write']);
        $user->touchLastLogin();

        $this->audit->log($user, 'auth.login_sso', 'user', $user->getKey(), null, ['provider' => 'uca']);

        return ApiResponse::data([
            'token' => $token->plainTextToken,
            'type' => 'Bearer',
            'utilisateur' => (new UserProfileResource($user))->resolve($request),
        ]);
    }

    /**
     * Deconnexion : revocation du jeton courant.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $token = $user?->currentAccessToken();

        if ($token !== null && method_exists($token, 'delete')) {
            $token->delete();
        }

        return ApiResponse::data(['deconnecte' => true]);
    }

    /**
     * Profil de l'utilisateur authentifie.
     */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::resource(new UserProfileResource($request->user()));
    }

    /**
     * Echange du code OIDC contre les informations utilisateur.
     *
     * @return array<string, mixed>
     */
    private function fetchUcaClaims(string $code): array
    {
        /** @var array<string, mixed> $config */
        $config = config('services.uca.oidc', []);

        if (! (bool) ($config['enabled'] ?? false)) {
            throw new BusinessRuleException(
                'La connexion SSO UCA n est pas active sur cet environnement.',
                [],
                503
            );
        }

        $tokenUrl = (string) ($config['token_url'] ?? '');
        $userinfoUrl = (string) ($config['userinfo_url'] ?? '');

        if ($tokenUrl === '' || $userinfoUrl === '') {
            throw new BusinessRuleException('Configuration SSO UCA incomplete (token_url / userinfo_url).', [], 503);
        }

        $response = Http::asForm()
            ->timeout((int) ($config['timeout'] ?? 10))
            ->post($tokenUrl, [
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $config['redirect_uri'] ?? null,
                'client_id' => $config['client_id'] ?? null,
                'client_secret' => $config['client_secret'] ?? null,
            ]);

        if (! $response->successful()) {
            throw new BusinessRuleException('Echec de l echange du code d autorisation UCA.', [], 502);
        }

        $accessToken = (string) ($response->json('access_token') ?? '');

        if ($accessToken === '') {
            throw new BusinessRuleException('Le SSO UCA n a pas retourne de jeton d acces.', [], 502);
        }

        $claims = Http::withToken($accessToken)
            ->timeout((int) ($config['timeout'] ?? 10))
            ->get($userinfoUrl);

        if (! $claims->successful()) {
            throw new BusinessRuleException('Impossible de recuperer les informations du compte UCA.', [], 502);
        }

        /** @var array<string, mixed> $data */
        $data = $claims->json() ?? [];

        return $data;
    }
}
