# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Supabase

Local: `pnpm db:start` (needs Docker), copy the publishable key into `.env.local` (see `.env.example`), and add the Google OAuth client vars there too. A single `.env.local` is used by both Next.js and the Supabase CLI (the db scripts load it). Run the app with `pnpm dev`.

Local URLs (ports from `supabase/config.toml`):

- Studio (browse tables, auth users, SQL editor): http://127.0.0.1:54323
- API: http://127.0.0.1:54321

Reset the local DB (replays all migrations): `pnpm db:reset`. Wipe all local data: `pnpm exec supabase stop --no-backup`.

Production: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host, enable Google in the dashboard (Auth > Providers), and set Site URL / redirect URLs (`<origin>/auth/callback`). Deploy schema with `supabase link --project-ref <ref>` then `pnpm db:push`.
