<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Challenge;
use App\Models\ForgeCategory;
use App\Models\Quest;
use App\Models\Reward;
use App\Models\Submission;
use App\Models\User;
use App\Policies\AdminPolicy;
use App\Policies\ChallengePolicy;
use App\Policies\ForgeModerationPolicy;
use App\Policies\QuestPolicy;
use App\Policies\RewardPolicy;
use App\Policies\SubmissionPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

/**
 * Configuration applicative : politiques, Sanctum, rate limiting, JSON.
 */
class AppServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    public array $policies = [
        Quest::class => QuestPolicy::class,
        Submission::class => SubmissionPolicy::class,
        Reward::class => RewardPolicy::class,
        Challenge::class => ChallengePolicy::class,
        User::class => AdminPolicy::class,
        ForgeCategory::class => ForgeModerationPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ($this->policies as $model => $policy) {
            \Illuminate\Support\Facades\Gate::policy($model, $policy);
        }

        // Sanctum : jetons d'API stateless pour le front React/TS.
        \Illuminate\Support\Facades\Gate::define('competitions', static fn (User $user): bool => $user->competition_opt_in);

        // Alias de middleware Sanctum (abilities) : enregistrement explicite.
        $router = $this->app['router'];
        $router->aliasMiddleware('abilities', \Laravel\Sanctum\Http\Middleware\CheckAbilities::class);
        $router->aliasMiddleware('ability', \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class);

        RateLimiter::for('api', static function (Request $request): Limit {
            return Limit::perMinute(120)->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });

        RateLimiter::for('api-auth', static function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('api-write', static function (Request $request): Limit {
            return Limit::perMinute(30)->by($request->user()?->getAuthIdentifier() ?: $request->ip());
        });
    }
}
