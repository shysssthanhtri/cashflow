CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

CREATE TYPE public.period_status AS ENUM ('open', 'closed');

CREATE TABLE public.periods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name          TEXT,
  start_date    DATE NOT NULL,
  end_date      DATE,
  status        public.period_status NOT NULL DEFAULT 'open',
  closed_by     UUID REFERENCES public.profiles(id),
  closed_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date),
  CHECK ((status = 'closed') = (end_date IS NOT NULL)),
  UNIQUE (id, household_id)
);

CREATE UNIQUE INDEX one_open_period_per_household
  ON public.periods (household_id) WHERE status = 'open';

ALTER TABLE public.periods ADD CONSTRAINT no_overlapping_periods
  EXCLUDE USING gist (
    household_id WITH =,
    daterange(start_date, COALESCE(end_date, 'infinity'), '[]') WITH &&
  );

ALTER TABLE public.periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY periods_all ON public.periods FOR ALL TO authenticated
  USING (private.is_household_member(household_id))
  WITH CHECK (private.is_household_member(household_id));
