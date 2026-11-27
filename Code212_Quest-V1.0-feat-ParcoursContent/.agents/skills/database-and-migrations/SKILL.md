---
name: database-and-migrations
description: Use when changing Laravel migrations, PostgreSQL schema, Eloquent persistence, seeders, transaction/locking behavior, or XP/Germes ledgers in Code212 Quest. Apply these rules before changing data invariants or deploying schema changes.
---

# Database and Migrations

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md). Code212 Quest uses Laravel 11/12 with PostgreSQL; database-specific behavior must be tested on PostgreSQL, not inferred from SQLite.

## 1. Treat shared migrations as immutable

- Never edit a migration that has been applied or shared with another branch/environment. Add a new forward-only migration.
- Use an expand → migrate/backfill → contract sequence for changes that must coexist with old and new application versions. Deploy compatible code before removing old columns or values.
- Make backfills resumable and bounded; avoid loading an entire large table into PHP memory.
- Add database constraints for invariants (foreign keys, unique keys, `CHECK` constraints). Request validation improves error messages but does not protect against concurrent requests or other writers.
- For a large production table, assess lock duration and index-build impact before deploying. Inspect the migration's transaction behavior before using PostgreSQL concurrent index creation; do not assume a blocking schema change is safe.

## 2. Protect the XP and Germes ledgers

The ledgers are financial-like audit records, even though their units are gamified:

- Treat `xp_ledger` and `germes_ledger` as append-only. Never update or delete an entry to correct it; write an idempotent compensating entry with a reason/actor where the domain requires one.
- Preserve the unique idempotency key `(user_id, source_event, reference_id)` and non-zero delta constraint. Keep balances derived from or reconciled against ledger entries; never accept balance changes from an untrusted request.
- Preserve PostgreSQL triggers as a second line of defense. The current XP migration blocks `UPDATE`, `DELETE`, and `TRUNCATE`; the Germes migration blocks `UPDATE` and `DELETE` but does not currently define a truncate trigger. Do not assume their protections are identical: test each invariant and track any required trigger gap.
- Keep rule/version and source references sufficient to explain why an award or debit happened. Corrections must be traceable and must not rewrite history.

## 3. Make idempotency safe under PostgreSQL transactions

Use the database unique constraint as the final arbiter of duplicate requests. If the key already exists with different content, return a typed conflict; do not silently treat it as the same operation. Bind all values—never interpolate request input into SQL.

Wrong:

```php
DB::transaction(function () use ($attributes): void {
    try {
        DB::table('xp_ledger')->insert($attributes);
    } catch (QueryException $exception) {
        // PostgreSQL has marked this transaction as failed.
    }
});
```

Right:

```sql
INSERT INTO xp_ledger (user_id, source_event, reference_id, xp_delta)
VALUES (?, ?, ?, ?)
ON CONFLICT (user_id, source_event, reference_id) DO NOTHING;
```

Then read by the unique idempotency key and compare the stored fingerprint; return the existing row or a typed conflict. A PostgreSQL statement error aborts the current transaction until rollback. Do not catch a unique violation inside a transaction and continue using that transaction. Existing services catch some unique violations outside `DB::transaction`; do not move those catches inward, and prefer the conflict-safe insert pattern when changing those flows.

## 4. Make transactions and locks deterministic

- Put related writes in one `DB::transaction()` in the domain service, so stock, balance, order, and ledger changes commit or roll back together.
- Lock the rows that protect the invariant with `lockForUpdate()` inside the transaction. Re-read state after acquiring the lock; a model loaded before the transaction may be stale.
- Establish and document a consistent lock order across services, including a deterministic order for multiple rows. Different lock order can deadlock under concurrency.
- **Code212 hotspot:** `RewardService::purchase()` locks a reward then a user, while rejection locks an order, user, then reward. Review and align the order before extending these flows; add concurrency-focused tests for contention and retries.
- Daily/weekly XP caps must remain correct when two requests award concurrently. A `SUM` checked before a write transaction is not, by itself, a concurrency guarantee; use a serialization/locking strategy or a database-enforced design and test it.
- Retry only known transient concurrency failures at a bounded layer; keep jobs and operations idempotent so retries cannot double-award or double-debit.

## 5. Add indexes from query evidence

- Index the columns used by real filters, joins, ordering, and foreign-key lookups; avoid speculative indexes that increase write and storage costs.
- Check existing indexes before adding another. This project already defines compound indexes for ledger user/date lookups, submission status queues, quest filters, and other common paths.
- Use representative PostgreSQL data and inspect query plans before/after an index change:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...;
```

`ANALYZE` executes the query. Use it only with safe read-only queries and a representative non-production environment, or under an approved production measurement plan. For writes or potentially expensive queries, start with plain `EXPLAIN`.

## 6. Keep seeders safe by environment

- Separate stable reference data (roles, tracks, rules, quest catalog) from credentials and demo users.
- `DatabaseSeeder` currently seeds reference/catalog data and gates `AdminUserSeeder` and `DemoUserSeeder` to local/testing/development environments. Preserve that guard; never make demo accounts or default credentials available in production.
- Review every production seeding command and the seeder call graph before using it. Do not assume every seeder is safe merely because it is called by `DatabaseSeeder`.
- Seeders should be repeatable and should not erase user progress or ledger history.

## 7. Prove database invariants with PostgreSQL tests

Use the existing PHPUnit feature tests as prior art. Add or update tests to prove behavior at the database boundary:

- Duplicate ledger event is idempotent; same key with changed payload conflicts.
- Unique, check, foreign-key, and status constraints reject invalid writes.
- XP and Germes entries cannot be edited or deleted; verify truncate behavior where append-only is required.
- Compensation creates a new entry and leaves the original unchanged.
- Insufficient stock/balance, concurrent purchase, and failed transactions leave no partial writes.
- Migration runs from a clean PostgreSQL database and preserves existing data in upgrade tests when required.

Do not use a mocked repository to claim a PostgreSQL constraint or trigger is tested.

## Final checklist

- [ ] Shared migrations were not rewritten; the change is forward-only and deployment-compatible.
- [ ] Database constraints enforce invariants independently of application validation.
- [ ] Ledger changes are idempotent, append-only, and corrected only with traceable compensating entries.
- [ ] No PostgreSQL unique error is caught and continued inside an active transaction.
- [ ] Transaction boundaries and row-lock ordering are explicit and concurrency-safe.
- [ ] Index choice is supported by query-plan evidence.
- [ ] Production seed paths cannot create demo/admin credentials.
- [ ] Relevant invariants pass tests against PostgreSQL.
