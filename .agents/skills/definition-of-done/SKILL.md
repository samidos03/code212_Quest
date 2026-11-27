---
name: definition-of-done
description: Use when implementing or reviewing any Code212 Quest change, fixing a bug, preparing a PR, or reporting completion. Apply its verified test/build gates and evidence rules so work is not called done without checks.
---

# Definition of Done

Use this skill to decide whether a change is verified and ready for review. Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md) for shared project choices. Follow `CLAUDE.md` if the repository adds one; this skill defines verification and reporting, not general stack setup.

## 1. Set the acceptance bar before coding

1. Turn the request into observable acceptance criteria.
2. Identify affected behavior, API boundaries, roles, data, and failure cases.
3. Decide which checks below apply. Do not silently downgrade a required check because it is inconvenient.
4. If a requirement or environment blocks a meaningful test, report the blocker and mark the work incomplete until resolved or explicitly accepted by the user.

## 2. Require tests proportional to behavior

- **Bug fix:** add or update a regression test that fails before the fix and passes after it. Cover the reported case and the nearest meaningful edge case.
- **New behavior:** test the expected success path and relevant invalid-input, permission, or failure behavior. Test observable outcomes, not implementation details.
- **Auth, authorization, ledger, approval, migration, or concurrency changes:** include focused tests for the security or data invariant, using the project's real database requirements where applicable. Read `database-and-migrations` for schema and ledger rules, and `security-review` for security-sensitive changes.
- **Refactor:** preserve behavior with existing tests; add tests only if the refactor exposes an untested behavior contract.
- **Documentation-only change:** no build or test is required unless the docs are exercised by a repository check.

Do not add a test that merely repeats a constant or implementation detail. If an automated test is not feasible, state the precise manual verification performed and why automation was not practical.

## 3. Run the verified repository gates

Run commands from the `Code212_Quest-V1.0` repository root unless noted:

```bash
npm run typecheck
npm run build
```

`npm run build` already runs TypeScript project compilation (`tsc -b`) before Vite. Run `typecheck` for a faster diagnostic and `build` to verify the production bundle.

For backend changes:

```bash
cd apps/api
composer test
```

The Composer `test` script clears Laravel's config cache and runs `php artisan test` (PHPUnit). Run the backend suite against its configured PostgreSQL environment; do not substitute SQLite for database-specific behavior.

For a quick syntax check of an edited PHP file, run `php -l path/to/File.php` from `apps/api`. This is not a replacement for the backend test suite.

The inspected manifests do **not** define ESLint, Pint, PHPStan/Larastan, or a frontend test-runner command. Do not invent commands or report these checks as passing. If tooling is added later, verify its manifest/config entry before adding it as a gate.

## 4. Handle failures honestly

- A failed required check blocks completion. Fix the issue and rerun the failed check plus relevant regression checks.
- If an environment dependency is unavailable, record the exact command, error/blocker, and alternative evidence. Mark the check **not run / blocked**, not passed.
- Do not infer success from code inspection, a mock-only demo, or a command that was not executed.
- Distinguish automated results from static review and manual testing.

Wrong:

> Tests pass; ready to merge.

Right:

> `composer test` — not run: PostgreSQL is unavailable in this environment. Static review completed; merge is blocked until the suite passes in CI.

## 5. Report evidence in every completion summary

List:

1. What changed, tied to the acceptance criteria.
2. Checks actually run and their outcomes.
3. Required checks not run and why.
4. Known limitations or follow-up issues.

Example:

```text
Checks:
- `npm run typecheck` — passed
- `npm run build` — passed
- `composer test` (apps/api) — blocked: PostgreSQL service unavailable
Status: not ready to merge until backend tests pass in CI.
```

## Final checklist

- [ ] Acceptance criteria are observable and met.
- [ ] Behavior changes have focused regression/feature tests.
- [ ] Applicable typecheck, production build, and backend suite were run.
- [ ] Failures and blocked checks are explicit; none are described as passing.
- [ ] Summary lists evidence, unrun checks, and remaining limitations.
