# Database Schema

PostgreSQL schema for the household finance app, hosted on **Supabase** (local via `pnpm db:start`, prod via `pnpm db:push`).

- Login is **Supabase Auth** (Google OAuth). Identities live in `auth.users`; the app never inserts into it.
- The schema ships as migrations in `supabase/migrations/` (`supabase migration new <name>`), applied with `pnpm db:reset` locally. Regenerate TS types with `pnpm db:types` afterwards.
- Every table in `public` has **Row Level Security** enabled, since the browser talks to Postgres directly through the publishable key.

## Entities

- **Profile**: app-level user data (name, email), 1:1 with `auth.users`.
- **Household**: a family or home that shares finances.
- **Membership**: links a profile to a household, with a role.
- **Category**: tag for transactions (e.g. Food, Salary). Belongs to a household, supports one level of nesting.
- **Transaction**: an income or expense entry for a household.

## SQL

```sql
-- Required for the period overlap exclusion constraint (Supabase keeps extensions in `extensions`)
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

-- Enums
CREATE TYPE household_role   AS ENUM ('owner', 'member');
CREATE TYPE category_type    AS ENUM ('income', 'expense');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE period_status    AS ENUM ('open', 'closed');

-- Profiles (1:1 with Supabase Auth users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create the profile when a user signs in for the first time (Google provides full_name)
CREATE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Households
CREATE TABLE households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  currency    CHAR(3) NOT NULL DEFAULT 'VND' CHECK (currency IN ('VND', 'USD')),  -- ISO 4217, one per household
  invite_code TEXT UNIQUE,                     -- for "join a family"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Memberships (user <-> household)
CREATE TABLE memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id)   ON DELETE CASCADE,
  role          household_role NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

-- Categories (supports one level of nesting)
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  type          category_type NOT NULL,
  archived_at   TIMESTAMPTZ,
  UNIQUE (household_id, type, name),
  UNIQUE (id, household_id)                    -- target for composite FKs
);

-- Periods
CREATE TABLE periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name          TEXT,                          -- e.g. "Nov 2026"
  start_date    DATE NOT NULL,
  end_date      DATE,                          -- set when closed
  status        period_status NOT NULL DEFAULT 'open',
  closed_by     UUID REFERENCES profiles(id),
  closed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date),
  CHECK ((status = 'closed') = (end_date IS NOT NULL)),
  UNIQUE (id, household_id)
);

-- Only one open period per household
CREATE UNIQUE INDEX one_open_period_per_household
  ON periods (household_id) WHERE status = 'open';

-- Prevent overlapping periods within a household
ALTER TABLE periods ADD CONSTRAINT no_overlapping_periods
  EXCLUDE USING gist (
    household_id WITH =,
    daterange(start_date, COALESCE(end_date, 'infinity'), '[]') WITH &&
  );

-- Transactions
CREATE TABLE transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  period_id     UUID NOT NULL,
  category_id   UUID,
  created_by    UUID NOT NULL REFERENCES profiles(id),
  type          transaction_type NOT NULL,
  amount        BIGINT NOT NULL CHECK (amount > 0),  -- minor units (VND has none; USD cents)
  occurred_on   DATE NOT NULL,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- guarantee period and category belong to the same household
  FOREIGN KEY (period_id,   household_id) REFERENCES periods(id, household_id),
  FOREIGN KEY (category_id, household_id) REFERENCES categories(id, household_id)
);

CREATE INDEX idx_tx_household_period ON transactions (household_id, period_id);
CREATE INDEX idx_tx_category         ON transactions (category_id);
CREATE INDEX idx_tx_occurred_on      ON transactions (household_id, occurred_on);
CREATE INDEX idx_memberships_user    ON memberships (user_id);
```

## Row Level Security

Access rule: a user can only touch rows of households they belong to. The membership check lives in a `SECURITY DEFINER` helper so policies on `memberships` don't recurse into themselves.

