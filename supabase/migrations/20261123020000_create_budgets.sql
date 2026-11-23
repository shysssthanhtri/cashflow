-- Budgets: month IS NULL is the recurring default; a month row overrides it.
-- category_id IS NULL is the overall monthly cap.
CREATE TABLE public.budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  category_id   UUID,
  month         DATE CHECK (month IS NULL OR month = date_trunc('month', month)::date),
  amount        NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (category_id, household_id)
    REFERENCES public.categories (id, household_id) ON DELETE CASCADE,
  UNIQUE NULLS NOT DISTINCT (household_id, category_id, month)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY budgets_all ON public.budgets FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));
