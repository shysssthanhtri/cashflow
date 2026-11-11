-- Used by the invite Server Action (service-role only) to resolve an email to a user id.
create function find_user_id_by_email(p_email text) returns uuid
language sql stable security definer set search_path = auth, public as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function find_user_id_by_email(text) from public, anon, authenticated;
grant execute on function find_user_id_by_email(text) to service_role;

-- Down: drop function find_user_id_by_email(text);