```sql
CREATE SCHEMA IF NOT EXISTS private;

CREATE FUNCTION private.is_household_member(hid UUID) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE household_id = hid AND user_id = (SELECT auth.uid())
  );
$$;

CREATE FUNCTION private.is_household_owner(hid UUID) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE household_id = hid AND user_id = (SELECT auth.uid()) AND role = 'owner'
  );
$$;

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE households   ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- profiles: own row, plus people in the same household
CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM memberships m
      WHERE m.user_id = profiles.id AND private.is_household_member(m.household_id)
    )
  );
CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

-- households: members read, owners edit. Creating/joining goes through the RPCs below.
CREATE POLICY households_select ON households FOR SELECT TO authenticated
  USING (private.is_household_member(id));
CREATE POLICY households_update ON households FOR UPDATE TO authenticated
  USING (private.is_household_owner(id)) WITH CHECK (private.is_household_owner(id));
CREATE POLICY households_delete ON households FOR DELETE TO authenticated
  USING (private.is_household_owner(id));

-- memberships: members see the household roster; owners remove others; anyone can leave.
-- No INSERT policy: rows are created only by the RPCs.
CREATE POLICY memberships_select ON memberships FOR SELECT TO authenticated
  USING (private.is_household_member(household_id));
CREATE POLICY memberships_delete ON memberships FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_household_owner(household_id));

-- categories / periods / transactions: full access for household members
CREATE POLICY categories_all ON categories FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));
CREATE POLICY periods_all ON periods FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));
CREATE POLICY transactions_all ON transactions FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id) AND created_by = (SELECT auth.uid()));
```

## RPCs (called with `supabase.rpc(...)`)

Both need to write across RLS boundaries, so they are `SECURITY DEFINER` functions in `public`.

```sql
-- Create a household and make the caller its owner
CREATE FUNCTION public.create_household(p_name TEXT, p_currency CHAR(3) DEFAULT 'VND')
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE hid UUID;
BEGIN
  INSERT INTO public.households (name, currency, invite_code)
  VALUES (p_name, p_currency, encode(extensions.gen_random_bytes(6), 'hex'))
  RETURNING id INTO hid;
  INSERT INTO public.memberships (household_id, user_id, role)
  VALUES (hid, (SELECT auth.uid()), 'owner');
  RETURN hid;
END;
$$;

-- Join a household by invite code
CREATE FUNCTION public.join_household(p_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE hid UUID;
BEGIN
  SELECT id INTO hid FROM public.households WHERE invite_code = p_code;
  IF hid IS NULL THEN RAISE EXCEPTION 'invalid invite code'; END IF;
  INSERT INTO public.memberships (household_id, user_id)
  VALUES (hid, (SELECT auth.uid()))
  ON CONFLICT DO NOTHING;
  RETURN hid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_household, public.join_household FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.create_household, public.join_household TO authenticated;
```

## Key decisions

- **Amount is positive; `type` gives the sign.** Net total: `SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)`.
- **Composite FKs** (`id, household_id`) prevent a transaction from referencing another household's period or category.
- **One open period per household** via a partial unique index; an exclusion constraint also blocks overlapping periods.
- **Closed periods are locked** via a trigger rejecting transaction writes when `period.status = 'closed'` (RLS can't express this cleanly), with the app also hiding the actions.
- **`period_id` is stored on the transaction** rather than derived from the date, keeping back-dated entries explicit. Validate `occurred_on` against the period range in the app.
- **Category type must match transaction type.** Enforce in the app, or add `type` to the category unique key and the FK.
- **Money is stored as integer minor units**, never floats.
- **Single currency per household.** `households.currency` (ISO 4217, e.g. `VND` or `USD`) applies to all of its transactions. Transactions have no currency column and mixed currencies are not supported.
- **Currency exponent lives in the app**, not the DB (VND = 0 decimals, USD = 2). Use it to convert minor units when displaying or parsing amounts, e.g. with `Intl.NumberFormat`.
- **Currency should be locked once a household has transactions**, since changing it would reinterpret every stored amount.

- **Auth identity is `auth.users`, not a custom table.** `profiles.id` equals `auth.users.id`, so `auth.uid()` can be used directly in policies and `created_by`/`user_id` columns.
- **RLS is the security boundary**, not the app. Never use the service-role key in client code; it bypasses RLS.
- **Helpers live in a `private` schema** (not exposed by the Data API) so they can't be called as RPCs. Wrap `auth.uid()` as `(SELECT auth.uid())` in policies so it's evaluated once per query.
- **Invite codes are secrets.** `households` is only readable by members, so joining goes through `join_household` rather than a direct lookup; rotate `invite_code` if leaked.
- **Don't edit applied migrations.** Add a new one; `db:reset` replays them all from scratch.

## Future considerations

- `Account` (cash, bank) for tracking where money sits, plus transfers.
- `Budget` per category per period.
- Seed default categories per household (via `create_household` or `supabase/seed.sql`).
- Index `memberships (household_id, user_id)` is covered by its UNIQUE constraint; revisit RLS performance if tables grow.
- Types come from `supabase gen types` (`lib/supabase/database.types.ts`); no ORM planned.
