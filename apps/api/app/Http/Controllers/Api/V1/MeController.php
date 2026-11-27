<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePseudonymRequest;
use App\Http\Requests\UpdatePreferencesRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserProfileResource;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Profil, pseudonyme et preferences de l'utilisateur connecte.
 */
class MeController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function show(Request $request): JsonResponse
    {
        return ApiResponse::resource(new UserProfileResource($request->user()));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->fill($request->safe()->only(['name', 'filiere', 'promotion', 'avatar_url', 'locale']));
        $user->save();

        return ApiResponse::resource(new UserProfileResource($user->refresh()));
    }

    /**
     * Choix du pseudonyme public (necessaire pour apparaitre au classement).
     */
    public function pseudonym(StorePseudonymRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill([
            'pseudonym' => (string) $request->input('pseudonyme'),
            'anonymize_leaderboard' => (bool) $request->boolean('anonymiser', false),
        ])->save();

        $this->audit->log($user, 'profile.pseudonym_updated', 'user', $user->getKey());

        return ApiResponse::resource(new UserProfileResource($user->refresh()));
    }

    public function preferences(Request $request): JsonResponse
    {
        return ApiResponse::data($this->preferencesPayload($request));
    }

    public function updatePreferences(UpdatePreferencesRequest $request): JsonResponse
    {
        $user = $request->user();

        /** @var array<string, mixed> $preferences */
        $preferences = (array) ($user->preferences ?? []);
        $preferences['notifications_email'] = (bool) $request->boolean('notifications_email', $preferences['notifications_email'] ?? false);
        $preferences['notifications_forge'] = (bool) $request->boolean('notifications_forge', $preferences['notifications_forge'] ?? true);
        $preferences['theme'] = (string) ($request->input('theme') ?? $preferences['theme'] ?? 'magenta');

        $user->forceFill([
            'competition_opt_in' => (bool) $request->boolean('mode_competition'),
            'preferences' => $preferences,
        ])->save();

        $this->audit->log($user, 'profile.preferences_updated', 'user', $user->getKey(), null, [
            'mode_competition' => (bool) $request->boolean('mode_competition'),
        ]);

        return ApiResponse::data($this->preferencesPayload($request));
    }

    /**
     * @return array<string, mixed>
     */
    private function preferencesPayload(Request $request): array
    {
        $user = $request->user();

        /** @var array<string, mixed> $preferences */
        $preferences = (array) ($user->preferences ?? []);

        return [
            'mode_competition' => (bool) $user->competition_opt_in,
            'anonymise_classement' => (bool) $user->anonymize_leaderboard,
            'notifications_email' => (bool) ($preferences['notifications_email'] ?? false),
            'notifications_forge' => (bool) ($preferences['notifications_forge'] ?? true),
            'theme' => (string) ($preferences['theme'] ?? 'magenta'),
            'langue' => (string) $user->locale,
        ];
    }
}
