# Decisions for Agent Skills

- **Hosting/deployment:** Undecided and not needed for this skills set. Do not prescribe a production host or deployment owner.
- **PHP tests:** PHPUnit.
- **Git and CI:** GitHub and GitHub Actions. `main` is stable; `develop` is integration. Use temporary `feat/`/`fix/` branches from `develop`, one issue per PR, peer review, green CI, **Create a merge commit**, then delete the source branch. No supervisor dependency.
- **Arena v1:** Polling; do not assume Reverb/WebSockets.
- **Authentication:** Sanctum cookie-based SPA mode is the target. Confirm same-site deployment assumptions before documenting cookie/CORS settings. Current code still issues Bearer tokens and stores them in `sessionStorage`; treat this as an implementation gap, not as the approved target.
- **Laravel conventions:** Keep controllers thin; validate with FormRequests, keep business rules/transactions in Services, and serialize with JsonResources plus `ApiResponse`. Preserve the current `{data, meta?}` success envelope and French snake_case API fields for V1; adapt explicitly at the frontend boundary rather than creating mixed endpoint conventions.
- **PHP safety:** Use strict types, backed enums for finite domain states, typed business exceptions, explicit request-to-model mapping, and `env()` only in config. Treat roles and XP/economy balances as trusted-service-only fields. Enable Eloquent strictness in local/testing.
- **Quality targets:** No approved targets. Proposed provisional load target: API p95 under 500 ms at 500 concurrent users. Require tests for critical flows; do not claim a project-wide coverage target.
- **Frontend performance:** Use the Google “good” Core Web Vitals thresholds as targets at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Validate lab and field data separately.
- **Verified commands (from `Code212_Quest-V1.0`):** `npm run typecheck`; `npm run build` (includes `tsc -b && vite build`); and, from `apps/api`, `composer test` (clears config then runs `php artisan test`). `php artisan test` is also available directly. No ESLint, Pint, PHPStan/Larastan, or frontend test script/config was found; do not claim those checks ran.
- **Skill location:** `.agents/skills/<skill-name>/SKILL.md`.
