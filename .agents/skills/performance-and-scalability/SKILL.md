---
name: performance-and-scalability
description: Use when changing Laravel queries, dashboards, leaderboards, analytics, pagination, caching, queues, database indexes, or handling expected student concurrency in Code212 Quest. Measure the bottleneck and protect correctness before optimizing.
---

# Backend and Data Performance

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md). The provisional load target is API p95 below 500 ms at 500 concurrent users; it is not an approved release SLO until validated by the team. Use [database-and-migrations](../database-and-migrations/SKILL.md) for locking, schema, ledger, and index-safety details.

## 1. Measure the actual bottleneck

- Identify the slow route/job and representative request/data size before optimizing.
- Capture query count, slow-query timing, response latency, and memory use with the available environment tools. Do not add a cache or index solely because a table may grow.
- Test the flow that will be concurrent: login burst, quest/catalog reads, step submissions, purchases, and leaderboard reads. Include database contention and queue lag where relevant.
- Compare before/after on the same representative dataset. Keep correctness, authorization, and ordering unchanged.

## 2. Bound queries and eliminate N+1 work

- Eager-load only relations required by the response; use `withCount()` for counts instead of loading child collections.
- Avoid loading every enrollment, role, ledger row, or analytics input into PHP just to count, sum, or take a small page.
- Keep query filters, counts, grouping, and limits in SQL where appropriate. Select only required columns for large result sets.
- Enable Eloquent strictness in local/tests as described by [laravel-backend-conventions](../laravel-backend-conventions/SKILL.md); fix lazy loads rather than suppressing the guard.

Wrong:

```php
$enrollments = QuestEnrollment::all();

foreach ($enrollments as $enrollment) {
    echo $enrollment->quest->title;
}
```

Right:

```php
$enrollments = QuestEnrollment::query()
    ->with('quest:id,code,title')
    ->orderByDesc('last_activity_at')
    ->paginate(20);
```

**Code212 note:** `DashboardService` eager-loads quests but retrieves all of a user's enrollments before applying the active-quest limit in PHP. Move limits/counts into the query as this flow evolves. `AnalyticsService::usersByRole()` also plucks every user's role data into PHP; profile it at the expected dataset size.

## 3. Choose bounded pagination

- Validate and clamp client page size; do not allow an unbounded `limite`. Use a consistent default and maximum for endpoints.
- Use length-aware offset pagination when clients need page numbers and total counts and the result set is bounded.
- Consider cursor pagination for large, frequently changing feeds such as Forge activity or ledger history. Order by a stable unique tuple and add an index matching the filter/order.
- Cursor pagination changes the response contract: `ApiResponse::paginated()` currently accepts a length-aware paginator and emits `meta.pagination` with total/last page. Preserve or deliberately version the API metadata when adding cursor pagination.

## 4. Stop recomputing leaderboards and analytics from the full ledger

**Code212 hot path:** `LeaderboardService::ranking()` groups and sums `xp_ledger` on each request; `positionOf()` may run more aggregate queries when the user is outside the displayed top rows. Its fallback also applies an aggregate in `whereRaw()` after grouping; verify and correct that query with a PostgreSQL test before caching it. `LevelService` and dashboard/analytics paths also sum the ledger.

- Keep the append-only ledger as the source of truth, but serve rankings from a rebuildable aggregate/snapshot or a short-lived cache instead of repeatedly scanning the full history.
- For a v1 cache, use a short explicit TTL (start around 30–60 seconds and measure), with keys scoped by ranking type/track/period and a version. Define whether writes invalidate the key or temporary staleness is acceptable.
- Invalidate or recompute when XP changes or a user opts in/out; cached results must never include a user who withdrew consent.
- If using an aggregate table, update it idempotently from ledger events and provide a reconciliation/rebuild path from the source ledger. Do not make a cache the only copy of XP.
- Cache analytics snapshots separately from live transactional state. Avoid calculating a series with one full ledger scan per point; aggregate by date in one query or precompute it.

Illustrative cache boundary (extract the current ranking query into a service method):

```php
$key = 'leaderboard:v1:'.($trackCode ?? 'global');

$entries = Cache::remember($key, 45, fn () => $this->buildRanking($trackCode));
```

Include all result-affecting filters in the key; invalidate/rebuild it on relevant ledger or consent changes. Never cache personalized or permission-sensitive data under a shared key.

## 5. Use queues for slow, non-blocking work

- Keep the HTTP request synchronous only for work needed to decide the response or preserve an atomic invariant. Move slow notifications, exports, and non-critical aggregate refreshes to queued jobs.
- The project config supports Redis queues and `.env.example` selects Redis, but a queue configuration alone does not run workers. Verify worker deployment, failed-job monitoring, retry limits, timeout, and queue depth before relying on asynchronous work.
- `config/queue.php` currently sets Redis `after_commit` to `false`. For jobs that read rows created/updated in a transaction, dispatch after commit or explicitly set an appropriate after-commit policy.
- Make jobs idempotent. A retry must not award XP twice, debit Germes twice, send duplicate irreversible actions, or expose stale authorization.
- Keep user-visible state explicit (`pending`, `failed`, `complete`) when queued work is not immediate; do not return a success-shaped fallback.

## 6. Index from plans and test concurrency

- Check the existing PostgreSQL indexes and inspect representative query plans before adding indexes. Follow [database-and-migrations](../database-and-migrations/SKILL.md) for `EXPLAIN`, deployment locks, and migration rollout.
- Index for the actual predicate/order combination, not each column in isolation. Account for added write amplification on append-heavy tables.
- Test lock-heavy purchases and ledger awards with concurrent requests. Preserve one deterministic row-lock order; a faster query that permits a duplicate award, negative balance, or oversold stock is a regression.
- Load-test the leaderboard and ledger writes with realistic data volume. Record concurrency, data shape, p50/p95/p99 latency, error rate, and database/queue saturation.

## Final checklist

- [ ] A real bottleneck and baseline were recorded before optimization.
- [ ] Queries are bounded; N+1 and unbounded in-memory aggregation are removed or tracked.
- [ ] Pagination is capped and uses an order/index suitable for the feed.
- [ ] Leaderboard/analytics do not repeatedly aggregate the full ledger on hot requests.
- [ ] Cache keys include every relevant scope; invalidation respects XP changes and consent.
- [ ] Queued jobs are after-commit where needed, idempotent, monitored, and backed by running workers.
- [ ] Concurrency tests preserve balances, idempotency, and row-lock ordering.
- [ ] The provisional 500-user p95 target is measured, not claimed without a load test.
