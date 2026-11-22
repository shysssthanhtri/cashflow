CREATE FUNCTION public.set_nickname(p_household_id UUID, p_nickname TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.memberships SET nickname = NULLIF(btrim(p_nickname), '')
  WHERE household_id = p_household_id AND user_id = (SELECT auth.uid());
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not a member' USING ERRCODE = '42501';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_nickname FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.set_nickname TO authenticated;
