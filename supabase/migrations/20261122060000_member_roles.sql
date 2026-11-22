CREATE FUNCTION public.promote_member(p_household_id UUID, p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NOT private.is_household_owner(p_household_id) THEN
    RAISE EXCEPTION 'Only owners can promote members' USING ERRCODE = '42501';
  END IF;
  UPDATE public.memberships SET role = 'owner'
  WHERE household_id = p_household_id AND user_id = p_user_id;
END;
$$;

CREATE FUNCTION public.leave_household(p_household_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE my_role public.household_role;
BEGIN
  -- Lock the household's memberships so concurrent leaves can't orphan it
  PERFORM 1 FROM public.memberships WHERE household_id = p_household_id FOR UPDATE;
  SELECT role INTO my_role FROM public.memberships
  WHERE household_id = p_household_id AND user_id = (SELECT auth.uid());
  IF my_role IS NULL THEN
    RAISE EXCEPTION 'Not a member' USING ERRCODE = '42501';
  END IF;
  IF my_role = 'owner' AND NOT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE household_id = p_household_id AND role = 'owner'
      AND user_id <> (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Last owner cannot leave' USING ERRCODE = 'P0001';
  END IF;
  DELETE FROM public.memberships
  WHERE household_id = p_household_id AND user_id = (SELECT auth.uid());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.promote_member, public.leave_household FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.promote_member, public.leave_household TO authenticated;
