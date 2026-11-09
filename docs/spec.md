# Epic: Family Money Tracker MVP

Source plan: `docs/PLAN.md`. This spec overrides it where they differ (see "Overrides").
Spec date: 2026-11-09. No git remote yet, so this file is the tracker. Update the `Status` cells as agents finish work.

**Status values:** `TODO` | `IN PROGRESS` | `DONE` | `BLOCKED (reason)`
**Rule for agents:** set a task to `IN PROGRESS` when you start, `DONE` only after its Verify step passes (manual, no automated tests), and record the date and any notes in the Notes column.

## Progress

| # | Issue | Priority | Effort | Depends on | Status |
|---|-------|----------|--------|------------|--------|
| 1 | Foundation: scaffold, schema, RLS, auth | P1 | ~7h | none | TODO |
| 2 | Households: create, switch, invite | P1 | ~6h | 1 | TODO |
| 3 | Add tab: quick-entry, parser, chips | P1 | ~8h | 1, 2 | TODO |
| 4 | Offline queue and sync | P1 | ~6h | 3 | TODO |
| 5 | History | P2 | ~8h | 3 | TODO |
| 6 | Dashboard and PWA | P2 | ~8h | 3 | TODO |

```
#1 --> #2 --> #3 -+-> #4
                  +-> #5
                  +-> #6
```
Why this order: RLS and auth must exist before households, and every entry needs a household. #4, #5 and #6 are independent once #3 exists and can run in parallel.

## Context

The family tracks income and expenses in Google Slides, with no tagging or analysis. The MVP is an installable PWA used by several family members on phone and laptop. Adding a record takes 10 seconds or less. Monthly history and a dashboard show whether cash went up or down and where it went.

Current state (verified 2026-11-09): greenfield. The repo contains only `docs/PLAN.md`, `CLAUDE.md`, `AGENTS.md`.

## Decisions locked

- **Stack:** Next.js (App Router, TypeScript), shadcn/ui + Tailwind, Supabase, Vercel, PWA. See `CLAUDE.md` for rules (SSR first, four states, pagination, lint, no tests).
- **Auth:** Supabase magic link or OTP by email.
- **Households:** many-to-many. A signed-in user with no household is routed to the create-household screen.
- **Active household:** `active_household` cookie, set server-side. A header switcher shows when the user has 2 or more households. Default is the most recently joined. Add, History and Dashboard read only the active household.
- **Invites:** any member can invite by email. A server action looks the email up in `auth.users` with the service-role key (server-only, never `NEXT_PUBLIC_*`).
  - Found: insert `household_members` immediately, no acceptance step.
  - Not found: return "Ask them to sign in once first" and create nothing.
  - Already a member: no-op with a "Already a member" message.
- **Categories:** hardcoded in `lib/categories.ts`, shared by all households. No categories table.
  - Expense: Food, Rent, Beauty, Transport, Utilities, Health, Education, Shopping, Entertainment, Other.
  - Income: Salary, Bonus, Other.
- **Amounts:** `bigint` whole VND. Parser: `k` = 1,000, `tr` = 1,000,000. Display as `45,000₫` with tabular numerals.
- **Offline:** each entry carries a client-generated `client_id` and its `household_id`. Upserts are idempotent on `(household_id, client_id)`.
- **Design tokens:** from `docs/PLAN.md` design review: 8px radius, 48px min height for chips and Save, spacing 4/8/12/16/24, tabular numerals, 16px body.
- **Verification:** manual only. `CLAUDE.md` forbids writing or running tests; this overrides the plan's test gates.

## Schema

All tables have RLS enabled. Membership check: `exists (select 1 from household_members m where m.household_id = <table>.household_id and m.user_id = auth.uid())`.

```sql
create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null
);

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users
);

create table household_members (
  household_id uuid not null references households on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  member_id uuid not null references auth.users,
  client_id uuid not null,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  category text not null,
  note text,
  date date not null,
  created_at timestamptz not null default now(),
  unique (household_id, client_id)
);
create index on transactions (household_id, date);
```

## Issue 1: Foundation (P1, ~7h, depends on: none)

