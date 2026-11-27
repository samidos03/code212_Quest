---
name: laravel-backend-conventions
description: Use when adding or changing Laravel routes, controllers, FormRequests, services, Eloquent models, resources, exceptions, policies, or API responses in Code212 Quest. Apply these conventions to keep the backend secure, testable, and consistent with its existing API contract.
---

# Laravel Backend Conventions

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md) first. The backend supports Laravel 11/12 and PHP `^8.2`. Keep API contract changes explicit: current Laravel success responses use `{ data, meta? }` with French snake_case fields; adapt at the React boundary rather than introducing a second response style.

## 1. Keep responsibilities separate

Implement an endpoint through these layers:

1. **Route:** declare it under the existing API version group in `routes/api.php`; apply authentication and the correct role/ability middleware.
2. **Policy:** authorize access to the model/action. A hidden or disabled UI button is not authorization.
3. **FormRequest:** validate and authorize request-level prerequisites. Use `$request->validated()`, never `$request->all()`.
4. **Controller:** authorize the resource, pass validated input and the authenticated actor to a service, then return an `ApiResponse`. Keep it free of business rules, multi-step writes, and manual JSON serialization.
5. **Service:** implement business rules and own transactions for atomic multi-model changes. Throw a typed domain exception for an expected business rejection; allow unexpected failures to surface to the exception handler.
6. **Resource:** expose only the API fields the caller needs. Use `JsonResource` and `ApiResponse`; keep database writes and query orchestration out of Resources.
7. **Tests:** cover success, validation, authorization, and the response envelope. Use PostgreSQL for PostgreSQL-specific behavior.

Wrong:

```php
public function store(Request $request): JsonResponse
{
    $quest = Quest::create($request->all());
    // More model writes and business decisions here.
    return response()->json($quest);
}
```

Right:

```php
public function store(StoreQuestRequest $request): JsonResponse
{
    $this->authorize('create', Quest::class);
    $quest = $this->quests->create($request->validated(), $request->user());

    return ApiResponse::resource(new QuestResource($quest), 201);
}
```

The service method is illustrative: use the existing service and method conventions in the target domain. The current `QuestController` still contains direct model creation for a quest and its steps; do not copy that pattern into new endpoints, and refactor it when the related flow is changed.

## 2. Validate and map input deliberately

- Put request shape, ranges, and required fields in a FormRequest. Keep authorization checks in policies for resource/action decisions; a FormRequest's `authorize()` may enforce simple authenticated-user prerequisites.
- Map validated fields explicitly to the model/domain names. The API uses names such as `titre`, `voie`, and `difficulte`; map these deliberately to internal English attributes like `title` and `track_code`.
- Keep `$fillable` narrow. Do not pass an arbitrary validated payload into a model merely because the model lists those keys as fillable.
- Treat `roles`, `xp_total`, `germes_balance`, ledger fields, and other permission/economy fields as trusted-service-only. Change them through reviewed domain services with the required audit/idempotency behavior, not through general profile update requests.

Wrong:

```php
User::create($request->validated());
```

Right:

```php
$data = $request->validated();

$user->fill([
    'name' => $data['name'],
    'locale' => $data['locale'],
])->save();
```

Use the fields that the specific request is allowed to change; do not copy this example as a universal profile contract.

## 3. Use explicit PHP types and configuration

- Start PHP source files with `declare(strict_types=1);`.
- Use backed enums for closed sets of persisted states and events, as the quest flow does with `SubmissionStatus` and `EnrollmentStatus`. Avoid scattered status strings.
- Use typed parameters and return types for public methods. Use typed domain exceptions such as `BusinessRuleException` for expected domain failures.
- Read environment variables only inside `config/*.php`; application code reads values through `config()`.

Wrong:

```php
$token = env('UCA_CLIENT_SECRET');
```

Right:

```php
$token = config('services.uca.client_secret');
```

If a value is missing from configuration, add it to the relevant config file and environment example rather than reading `env()` in a controller or service.

## 4. Detect Eloquent mistakes early

Enable Eloquent strictness in local and test environments in a service provider:

```php
if ($this->app->environment(['local', 'testing'])) {
    \Illuminate\Database\Eloquent\Model::shouldBeStrict();
}
```

`shouldBeStrict()` enables lazy-loading prevention as well as checks for silently discarded and missing attributes. Eager-load relations used by Resources and views rather than disabling the guard to hide an N+1. Do not enable this as a production behavior change without measuring and reviewing its failure handling.

## 5. Keep the API envelope consistent

- Success responses use `ApiResponse`: `{ "data": ... }`, with `meta` only when present. Paginated responses put pagination details in `meta.pagination`.
- Resource fields follow the existing French snake_case API convention until an explicit, coordinated contract migration is approved. Do not mix camelCase in one new endpoint.
- Expected validation/domain errors use `{ "message": "...", "errors": { ... } }`; validation failures return 422, and `BusinessRuleException` is rendered by the configured Laravel exception handler.
- Do not return raw Eloquent models, leak internal fields, wrap an already wrapped response, or convert an exception into a success-shaped fallback.

Wrong:

```php
return response()->json(['quest' => $quest]);
```

Right:

```php
return ApiResponse::data(['inscription_id' => $enrollment->getKey()], 201);
```

For collections, use `ApiResponse::paginated()` or the existing collection/resource helper so callers always receive the established envelope.

## 6. Endpoint completion checklist

- [ ] Route is in the correct `/api/v1` group with authentication, middleware, and policy authorization.
- [ ] FormRequest validates all client input; only its validated data reaches the service.
- [ ] Service owns business invariants and atomic transactions; expected failures use typed exceptions.
- [ ] Resource and `ApiResponse` preserve the response envelope and field convention.
- [ ] Tests cover success, validation errors, unauthorized/forbidden access, and response JSON shape.
- [ ] Tests cover idempotency/concurrency or database constraints when the endpoint relies on them; read [database-and-migrations](../database-and-migrations/SKILL.md).
- [ ] No privileged fields can be mass-assigned from client input; read [security-review](../security-review/SKILL.md) for sensitive endpoints.

## Final checklist

- [ ] Controller is thin; business writes and transactions are in a service.
- [ ] Strict types, enums, typed exceptions, and config access are used appropriately.
- [ ] FormRequest, policy, and model mapping prevent trusting raw client input.
- [ ] Eloquent strictness catches lazy loads and invalid attribute access in local/tests.
- [ ] Response shape, error envelope, tests, and API contract match the V1 convention.
