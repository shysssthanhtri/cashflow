-- Switch budgets to one row per month with a recurring flag.
DELETE FROM public.budgets WHERE month IS NULL;

ALTER TABLE public.budgets
  ALTER COLUMN month SET NOT NULL,
  ADD COLUMN recurring BOOLEAN NOT NULL DEFAULT true;

-- Marks months whose recurring budgets were already carried over, so a budget
-- deleted from a month isn't brought back by the next generation.
CREATE TABLE public.budget_months (
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  month         DATE NOT NULL CHECK (month = date_trunc('month', month)::date),
  PRIMARY KEY (household_id, month)
);

ALTER TABLE public.budget_months ENABLE ROW LEVEL SECURITY;

CREATE POLICY budget_months_all ON public.budget_months FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));

-- Copies recurring budgets from the latest earlier month that has budgets.
-- Idempotent; runs with the caller's rights so RLS applies.
CREATE FUNCTION public.ensure_month_budgets(p_household_id UUID, p_month DATE)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  src DATE;
BEGIN
  IF p_month <> date_trunc('month', p_month)::date THEN
    RAISE EXCEPTION 'p_month must be the first day of a month';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.budget_months
    WHERE household_id = p_household_id AND month = p_month
  ) THEN
    RETURN;
  END IF;

  SELECT max(month) INTO src
  FROM public.budgets
  WHERE household_id = p_household_id AND month < p_month;

  IF src IS NOT NULL THEN
    INSERT INTO public.budgets (household_id, category_id, month, amount, recurring)
    SELECT household_id, category_id, p_month, amount, true
    FROM public.budgets
    WHERE household_id = p_household_id AND month = src AND recurring
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.budget_months (household_id, month)
  VALUES (p_household_id, p_month)
  ON CONFLICT DO NOTHING;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.ensure_month_budgets FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.ensure_month_budgets TO authenticated;
