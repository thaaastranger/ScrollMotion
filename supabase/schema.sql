-- ScrollMotion Supabase schema
-- Run this in Supabase SQL Editor after creating a project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  tier text not null default 'free' check (tier in ('free', 'pro', 'business')),
  exports_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  export_type text not null check (export_type in ('html_page', 'html_element')),
  source_type text not null check (source_type in ('video', 'images')),
  frame_count integer not null,
  scroll_pixels integer not null,
  format text not null,
  resolution text not null,
  aspect_ratio text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.record_export(
  p_export_type text,
  p_source_type text,
  p_frame_count integer,
  p_scroll_pixels integer,
  p_format text,
  p_resolution text,
  p_aspect_ratio text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_row public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_export_type not in ('html_page', 'html_element') then
    raise exception 'Invalid export type';
  end if;

  if p_source_type not in ('video', 'images') then
    raise exception 'Invalid source type';
  end if;

  if p_frame_count < 1 or p_frame_count > 1000 then
    raise exception 'Invalid frame count';
  end if;

  if p_scroll_pixels < 1 or p_scroll_pixels > 500000 then
    raise exception 'Invalid scroll height';
  end if;

  if p_format not in ('jpeg', 'webp') then
    raise exception 'Invalid export format';
  end if;

  if p_resolution not in ('original', '720p', '1080p', '2k', '4k') then
    raise exception 'Invalid export resolution';
  end if;

  if p_aspect_ratio not in ('original', '16:9', '4:3', '1:1', '9:16') then
    raise exception 'Invalid aspect ratio';
  end if;

  insert into public.exports (
    user_id,
    export_type,
    source_type,
    frame_count,
    scroll_pixels,
    format,
    resolution,
    aspect_ratio
  )
  values (
    auth.uid(),
    p_export_type,
    p_source_type,
    p_frame_count,
    p_scroll_pixels,
    p_format,
    p_resolution,
    p_aspect_ratio
  );

  update public.profiles
  set exports_used = exports_used + 1
  where id = auth.uid()
  returning * into profile_row;

  return profile_row;
end;
$$;

alter table public.profiles enable row level security;
alter table public.exports enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, email, full_name) on public.profiles to authenticated;
grant select on public.exports to authenticated;
revoke update on public.profiles from anon, authenticated;
revoke all on function public.record_export(text, text, integer, integer, text, text, text) from public, anon;
grant update (full_name, avatar_url) on public.profiles to authenticated;
grant execute on function public.record_export(text, text, integer, integer, text, text, text) to authenticated;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Exports are viewable by owner" on public.exports;
create policy "Exports are viewable by owner"
on public.exports for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own exports" on public.exports;
-- Export rows are inserted through public.record_export so user_id and count
-- changes are derived from auth.uid() instead of client-submitted values.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Avatar images are public" on storage.objects;
create policy "Avatar images are public"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
  and name ~* '\.(jpg|jpeg|png|webp|gif)$'
);

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
  and name ~* '\.(jpg|jpeg|png|webp|gif)$'
);
