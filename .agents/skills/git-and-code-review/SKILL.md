---
name: git-and-code-review
description: Use when creating or syncing a Git branch, committing, opening or reviewing a GitHub PR, resolving a conflict, or deciding whether a change is safe to merge in Code212 Quest.
---

# Git and Code Review

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md) before choosing a branch or merge workflow. Use this skill to make collaboration predictable and to explain review feedback so interns can learn from it.

## 1. Use the agreed branch flow

- `main` is the stable line; `develop` is the integration branch.
- Create a **temporary branch per issue** from the latest `develop`. Do not push feature work directly to `develop` or `main`.
- Name branches `feat/<issue>-<workspace>-<short-name>`, `fix/<issue>-<workspace>-<short-name>`, or `chore/<issue>-<short-name>`. Examples: `feat/123-student-paths`, `fix/124-api-submit-step`.
- Keep one issue per PR. Aim for fewer than 400 changed, non-generated lines; split larger work or explain why it must be reviewed together.

Start a feature:

```bash
# Move to the integration branch.
git switch develop
# Update it without creating an accidental merge commit.
git pull --ff-only origin develop
# Create the issue branch from the updated develop.
git switch -c feat/123-student-paths
```

Commit only the task changes, then publish the branch:

```bash
# Select only the intended changes.
git add -p
# Use a Conventional Commit message.
git commit -m "feat(student): add learning paths"
# Publish the branch and set its upstream.
git push -u origin feat/123-student-paths
```

Open a PR from the feature branch to `develop`. Ask the other intern for review; do not approve your own PR. The author merges after peer approval and required GitHub Actions checks pass, using **Create a merge commit**. Delete the temporary branch locally and remotely after merging. Do not force-push.

## 2. Write useful review comments

For each finding:

1. State the risk or user-visible consequence.
2. Point to the exact code or acceptance criterion.
3. Suggest a concrete correction or a focused question.
4. Mark it **Blocking** if it must be fixed before merge; mark it **Suggestion** if optional.

Keep the tone respectful and instructional. Explain why a change matters rather than only naming a rule.

Wrong:

> This is bad. Fix it.

Right:

> **Blocking:** This request sends `content`, but the Laravel request validates `contenu` as an array. The submission will fail with 422. Please align the payload and add a request test for the expected shape.

Do not block a PR for formatting preferences already handled by tooling. Raise unrelated follow-up work separately instead of expanding the PR.

## 3. Review the change, not just the diff style

Check:

- The PR links one issue and satisfies its acceptance criteria without unrelated changes.
- Tests cover the changed behavior and important failure/permission cases; the PR reports commands actually run.
- Frontend/API request and response shapes agree, including Laravel's `{ data, meta }` envelope where applicable. Pay particular attention when changing `apps/web/src/services/api.ts` or Laravel Resources: this project has known English/camelCase versus French/snake_case mismatches.
- Role checks, input validation, user-visible errors, and empty/loading states are correct for the affected flow.
- Database changes add forward-only migrations and preserve constraints; use `database-and-migrations` for deeper schema and ledger review.
- Auth, untrusted input, or data exposure changes receive a focused `security-review`.
- No `.env`, credentials, private keys, tokens, or personal data appear in the diff.

Coordinate before parallel work on conflict-prone files identified in the audit: `apps/api/routes/api.php`, `apps/web/src/services/api.ts`, `apps/web/src/hooks/use-api.ts`, `apps/web/src/types/index.ts`, `package-lock.json`, and `composer.lock`. Prefer separate issues/files or agree on ownership first.

## 4. Resolve conflicts and clean up safely

If `develop` changed while a feature branch was open, merge the latest `origin/develop` into the feature branch, resolve conflicts with the other intern, rerun relevant checks, and push the resolution. Never force-push shared work.

After the PR is merged:

```bash
# Return to develop so the feature branch is not checked out.
git switch develop
# Get the merged commit locally.
git pull --ff-only origin develop
# Delete the merged local feature branch.
git branch -d feat/123-student-paths
# Delete the remote feature branch.
git push origin --delete feat/123-student-paths
```

If Git says a branch is checked out in another worktree, switch that worktree to `develop` before deleting the branch. Use `git branch -D` only when intentionally discarding unmerged work after confirming it is backed up; prefer `-d`.

## Final checklist

- [ ] Branch starts from current `develop`; name includes issue and scope.
- [ ] PR contains one issue, is reviewable, and targets `develop`.
- [ ] A different intern approved it and required CI checks passed.
- [ ] Review findings explain impact and distinguish blockers from suggestions.
- [ ] Tests, API contracts, permissions, data changes, and secrets were checked as applicable.
- [ ] The feature branch is deleted only after its PR is merged.
