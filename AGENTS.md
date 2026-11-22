<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## App folder structure

- Inside `app/`, only routable files (`page`, `layout`, `route`, `loading`, `error`, etc.) live directly in a route folder.
- Put everything else in underscore-prefixed private folders next to the route that uses it: `_components/`, `_actions/` (server actions), `_schemas/` (zod schemas), `_lib/`.
- Shared server-only helpers go in `server/libs/`.

## UI components

- Whenever implementing UI, consider using components from shadcn first (add via `pnpm dlx shadcn@latest add <component>`) before building custom ones.

## Loading states

- Always show a skeleton (shadcn `Skeleton`) while loading: add a `loading.tsx` per route and use `Suspense` fallbacks / pending states for async UI. Never leave blank space or a bare spinner.

## Page paths

For each resource's route folder:

- `/add` — create page
- `/` — list page
- `/{id}` — details page
- `/{id}/edit` — edit page

(Resource-specific details to be filled in later.)

## Database

- Only run `pnpm db:push` to apply schema changes. Never run `pnpm db:reset`, even locally.