| Task | What | Status | Notes |
|------|------|--------|-------|
| 1.1 | Scaffold Next.js (App Router, TS, Tailwind), init shadcn, add ESLint and `tsc --noEmit` scripts. Create `app/`, `components/ui`, `lib/`, `supabase/migrations` | TODO | |
| 1.2 | Migration with the schema above, RLS policies, `unique (household_id, client_id)`, index `(household_id, date)` | TODO | |
| 1.3 | Supabase clients: server (cookies) and browser, env vars `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, server-only `SUPABASE_SERVICE_ROLE_KEY`. Add `.env.example` | TODO | |
| 1.4 | Magic-link or OTP sign-in page and auth callback route. Signed-out requests redirect to sign-in | TODO | |
| 1.5 | First sign-in name prompt, stored in `profiles.display_name`. Skipped on later sign-ins | TODO | |
| 1.6 | Design tokens in Tailwind and CSS variables, plus the typeface from `docs/PLAN.md` (decision 4A) | TODO | |

Verify (manual):
1. `eslint .` and `tsc --noEmit` pass.
2. In the Supabase SQL editor, as user B, `select * from transactions` returns 0 rows for household A, and an insert into household A fails.
3. A new email receives a magic link, signs in, and is asked for a name once.
4. The service-role key does not appear in any client bundle (search `.next/static` for it).

## Issue 2: Households (P1, ~6h, depends on: #1)

| Task | What | Status | Notes |
|------|------|--------|-------|
| 2.1 | Create-household screen. A signed-in user with no household lands here. A Server Action inserts `households` and an `owner` row in `household_members` | TODO | |
| 2.2 | Active-household resolution: read the cookie, fall back to the most recently joined, set the cookie server-side. Shared helper in `lib/` | TODO | |
| 2.3 | Header household switcher, shown only with 2 or more households. Switching sets the cookie and refreshes | TODO | |
| 2.4 | Invite-by-email Server Action (rules in "Decisions locked") and a members list with an invite form | TODO | |

Verify (manual):
1. A user with no household cannot reach Add, History or Dashboard and is sent to the create screen. After creating one, they land on the Add tab.
2. Invite a known email: that user sees the household on their next load, with no acceptance step.
3. Invite an unknown email: message "Ask them to sign in once first" and no `household_members` row.
4. Invite an existing member: "Already a member" and no duplicate row.
5. Invite from a non-member's session is rejected.
6. The switcher is hidden with 1 household and shown with 2 or more.

## Issue 3: Add tab (P1, ~8h, depends on: #1, #2)

| Task | What | Status | Notes |
|------|------|--------|-------|
| 3.1 | `lib/categories.ts` with the hardcoded lists and type-safe keys | TODO | |
| 3.2 | `lib/parse-entry.ts`: parse "lunch 45k", "45k", "1.2tr", "2tr lunch" into `{amount, note}`. Never save an unparsed guess; on a miss, return a prefill for the form | TODO | |
| 3.3 | Add page at `(tabs)/add`: focused quick-entry box with visible label, live parse preview line, usage-ordered category chips (48px), Expense/Income toggle, date defaulting to today, numeric keypad on mobile, Save. Parse miss shows "Couldn't read an amount" and focuses the amount field | TODO | |
| 3.4 | Server Action that upserts the transaction on `(household_id, client_id)` for the active household and current member. After save: "Saved ✓", box clears and refocuses. On laptop, Enter saves | TODO | |
| 3.5 | Tab navigation Add / History / Dashboard, with Add as the default route | TODO | |

Verify (manual):
1. "lunch 45k" saves 45,000 (VND) with note "lunch". "1.2tr" saves 1,200,000. "45k lunch" and "lunch 45k" both parse.
2. Unparseable text keeps the user on the form with the message and saves nothing.
3. Saving with no category is blocked and shows "Pick a category".
4. Time from app open to "Saved ✓" is 10 seconds or less on a real phone.
5. Saving the same `client_id` twice leaves one row.

## Issue 4: Offline queue and sync (P1, ~6h, depends on: #3)

| Task | What | Status | Notes |
|------|------|--------|-------|
| 4.1 | `lib/queue.ts`: persisted local queue (IndexedDB). Each item holds `client_id`, `household_id` and the entry. Retries are idempotent via the upsert | TODO | |
| 4.2 | Add Save flow writes to the queue first, then syncs in the background. Sync on reconnect and on app open | TODO | |
| 4.3 | Sync line at the top: "All saved", "Syncing…", "1 waiting to sync", "2 couldn't sync. Tap to retry" (persistent, `aria-live` polite) | TODO | |
| 4.4 | Sign-out warning: "N entries haven't synced. Sign out anyway?" with Cancel as the default, shown only when the queue is non-empty | TODO | |

Verify (manual):
1. In airplane mode, add 3 entries. The line shows "3 waiting to sync".
2. Reconnect: 3 rows appear, no duplicates. Force a second sync and confirm still 3 rows.
3. Kill the network mid-upload: after reconnect, no duplicate and no lost entry.
4. Switching household while items are queued syncs each item to its original household.
5. Sign-out with a non-empty queue shows the warning; Cancel keeps the user signed in.

## Issue 5: History (P2, ~8h, depends on: #3)

| Task | What | Status | Notes |
|------|------|--------|-------|
| 5.1 | `(tabs)/history` as a Server Component. Month net header (SQL aggregate), day groups, rows of category / note / amount. Server-side pagination with `.range()`, 50 rows per page, no unbounded fetch | TODO | |
| 5.2 | Four states: loading skeleton (`loading.tsx`), error with "Couldn't load. Showing saved data", empty "No entries this month. Add your first one." with a button to Add, data | TODO | |
| 5.3 | Tap a row to edit in the Add form, saved as an upsert on the same `client_id` | TODO | |
| 5.4 | Delete with a 5-second Undo | TODO | |
| 5.5 | Laptop layout from 1024px: sidebar navigation and two-column layout | TODO | |

Verify (manual):
1. With more than 50 entries, the first page has 50 rows and a way to load more. Network tab shows no request fetching all rows.
2. The month net matches a hand sum of the rows.
3. Editing a row changes it in place, with no duplicate. Delete then Undo within 5s restores it; after 5s it stays deleted.
4. All four states render (empty month, forced error, slow network).

## Issue 6: Dashboard and PWA (P2, ~8h, depends on: #3)

| Task | What | Status | Notes |
|------|------|--------|-------|
| 6.1 | SQL aggregates (function or view): monthly net, income and expense totals, per-category sums, 6-month trend. No client-side aggregation | TODO | |
| 6.2 | `(tabs)/dashboard`: verdict sentence first (direction not by color alone), then cash trend, then category bars. No card borders | TODO | |
| 6.3 | Empty states: zero rows, first month ("Not enough data for a verdict yet. This month so far: net +X"), no prior month ("no comparison yet"). Plus loading skeleton and stale-data banner on error | TODO | |
| 6.4 | PWA: `manifest`, icons, service worker, installable on phone | TODO | |

Verify (manual):
1. Verdict matches a hand calculation for a month with a prior month.
2. Zero-row and first-month states render the exact copy above.
3. Category bars sum to total expense.
4. "Add to Home Screen" works on a phone and the app opens full-screen.
5. `eslint .` and `tsc --noEmit` pass.

## Epic definition of done

1. Every task above is `DONE`.
2. User B sees zero rows from household A and cannot write to it.
3. Add-to-saved takes 10 seconds or less on a real phone.
4. Offline entries sync with no duplicates or loss.
5. The household invite works for a known email and fails cleanly for an unknown one.
6. History is paginated; the Dashboard verdict and empty states are correct.
7. The app installs as a PWA.
8. The family uses it for a full month instead of Slides (the plan's success criterion).

## Out of scope

Removing members, leaving, renaming or deleting households, invite emails, per-household categories, recurring transactions, tags, import of Slides, bank sync, budgets, CSV export, sync/parse counters, dark mode, multi-currency, onboarding tour.

## Rollback

Revert the PR and redeploy on Vercel. Migrations are forward-only: add a down migration with each schema change.

## Overrides of `docs/PLAN.md`

- Invites are by email with immediate membership, not by link (plan decision 3A). "Email invites" is no longer out of scope.
- Households are many-to-many, not one per user.
- Categories are hardcoded, not a table.
- No automated tests, so the plan's RLS and idempotency launch gates are manual checks.
