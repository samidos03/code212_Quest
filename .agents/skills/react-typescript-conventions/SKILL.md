---
name: react-typescript-conventions
description: Use when adding or changing React pages, components, hooks, API calls, TypeScript types, styling, or user-facing copy in Code212 Quest; trigger for any frontend feature or UI bugfix.
---

# React and TypeScript Conventions

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md) and follow [performance-speed](../performance-speed/SKILL.md) when a change affects loading, rendering cost, animation, assets, or Core Web Vitals. The app is React 18, TypeScript 5.6 strict mode, React Router 6, TanStack Query 5, Tailwind 3.4, and Zod 3.24.

## 1. Keep boundaries clear

- `src/pages/` owns route-level composition and page-specific presentation.
- `src/components/` owns reusable UI and layout. `components/ui/` is the shared primitive/design-system layer; feature components belong in their feature folder.
- `src/hooks/` owns reusable React hooks, including TanStack Query hooks in `use-api.ts`.
- `src/services/` owns API transport, adapters, and mock/service implementations. `src/types/` owns shared frontend domain types. `src/lib/` owns cross-cutting browser/app utilities and providers.
- Keep components focused on rendering and interaction. They must not call `fetch`, `http`, or `mockApi`; route data through `services/api.ts` and typed hooks in `hooks/use-api.ts`.
- `lib/auth.tsx` currently calls `fetch` for login. Treat that as existing debt: do not copy this pattern to new features; move it behind the service boundary when auth is next changed.

Wrong:

```tsx
function QuestList() {
  useEffect(() => {
    fetch('/api/v1/quests').then(/* ... */)
  }, [])
  return null
}
```

Right:

```tsx
function QuestList() {
  const quests = useQuests()
  if (quests.isPending) return <QuestListSkeleton />
  if (quests.isError) return <LoadError message={quests.error.message} />
  if (!quests.data?.length) return <EmptyState title="Aucune quête disponible" />
  return <QuestCards quests={quests.data} />
}
```

Use the existing page-specific components and error/empty UI patterns where available rather than adding duplicate primitives.

## 2. Keep TypeScript strict at runtime boundaries

- Preserve the existing `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` compiler options. Do not weaken `tsconfig` to make a change pass.
- Do not add `any`, non-null assertions, or unchecked casts to bypass uncertainty. Use `unknown`, narrow it, and represent impossible states with discriminated unions.
- `src/services/api.ts` is the Laravel/mock adapter boundary. The Laravel API uses `{ data, meta? }` success envelopes and French snake_case fields; adapt those explicitly to the app's camelCase types instead of leaking raw fields into components.
- Zod is installed but currently unused. Parse untrusted API payloads at the service boundary with Zod schemas; infer raw DTO types from schemas where practical, then map to frontend domain types. A TypeScript generic or `as T` does not validate JSON at runtime.
- The current `ForgeRaw = Record<string, any>` and generic JSON casts in `services/api.ts` are known boundary weaknesses. Do not extend them; replace with `unknown` plus focused schemas/adapters when working in that area.

Wrong:

```ts
const quest = (await response.json()) as Quest
```

Right:

```ts
import { z } from 'zod'

const QuestResponseSchema = z.object({
  data: z.object({ id: z.number(), titre: z.string() }),
})

const payload: unknown = await response.json()
const { data } = QuestResponseSchema.parse(payload)
return { id: data.id, title: data.titre }
```

Keep schema imports and mapping out of visual components. Match schemas to the actual Laravel response and fail visibly on malformed data; do not silently substitute empty or plausible success values.

## 3. Use TanStack Query for server state

- Read and mutate server-owned state through `useQuery`/`useMutation` hooks. Keep transient UI state (open dialog, selected tab, unsaved input) in local React state.
- Follow the existing feature-first key convention: `['quests', filters]`, `['quest', id]`, `['forge', 'thread', id]`. Use stable, serializable key inputs; include every variable that changes a request result.
- After successful mutations, invalidate the narrowest affected key prefixes. Update cached data directly only when the new value and all affected views are unambiguous.
- Keep query functions in the service facade or hooks, not inside reusable presentational components. Preserve the configured retry/stale-time behavior unless a measured feature need justifies a scoped override.
- Handle pending, error, empty, and success states for every data-backed view. Do not render a blank page or interpret a failed request as an empty result.
- Show mutation failures using the established toast/error pattern and preserve retryable user input. Disable or mark the relevant action while its mutation is pending to prevent duplicate submissions.

## 4. Build reusable, accessible UI

- Prefer semantic HTML, labels, buttons, and links over clickable generic containers. Give icon-only controls an accessible name; expose async status changes appropriately.
- Keep page composition in `pages/`, reusable behavior in hooks, and shared primitives in `components/ui/`. Do not put unrelated business rules in a shared component.
- Use the existing design tokens (`bg-bg`, `text-fg`, `text-fg-muted`, `border-border`, semantic status tokens) and the existing theme provider. Avoid one-off colors or manual light/dark overrides.
- Do not use `text-cyan` on light surfaces: the bright brand cyan is not the text contrast token. Use `text-cyan-fg` on light backgrounds, or use `text-cyan` only where the dark-surface contrast has been checked.
- Use Tailwind logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`) for direction-sensitive spacing and alignment. Avoid left/right-specific layout utilities for content that must support RTL.
- Keep all user-visible copy translatable. The repository currently has no localization library or translation resources; do not invent a `useTranslation` API or scatter fake keys. Keep current French behavior for scoped fixes, and establish localization infrastructure as a separate prerequisite before claiming multilingual support.

## 5. Verify the change

- Add or update a focused test when the repository has a suitable frontend test harness; none is currently declared in `apps/web/package.json`.
- Run `npm run typecheck` for TypeScript changes and `npm run build` for frontend changes. The build runs `tsc -b && vite build`.
- Report commands actually run and any checks not run. Do not claim a browser interaction or production API path was verified by typecheck alone.

## Final checklist

- [ ] Components render data from typed hooks and contain no new network calls.
- [ ] Server state uses TanStack Query and correct, stable query keys.
- [ ] API input is runtime-validated and adapted at the service boundary; no new `any` or unchecked payload casts.
- [ ] Every data view has pending, error, empty, and success behavior.
- [ ] Mutations handle pending and error states and invalidate the affected queries.
- [ ] UI uses shared tokens, accessible semantics, and RTL-friendly logical properties.
- [ ] New visible copy follows the project's French baseline and localization status is represented honestly.
- [ ] `npm run typecheck` and `npm run build` results are reported accurately.
