<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Enveloppe de reponse normalisee de l'API.
 *
 * Succes : { "data": ..., "meta": { ... } }
 * Erreur : { "message": "...", "errors": { "champ": ["..."] } }
 */
final class ApiResponse
{
    /**
     * @param array<string, mixed> $meta
     */
    public static function data(mixed $data, int $status = 200, array $meta = []): JsonResponse
    {
        $payload = ['data' => $data];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    /**
     * @param array<string, mixed> $meta
     */
    public static function resource(JsonResource $resource, int $status = 200, array $meta = []): JsonResponse
    {
        $resolved = $resource->resolve(request());

        return self::data($resolved, $status, $meta);
    }

    /**
     * @param array<string, mixed> $meta
     */
    public static function collection(mixed $resource, array $meta = [], int $status = 200): JsonResponse
    {
        if ($resource instanceof JsonResource) {
            $resolved = $resource->resolve(request());
        } else {
            $resolved = $resource;
        }

        return self::data($resolved, $status, $meta);
    }

    /**
     * Collection paginee : la pagination est exposee dans `meta.pagination`.
     *
     * @param array<string, mixed> $meta
     */
    public static function paginated(LengthAwarePaginator $paginator, JsonResource $resource, array $meta = []): JsonResponse
    {
        $meta['pagination'] = [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
        ];

        return self::collection($resource, $meta);
    }

    /**
     * @param array<string, list<string>> $errors
     */
    public static function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'errors' => $errors === [] ? (object) [] : $errors,
        ], $status);
    }

    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
