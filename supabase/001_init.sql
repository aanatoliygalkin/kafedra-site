-- 001_init.sql
-- Структура базы данных сайта кафедры.
-- Выполняется в SQL-редакторе Supabase один раз, до файла 002_rls.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- перечисления

create type public.news_category as enum (
  'Учёба',
  'Студенты',
  'Расписание',
  'Наука',
  'Приём'
);

create type public.document_category as enum (
  'Учебные планы',
  'Методические материалы',
  'Бланки',
  'Приказы'
);

create type public.user_role as enum ('admin', 'staff', 'guest');

-- ------------------------------------------------------------------- профили

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.user_role not null default 'staff',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Учётные записи сотрудников: роль определяет права';

-- ------------------------------------------------------------------ страницы

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '',
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------- новости

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 5 and 200),
  excerpt text not null default '',
  body text not null check (char_length(body) between 20 and 40000),
  category public.news_category not null default 'Учёба',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_published_idx on public.news (published, published_at desc);
create index news_category_idx on public.news (category);
create index news_slug_idx on public.news (slug);

-- -------------------------------------------------------------- преподаватели

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 150),
  position text not null default '',
  degree text not null default '',
  email text not null default '',
  phone text not null default '',
  photo_url text,
  disciplines text[] not null default '{}',
  experience_years integer not null default 0 check (experience_years between 0 and 70),
  is_head boolean not null default false,
  sort_order integer not null default 100,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------- дисциплины

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null check (char_length(title) between 3 and 200),
  semester integer not null default 1 check (semester between 1 and 8),
  hours integer not null default 72 check (hours > 0),
  credits integer not null default 2 check (credits > 0),
  form text not null default 'Очная',
  description text not null default '',
  teacher_id uuid references public.teachers (id) on delete set null,
  updated_at timestamptz not null default now()
);

create index courses_semester_idx on public.courses (semester);

-- ------------------------------------------------------------------ документы

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 250),
  category public.document_category not null default 'Методические материалы',
  file_url text not null,
  file_size bigint not null default 0 check (file_size >= 0),
  version text not null default '',
  updated_at timestamptz not null default now()
);

create index documents_category_idx on public.documents (category, updated_at desc);

-- ------------------------------------------------------- отметка о изменении

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger news_updated_at before update on public.news
  for each row execute function public.set_updated_at();

create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();

create trigger teachers_updated_at before update on public.teachers
  for each row execute function public.set_updated_at();

create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

create trigger documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
