-- MiniMoodle schema (v4)
-- PKs are TEXT so app-generated ids (e.g. "quiz-<uuid>", "matematica") work as-is.
-- Run this whole file in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- Tables
-- ------------------------------------------------------------------
create table if not exists public.profiles (
  id text primary key,
  auth_user_id uuid unique,
  full_name text not null,
  email text unique,
  cedula text unique,
  role text not null check (role in ('student', 'teacher')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  parallel text not null default 'Paralelo 1',
  area text not null default 'Preparación Ineval',
  color text not null default '#168bd8',
  description text not null default '',
  teacher_id text references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.sections (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  "order" integer not null default 0,
  created_at timestamptz not null default now()
);

-- Reusable, global question banks (independent of course)
create table if not exists public.question_banks (
  id text primary key,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  section_id text references public.sections(id) on delete set null,
  title text not null,
  instructions text not null default '',
  opens_at timestamptz,
  closes_at timestamptz,
  time_limit_minutes integer not null default 30,
  published boolean not null default false,
  -- Bank-draw simulator config (null bank_id = classic quiz with its own questions)
  bank_id text references public.question_banks(id) on delete set null,
  question_count integer not null default 0,
  minutes_per_question integer not null default 1,
  shuffle_questions boolean not null default true,
  shuffle_options boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  quiz_id text references public.quizzes(id) on delete cascade,
  bank_id text references public.question_banks(id) on delete cascade,
  prompt text not null,
  options jsonb not null default '[]'::jsonb,
  answer_index integer not null default 0,
  explanation text not null default '',
  points integer not null default 1,
  image text,
  created_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id text primary key,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  student_id text references public.profiles(id) on delete set null,
  student_name text not null,
  answers jsonb not null default '{}'::jsonb,
  question_ids jsonb not null default '[]'::jsonb,
  score numeric not null default 0,
  total numeric not null default 0,
  submitted_at timestamptz not null default now()
);

create table if not exists public.students (
  id text primary key,
  full_name text not null,
  cedula text,
  email text,
  courses jsonb not null default '[]'::jsonb,
  code text,
  status text not null default 'Pendiente',
  color text,
  initials text,
  registered_at timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- Row Level Security (demo: open policies)
-- ------------------------------------------------------------------
-- Idempotent migration for projects that already ran an earlier schema version.
alter table public.quizzes   add column if not exists bank_id text references public.question_banks(id) on delete set null;
alter table public.quizzes   add column if not exists question_count integer not null default 0;
alter table public.quizzes   add column if not exists minutes_per_question integer not null default 1;
alter table public.quizzes   add column if not exists shuffle_questions boolean not null default true;
alter table public.quizzes   add column if not exists shuffle_options boolean not null default true;
alter table public.questions add column if not exists bank_id text references public.question_banks(id) on delete cascade;
alter table public.attempts  add column if not exists answers jsonb not null default '{}'::jsonb;
alter table public.attempts  add column if not exists question_ids jsonb not null default '[]'::jsonb;
alter table public.attempts  add column if not exists score numeric not null default 0;
alter table public.attempts  add column if not exists total numeric not null default 0;
alter table public.attempts  add column if not exists student_name text not null default '';
-- questions.quiz_id must allow NULL for bank-only questions
alter table public.questions alter column quiz_id drop not null;

alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.sections       enable row level security;
alter table public.question_banks enable row level security;
alter table public.quizzes        enable row level security;
alter table public.questions      enable row level security;
alter table public.attempts       enable row level security;
alter table public.students       enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profiles','courses','sections','question_banks','quizzes','questions','attempts','students']
  loop
    execute format('drop policy if exists "%s_all" on public.%I;', t, t);
    execute format('create policy "%s_all" on public.%I for all using (true) with check (true);', t, t);
  end loop;
end $$;

-- ------------------------------------------------------------------
-- Storage: bucket for question images (webp)
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;

drop policy if exists "question_images_read" on storage.objects;
create policy "question_images_read" on storage.objects
  for select using (bucket_id = 'question-images');

drop policy if exists "question_images_write" on storage.objects;
create policy "question_images_write" on storage.objects
  for insert with check (bucket_id = 'question-images');

drop policy if exists "question_images_update" on storage.objects;
create policy "question_images_update" on storage.objects
  for update using (bucket_id = 'question-images');

drop policy if exists "question_images_delete" on storage.objects;
create policy "question_images_delete" on storage.objects
  for delete using (bucket_id = 'question-images');

-- ------------------------------------------------------------------
-- Seed profiles (login by cédula)
-- ------------------------------------------------------------------
insert into public.profiles (id, full_name, email, cedula, role)
values
  ('teacher-demo', 'Docente Demo', 'docente@minimoodle.local', '1996202530', 'teacher'),
  ('student-demo', 'Estudiante Demo', 'estudiante@minimoodle.local', '1234567890', 'student')
on conflict (id) do update
  set cedula = excluded.cedula,
      full_name = excluded.full_name,
      role = excluded.role;
