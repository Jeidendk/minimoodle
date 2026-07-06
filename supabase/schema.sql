create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text unique not null,
  role text not null check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  parallel text not null default 'Paralelo 1',
  area text not null default 'Preparación Ineval',
  color text not null default '#168bd8',
  description text not null default '',
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  instructions text not null default '',
  opens_at timestamptz,
  closes_at timestamptz,
  time_limit_minutes integer not null default 30,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  answer_index integer not null default 0,
  explanation text not null default '',
  points integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  student_name text not null,
  answers jsonb not null default '{}'::jsonb,
  score numeric not null default 0,
  total numeric not null default 0,
  submitted_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;

create policy "profiles_read_all" on public.profiles for select using (true);
create policy "courses_read_all" on public.courses for select using (true);
create policy "quizzes_read_published_or_teacher" on public.quizzes for select using (published = true or true);
create policy "questions_read_all" on public.questions for select using (true);
create policy "attempts_read_all" on public.attempts for select using (true);

create policy "profiles_insert_all" on public.profiles for insert with check (true);
create policy "courses_insert_all" on public.courses for insert with check (true);
create policy "quizzes_insert_all" on public.quizzes for insert with check (true);
create policy "questions_insert_all" on public.questions for insert with check (true);
create policy "attempts_insert_all" on public.attempts for insert with check (true);

create policy "courses_update_all" on public.courses for update using (true);
create policy "quizzes_update_all" on public.quizzes for update using (true);
create policy "questions_update_all" on public.questions for update using (true);

insert into public.profiles (full_name, email, role)
values
  ('Docente Demo', 'docente@minimoodle.local', 'teacher'),
  ('Estudiante Demo', 'estudiante@minimoodle.local', 'student')
on conflict (email) do nothing;
