-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create annotations table
create table if not exists public.annotations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book text not null,
  chapter integer not null,
  verse integer not null,
  text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create votes table
create table if not exists public.votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  annotation_id uuid references public.annotations(id) on delete cascade not null,
  vote_type text check (vote_type in ('up', 'down')) not null,
  created_at timestamptz default now(),
  unique(user_id, annotation_id)
);

-- Create highlights table (for text selection ranges)
create table if not exists public.highlights (
  id uuid default uuid_generate_v4() primary key,
  annotation_id uuid references public.annotations(id) on delete cascade not null,
  book text not null,
  chapter integer not null,
  verse_start integer not null,
  verse_end integer not null,
  text_start integer not null,
  text_end integer not null,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists annotations_user_id_idx on public.annotations(user_id);
create index if not exists annotations_verse_idx on public.annotations(book, chapter, verse);
create index if not exists votes_user_id_idx on public.votes(user_id);
create index if not exists votes_annotation_id_idx on public.votes(annotation_id);
create index if not exists highlights_annotation_id_idx on public.highlights(annotation_id);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.annotations enable row level security;
alter table public.votes enable row level security;
alter table public.highlights enable row level security;

-- RLS Policies for profiles
create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for annotations
create policy "Anyone can view annotations"
  on public.annotations for select
  using (true);

create policy "Authenticated users can create annotations"
  on public.annotations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own annotations"
  on public.annotations for update
  using (auth.uid() = user_id);

create policy "Users can delete own annotations"
  on public.annotations for delete
  using (auth.uid() = user_id);

-- RLS Policies for votes
create policy "Anyone can view votes"
  on public.votes for select
  using (true);

create policy "Authenticated users can vote"
  on public.votes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own votes"
  on public.votes for update
  using (auth.uid() = user_id);

create policy "Users can delete own votes"
  on public.votes for delete
  using (auth.uid() = user_id);

-- RLS Policies for highlights
create policy "Anyone can view highlights"
  on public.highlights for select
  using (true);

create policy "Annotation owners can create highlights"
  on public.highlights for insert
  with check (
    exists (
      select 1 from public.annotations
      where id = annotation_id and user_id = auth.uid()
    )
  );

-- Functions for computed fields
create or replace function public.get_annotation_vote_counts(annotation_uuid uuid)
returns table (upvotes bigint, downvotes bigint) as $$
begin
  return query
  select 
    count(*) filter (where vote_type = 'up') as upvotes,
    count(*) filter (where vote_type = 'down') as downvotes
  from public.votes
  where annotation_id = annotation_uuid;
end;
$$ language plpgsql;

-- Trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_annotations_updated_at before update on public.annotations
  for each row execute function public.update_updated_at_column();