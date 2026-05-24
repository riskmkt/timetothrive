create table if not exists public.courses_meta (
  id text primary key,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.courses_meta enable row level security;

drop policy if exists "courses_meta_read_all" on public.courses_meta;
create policy "courses_meta_read_all"
  on public.courses_meta
  for select
  using (true);

drop policy if exists "courses_meta_admin_insert" on public.courses_meta;
create policy "courses_meta_admin_insert"
  on public.courses_meta
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = 'icaroxzm@gmail.com');

drop policy if exists "courses_meta_admin_update" on public.courses_meta;
create policy "courses_meta_admin_update"
  on public.courses_meta
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'icaroxzm@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'icaroxzm@gmail.com');

insert into public.courses_meta (id, data)
values ('courses_meta', '[]'::jsonb)
on conflict (id) do nothing;
