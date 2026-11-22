CREATE TYPE public.household_role AS ENUM ('owner', 'member');

CREATE TABLE public.memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  role          public.household_role NOT NULL DEFAULT 'member',
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE INDEX idx_memberships_user ON public.memberships (user_id);

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

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

GRANT USAGE ON SCHEMA private TO authenticated;
REVOKE EXECUTE ON FUNCTION private.is_household_member, private.is_household_owner FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION private.is_household_member, private.is_household_owner TO authenticated;

CREATE POLICY households_select ON public.households FOR SELECT TO authenticated
  USING (private.is_household_member(id));
CREATE POLICY households_update ON public.households FOR UPDATE TO authenticated
  USING (private.is_household_owner(id)) WITH CHECK (private.is_household_owner(id));
CREATE POLICY households_delete ON public.households FOR DELETE TO authenticated
  USING (private.is_household_owner(id));

-- No INSERT policy: rows are created only by the RPCs
CREATE POLICY memberships_select ON public.memberships FOR SELECT TO authenticated
  USING (private.is_household_member(household_id));
CREATE POLICY memberships_delete ON public.memberships FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()) OR private.is_household_owner(household_id));

-- Profiles of people in the same household are readable
DROP POLICY profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = profiles.id AND private.is_household_member(m.household_id)
    )
  );

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

REVOKE EXECUTE ON FUNCTION public.create_household FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.create_household TO authenticated;
