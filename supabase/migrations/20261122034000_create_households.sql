-- Households: a family or home that shares finances
CREATE TABLE public.households (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  currency    CHAR(3) NOT NULL DEFAULT 'VND' CHECK (currency IN ('VND', 'USD')),  -- ISO 4217, one per household
  invite_code TEXT UNIQUE,                     -- for "join a family"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS on with no policies: nothing is accessible until the memberships migration
-- adds the membership helpers and the select/update/delete policies, and the RPCs handle create/join
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
