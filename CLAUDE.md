# Family Money Tracker (cashflow)

Product plan: `docs/PLAN.md`. Read it before building features.

## Core architecture

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| UI | shadcn/ui (https://ui.shadcn.com/) + Tailwind; add components via `npx shadcn@latest add <name>` |
| Backend | Supabase (auth, Postgres, RLS per household) |
| Hosting/deploy | Vercel (preview per PR, rollback via redeploy) |
| Platform | One codebase for web + app via PWA (manifest, service worker, installable, offline queue) |

Layout: `app/` routes (`(tabs)/add`, `history`, `dashboard`, invite), `components/` (shadcn in `components/ui`), `lib/` (`parse-entry.ts`, `queue.ts`), `supabase/migrations`.

Supabase keys: anon key is public; service-role key is server-only, never in client code or `NEXT_PUBLIC_*`.

## Rules

1. **SSR first.** Default to Server Components, server-side data fetching, and Server Actions. Use `"use client"` only when compulsory (browser APIs, local state/event handlers, offline queue, service worker). Keep client components small and leaf-level.
2. **Always handle four states** for every data-driven view: loading (`loading.tsx`/Suspense skeleton), error (`error.tsx` or inline with retry), empty (helpful message + action), has data. Copy per `docs/PLAN.md` interaction states table.
3. **Always paginate lists** (History, etc.). Server-side pagination (cursor or range via Supabase `.range()`); never fetch unbounded rows. Aggregates (monthly totals, category sums) are computed in SQL.
4. **Lint is required.** Use ESLint (`next lint` / `eslint .`) plus TypeScript `tsc --noEmit`. Code must pass before commit; do not disable rules to get past errors.
5. **No tests.** Do not write, add, or run any kind of test (unit, integration, e2e, RLS, parser tests). This overrides test items/launch gates in `docs/PLAN.md`; verify manually instead.

## Conventions

- Amounts are `bigint` whole VND; parser: `k`=1,000, `tr`=1,000,000. Display as `45,000₫` with tabular numerals.
- Offline entries carry a client-generated `client_id`; upserts are idempotent on `(household_id, client_id)`.
- Use shadcn components and design tokens from the plan (8px radius, 48px min height for chips/Save) instead of hand-rolled UI.
