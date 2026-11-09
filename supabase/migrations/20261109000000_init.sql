create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text not null
);

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users
);

create table household_members (
  household_id uuid not null references households on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  member_id uuid not null references auth.users,
  client_id uuid not null,
  type text not null check (type in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  category text not null,
  note text,
  date date not null,
  created_at timestamptz not null default now(),
  unique (household_id, client_id)
);
create index on transactions (household_id, date);
create index on household_members (user_id, joined_at desc);

alter table profiles enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;
alter table transactions enable row level security;

-- Security definer avoids recursive RLS evaluation on household_members.
create function is_household_member(h uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from household_members m
    where m.household_id = h and m.user_id = auth.uid()
  );
$$;

-- profiles: members of a shared household can read each other's name.
create policy "profiles read own or housemates" on profiles for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from household_members a
      join household_members b on a.household_id = b.household_id
      where a.user_id = auth.uid() and b.user_id = profiles.user_id
    )
  );
create policy "profiles insert own" on profiles for insert
  with check (user_id = auth.uid());
create policy "profiles update own" on profiles for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- households
create policy "households read members" on households for select
  using (is_household_member(id) or created_by = auth.uid());
create policy "households insert own" on households for insert
  with check (created_by = auth.uid());
create policy "households update members" on households for update
  using (is_household_member(id)) with check (is_household_member(id));

-- household_members: read own household; first owner row only by the creator.
-- Invites insert via the service-role key (bypasses RLS) after verifying membership.
create policy "members read same household" on household_members for select
  using (is_household_member(household_id));
create policy "members insert creator as owner" on household_members for insert
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1 from households h
      where h.id = household_id and h.created_by = auth.uid()
    )
  );

-- transactions
create policy "transactions read household" on transactions for select
  using (is_household_member(household_id));
create policy "transactions insert household" on transactions for insert
  with check (is_household_member(household_id) and member_id = auth.uid());
create policy "transactions update household" on transactions for update
  using (is_household_member(household_id))
  with check (is_household_member(household_id));
create policy "transactions delete household" on transactions for delete
  using (is_household_member(household_id));
