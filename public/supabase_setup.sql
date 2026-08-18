-- Supabase Database Bootstrap Script for Holy Ghost Academy Awka Portal
-- Copy and run this script in Supabase Dashboard -> SQL Editor

create table if not exists news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  excerpt text,
  category text,
  image_url text,
  created_at text
);

create table if not exists gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text,
  type text default 'image',
  url text not null,
  description text,
  created_at text
);

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  budget text,
  start_date text,
  completion_date text,
  progress_percentage integer default 0,
  image_url text
);

create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  filename text not null,
  file_type text,
  file_data text not null,
  uploaded_at text
);

create table if not exists results (
  id uuid default gen_random_uuid() primary key,
  student_id text not null,
  reg_number text not null,
  student_name text not null,
  class_unit text not null,
  session text not null,
  term text not null,
  scores jsonb default '[]'::jsonb,
  total_score numeric default 0,
  average_score numeric default 0,
  position integer default 1,
  out_of integer default 30,
  remarks text,
  class_placement text,
  gross_total_marks text,
  grade_point text,
  terminal_average_score text,
  accredited_grade_bracket text,
  class_standing text,
  passport_photo text,
  sex text default 'Male',
  promotion_status text
);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  message text not null,
  created_at text
);

create table if not exists staff (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text not null,
  department text default 'General',
  image_url text,
  created_at text
);

create table if not exists school_configs (
  key text primary key,
  value jsonb not null
);

create table if not exists registrations (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  password text not null,
  full_name text not null,
  created_at text
);

