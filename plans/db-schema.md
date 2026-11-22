# Database Schema

PostgreSQL schema for the household finance app.

## Entities

- **User**: login identity.
- **Household**: a family or home that shares finances.
- **Membership**: links a user to a household, with a role.
- **Category**: tag for transactions (e.g. Food, Salary). Belongs to a household, supports one level of nesting.
- **Period**: a custom budget cycle (e.g. salary day to salary day). Can be opened and closed.
- **Transaction**: an income or expense entry within a period.

## SQL

```sql
-- Required for the period overlap exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enums
CREATE TYPE household_role   AS ENUM ('owner', 'member');
CREATE TYPE category_type    AS ENUM ('income', 'expense');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE period_status    AS ENUM ('open', 'closed');

-- Users (login identity)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
  user_id       UUID NOT NULL REFERENCES users(id)      ON DELETE CASCADE,
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
  closed_by     UUID REFERENCES users(id),
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
  created_by    UUID NOT NULL REFERENCES users(id),
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

## Key decisions

- **Amount is positive; `type` gives the sign.** Net total: `SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END)`.
- **Composite FKs** (`id, household_id`) prevent a transaction from referencing another household's period or category.
- **One open period per household** via a partial unique index; an exclusion constraint also blocks overlapping periods.
- **Closed periods are locked** in the app layer, or via a trigger rejecting writes when `period.status = 'closed'`.
- **`period_id` is stored on the transaction** rather than derived from the date, keeping back-dated entries explicit. Validate `occurred_on` against the period range in the app.
- **Category type must match transaction type.** Enforce in the app, or add `type` to the category unique key and the FK.
- **Money is stored as integer minor units**, never floats.
- **Single currency per household.** `households.currency` (ISO 4217, e.g. `VND` or `USD`) applies to all of its transactions. Transactions have no currency column and mixed currencies are not supported.
- **Currency exponent lives in the app**, not the DB (VND = 0 decimals, USD = 2). Use it to convert minor units when displaying or parsing amounts, e.g. with `Intl.NumberFormat`.
- **Currency should be locked once a household has transactions**, since changing it would reinterpret every stored amount.

## Future considerations

- `Account` (cash, bank) for tracking where money sits, plus transfers.
- `Budget` per category per period.
- ORM translation (Prisma or Drizzle) once chosen.
