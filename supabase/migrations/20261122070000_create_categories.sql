CREATE TYPE public.category_type AS ENUM ('income', 'expense');

-- Categories (supports one level of nesting)
CREATE TABLE public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  type          public.category_type NOT NULL,
  archived_at   TIMESTAMPTZ,
  UNIQUE (household_id, type, name),
  UNIQUE (id, household_id)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_all ON public.categories FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));
