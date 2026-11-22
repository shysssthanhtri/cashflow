-- Display name for a user within one household; falls back to profiles.name when null
ALTER TABLE public.memberships
  ADD COLUMN nickname TEXT CHECK (nickname IS NULL OR char_length(btrim(nickname)) BETWEEN 1 AND 60);
