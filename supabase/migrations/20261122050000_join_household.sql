CREATE FUNCTION public.join_household(p_invite_code TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE hid UUID;
BEGIN
  SELECT id INTO hid FROM public.households
  WHERE invite_code = lower(trim(p_invite_code));
  IF hid IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code' USING ERRCODE = 'P0002';
  END IF;
  INSERT INTO public.memberships (household_id, user_id, role)
  VALUES (hid, (SELECT auth.uid()), 'member')
  ON CONFLICT DO NOTHING;
  RETURN hid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_household FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.join_household TO authenticated;
