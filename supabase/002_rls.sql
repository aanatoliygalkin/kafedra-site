-- 002_rls.sql
-- Правила доступа к данным (Row Level Security).
-- Выполняется после 001_init.sql.

-- Роль текущего пользователя. Функция помечена security definer, чтобы
-- обращение к таблице профилей не вызывало рекурсию правил доступа.
create or replace function public.current_role_name()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'guest'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('admin', 'staff');
$$;

-- ------------------------------------------------------------------- профили

alter table public.profiles enable row level security;

create policy "profiles: чтение своего профиля"
  on public.profiles for select
  using (auth.uid() = id or public.current_role_name() = 'admin');

create policy "profiles: изменение своего имени"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: управление администратором"
  on public.profiles for all
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');

-- -------------------------------------------------------------------- новости

alter table public.news enable row level security;

create policy "news: чтение опубликованных"
  on public.news for select
  using (published = true or public.is_staff());

create policy "news: добавление сотрудниками"
  on public.news for insert
  to authenticated
  with check (public.is_staff());

create policy "news: изменение сотрудниками"
  on public.news for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "news: удаление сотрудниками"
  on public.news for delete
  to authenticated
  using (public.is_staff());

-- -------------------------------------------------------- общие справочники

alter table public.teachers enable row level security;
alter table public.courses enable row level security;
alter table public.documents enable row level security;
alter table public.pages enable row level security;

create policy "teachers: чтение всем"
  on public.teachers for select using (true);
create policy "teachers: запись сотрудникам"
  on public.teachers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "courses: чтение всем"
  on public.courses for select using (true);
create policy "courses: запись сотрудникам"
  on public.courses for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "documents: чтение всем"
  on public.documents for select using (true);
create policy "documents: запись сотрудникам"
  on public.documents for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy "pages: чтение всем"
  on public.pages for select using (true);
create policy "pages: запись сотрудникам"
  on public.pages for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- --------------------------------------------------------- профиль при входе

-- При регистрации пользователя создаётся запись профиля с ролью staff.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'staff'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
