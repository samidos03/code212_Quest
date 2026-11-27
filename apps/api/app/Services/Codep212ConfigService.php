<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Level;
use App\Models\SystemConfigRule;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Chargement de la configuration metier versionnee
 * (`system_config_rules`) et des seuils de niveaux (`levels_config`).
 */
final class Codep212ConfigService
{
    public const CACHE_KEY = 'code212.config.v1';

    public const LEVELS_CACHE_KEY = 'code212.levels.v1';

    public const TTL_SECONDS = 300;

    /**
     * @return array<string, mixed>
     */
    public function all(): array
    {
        /** @var array<string, mixed> $values */
        $values = Cache::remember(self::CACHE_KEY, self::TTL_SECONDS, static function (): array {
            return SystemConfigRule::query()
                ->orderBy('key')
                ->get()
                ->mapWithKeys(static fn (SystemConfigRule $rule): array => [$rule->key => $rule->value])
                ->all();
        });

        return $values;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        $values = $this->all();

        return $values[$key] ?? $default;
    }

    /**
     * @param array<string, mixed> $value
     */
    public function set(string $key, array $value, ?int $actorId = null): SystemConfigRule
    {
        $rule = SystemConfigRule::query()->firstOrNew(['key' => $key]);
        $rule->value = $value;
        $rule->version = (int) $rule->version + 1;
        $rule->save();

        $this->forget();

        return $rule;
    }

    public function forget(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::LEVELS_CACHE_KEY);
    }

    /**
     * Niveaux globaux ordonnes par seuil d'XP.
     *
     * @return Collection<int, Level>
     */
    public function levels(): Collection
    {
        /** @var Collection<int, Level> $levels */
        $levels = Cache::remember(self::LEVELS_CACHE_KEY, self::TTL_SECONDS, static fn (): Collection => Level::query()
            ->orderBy('xp_threshold')
            ->get());

        return $levels;
    }

    /**
     * Bareme et garde-fous issus du fichier de configuration.
     *
     * @return array<string, mixed>
     */
    public function questsConfig(): array
    {
        /** @var array<string, mixed> $config */
        $config = config('quests', []);

        /** @var array<string, mixed> $stored */
        $stored = (array) $this->get('quests', []);

        return array_replace_recursive($config, $stored);
    }
}
