CREATE TABLE public.transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  period_id     UUID NOT NULL,
  category_id   UUID,
  type          public.category_type NOT NULL DEFAULT 'expense',
  amount        NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  note          TEXT,
  occurred_at   DATE NOT NULL,
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (period_id, household_id)
    REFERENCES public.periods (id, household_id),
  FOREIGN KEY (category_id, household_id)
    REFERENCES public.categories (id, household_id)
);

CREATE INDEX transactions_household_occurred_idx
  ON public.transactions (household_id, occurred_at DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_all ON public.transactions FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));
