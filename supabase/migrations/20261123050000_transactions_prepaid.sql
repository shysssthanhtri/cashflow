-- Expenses paid from a member's own pocket for the family; claimed_at is set once repaid.
ALTER TABLE public.transactions
  ADD COLUMN prepaid BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN claimed_at TIMESTAMPTZ,
  ADD CONSTRAINT transactions_claimed_requires_prepaid
    CHECK (claimed_at IS NULL OR prepaid);

CREATE INDEX transactions_unclaimed_idx
  ON public.transactions (household_id)
  WHERE prepaid AND claimed_at IS NULL;
