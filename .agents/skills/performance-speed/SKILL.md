---
name: performance-speed
description: Use when changing React routes, page loading, assets, fonts, animations, large lists, or build chunks in Code212 Quest, and when measuring Core Web Vitals or investigating slow Arena/leaderboard interactions.
---

# Frontend Performance and Core Web Vitals

Read [DECISIONS-FOR-SKILLS.md](../DECISIONS-FOR-SKILLS.md). Targets at p75 are LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1. Measure the production build on representative mobile/network conditions; mock mode and a development server are not performance evidence.

## 1. Measure before optimizing

- Record route, device, network, build, and measurement method. Use Chrome DevTools Performance, Lighthouse, and field `web-vitals` data when instrumented.
- Separate lab measurements from real-user p75. Lighthouse lab metrics can gate a deterministic CI run; they do not prove field INP ≤ 200 ms.
- The repo currently has no `web-vitals` or Lighthouse CI package/config. Do not claim these targets are CI-enforced. Add and wire measurement tooling in an approved task before treating metric or bundle thresholds as build failures.
- Capture a baseline before changing code and compare the same routes and conditions afterwards.

## 2. Split the route bundles

`apps/web/src/App.tsx` eagerly imports pages from all student, admin, director, trainer, and moderator workspaces. Lazy-load route-level pages so a student does not download every workspace and chart before seeing the first screen.

Use `React.lazy()` with route-level `Suspense` and a layout-stable fallback. Keep the shared shell and login path fast; group pages only when they are commonly navigated together. Prefetch a likely next route only when measured and avoid loading all route chunks at startup.

The Vite config already separates React, Framer Motion, charts, and React Query into manual chunks. `chunkSizeWarningLimit: 900` is only a warning threshold, not a production bundle budget. Measure compressed transfer sizes, set per-entry/per-route budgets from a verified baseline, and enforce them in CI only after adding a reliable size check.

## 3. Protect LCP and fonts

- Keep the self-hosted Inter and Rajdhani fonts. `index.html` already preloads `inter-var.woff2` and `rajdhani-700.woff2`; `fonts.css` uses `font-display: swap`. Preload only fonts needed above the fold and keep preload URLs synchronized with actual assets.
- If fallback-to-webfont swapping still shifts text, tune fallback metrics (`size-adjust` and ascent/descent overrides) from measured font metrics rather than guessing values.
- Identify the actual LCP element per route. Optimize its source/format and priority; use `fetchpriority="high"` only for the true above-the-fold LCP image, not every image.
- Give images explicit dimensions or a reserved aspect ratio. Lazy-load below-the-fold images; do not lazy-load the LCP image.

## 4. Prevent layout shifts

- Reserve final space for async data, images, charts, banners, and skeletons. Skeleton dimensions should match loaded content.
- Avoid inserting content above the viewport after hydration or font load. Keep status text and error banners in reserved/flow-stable regions.
- Animate `transform` and `opacity` rather than layout properties. Honor reduced motion; the app already wraps routes in `MotionConfig reducedMotion="user"`.

Wrong:

```tsx
{isLoading ? <div className="h-10">Loading...</div> : <Leaderboard rows={rows} />}
```

Right:

```tsx
<section className="min-h-[24rem]" aria-busy={isLoading}>
  {isLoading ? <LeaderboardSkeleton /> : <Leaderboard rows={rows} />}
</section>
```

Match the reserved size to the real component; a guessed fixed height can create blank space on small screens.

## 5. Keep INP-sensitive screens responsive

- Keep event handlers short. Move expensive filtering/aggregation to the server or a worker when profiling shows main-thread blocking.
- Paginate or virtualize large result lists; avoid rerendering every row when selection or a timer changes.
- On Arena and leaderboard, animate only meaningful elements (for example the small podium), not every row on every update. Avoid infinite decorative animation when it competes with input or battery.
- Arena v1 uses polling per project decision. Set a measured, modest interval; pause/refuse polling when the tab is hidden, prevent overlapping requests, and keep countdown presentation local rather than refetching for every tick.
- Use React Profiler and the browser Performance panel before adding memoization. Keep state near the component that owns it and stabilize props only when profiling shows a benefit.

## 6. Define realistic budgets and gates

- Establish compressed JS/CSS and route-chunk baselines from `npm run build`; do not infer transfer size from raw chunk warnings.
- Propose explicit budgets in a separate issue after measuring the current student first-load route and mobile baseline. Do not set a budget that silently drops required functionality.
- Once Lighthouse CI is configured, fail CI on agreed, repeatable lab LCP/CLS and bundle-budget regressions. Use Total Blocking Time as a lab diagnostic for responsiveness, not as a substitute for field INP.
- Monitor field p75 LCP/INP/CLS by route and device after release. Treat an exceeded p75 target as a release-quality issue even if a lab build passes.

## Final checklist

- [ ] Production build and representative route/device were measured before and after.
- [ ] Route-level chunks prevent unrelated workspaces from loading on the student entry route.
- [ ] Vite warnings are not mistaken for compressed-size budgets.
- [ ] Fonts are self-hosted, correctly preloaded, and do not create visible layout shifts.
- [ ] Images, skeletons, and charts reserve their final space.
- [ ] Motion respects reduced-motion preference and does not delay interaction.
- [ ] Arena/leaderboard interactions avoid main-thread spikes and uncontrolled polling.
- [ ] LCP/INP/CLS lab and field claims are distinguished; unenforced gates are reported as such.
