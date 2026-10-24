-- ====================================================================
-- RELOOP DATABASE SCHEMA & MIGRATION SCRIPT
-- Project: ReLoop (Give. Reuse. Repeat. ♻️)
-- Compatible with Supabase PostgreSQL (Postgres 14, 15, 16+)
-- ====================================================================

-- 1) Create Tables

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  location text,
  bio text,
  badge text default 'Active Member',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RESOURCES (Items, Services, Requests, Disposal, Plants, Others)
create table if not exists public.resources (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  resource_type text default 'item', -- item, service, request, disposal, plants, others
  title text not null,
  description text,
  category text,
  condition text,
  repairable_if_damaged boolean default false,
  is_time_sensitive boolean default false,
  expires_at timestamptz,
  status text default 'available', -- available, pending, completed, unavailable, expired, deleted
  price numeric default 0,
  is_free boolean default true,
  quantity integer default 1,
  pickup_available boolean default false,
  delivery_available boolean default false,
  location_name text,
  latitude numeric,
  longitude numeric,
  image_url text,
  image_urls text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- WISHLISTS (Favorites / Likes)
create table if not exists public.wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, resource_id)
);

-- MESSAGES (Chat / Inquiries)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- REQUESTS (Resource Claim / Booking / Request workflow)
create table if not exists public.requests (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  message text,
  status text default 'pending', -- pending, accepted, rejected, cancelled, completed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text,
  title text,
  message text,
  related_resource_id uuid references public.resources(id) on delete set null,
  related_request_id uuid references public.requests(id) on delete set null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ====================================================================
-- 2) Automatic Profile Trigger on Auth Signup
-- ====================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/initials/svg?seed=' || coalesce(new.raw_user_meta_data->>'full_name', new.email))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- 3) Row Level Security (RLS)
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.resources enable row level security;
alter table public.wishlists enable row level security;
alter table public.messages enable row level security;
alter table public.requests enable row level security;
alter table public.notifications enable row level security;

-- Profiles Policies
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Resources Policies
drop policy if exists "Resources are viewable by everyone" on public.resources;
create policy "Resources are viewable by everyone"
  on public.resources for select using (true);

drop policy if exists "Users can insert own resources" on public.resources;
create policy "Users can insert own resources"
  on public.resources for insert with check (auth.uid() = provider_id);

drop policy if exists "Users can update own resources" on public.resources;
create policy "Users can update own resources"
  on public.resources for update using (auth.uid() = provider_id);

drop policy if exists "Users can delete own resources" on public.resources;
create policy "Users can delete own resources"
  on public.resources for delete using (auth.uid() = provider_id);

-- Wishlists Policies
drop policy if exists "Wishlists are viewable by everyone" on public.wishlists;
create policy "Wishlists are viewable by everyone"
  on public.wishlists for select using (true);

drop policy if exists "Users can insert own wishlists" on public.wishlists;
create policy "Users can insert own wishlists"
  on public.wishlists for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlists" on public.wishlists;
create policy "Users can delete own wishlists"
  on public.wishlists for delete using (auth.uid() = user_id);

-- Messages Policies
drop policy if exists "Users can view messages they are part of" on public.messages;
create policy "Users can view messages they are part of"
  on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can insert messages they send" on public.messages;
create policy "Users can insert messages they send"
  on public.messages for insert with check (auth.uid() = sender_id);

drop policy if exists "Users can update messages they sent" on public.messages;
create policy "Users can update messages they sent"
  on public.messages for update using (auth.uid() = sender_id);

-- Requests Policies
drop policy if exists "Users can view requests they are part of" on public.requests;
create policy "Users can view requests they are part of"
  on public.requests for select using (auth.uid() = requester_id or auth.uid() = provider_id);

drop policy if exists "Users can insert requests they make" on public.requests;
create policy "Users can insert requests they make"
  on public.requests for insert with check (auth.uid() = requester_id);

drop policy if exists "Providers can update requests for their resources" on public.requests;
create policy "Providers can update requests for their resources"
  on public.requests for update using (auth.uid() = provider_id);

-- Notifications Policies
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "System can insert notifications" on public.notifications;
create policy "System can insert notifications"
  on public.notifications for insert with check (auth.uid() = user_id);

drop policy if exists "Users can mark own notifications read" on public.notifications;
create policy "Users can mark own notifications read"
  on public.notifications for update using (auth.uid() = user_id);

-- ====================================================================
-- 4) Storage Buckets for Images
-- ====================================================================

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = true;

-- Storage Policies
drop policy if exists "Item images are publicly readable" on storage.objects;
create policy "Item images are publicly readable"
  on storage.objects for select using (bucket_id = 'item-images');

drop policy if exists "Authenticated users can upload item images" on storage.objects;
create policy "Authenticated users can upload item images"
  on storage.objects for insert with check (bucket_id = 'item-images');

drop policy if exists "Profile images are publicly readable" on storage.objects;
create policy "Profile images are publicly readable"
  on storage.objects for select using (bucket_id = 'profile-images');

drop policy if exists "Authenticated users can upload profile images" on storage.objects;
create policy "Authenticated users can upload profile images"
  on storage.objects for insert with check (bucket_id = 'profile-images');

-- ====================================================================
-- 5) REVIEWS, PROVIDER RATINGS & VERIFICATION SCHEMA
-- ====================================================================

-- 5.1 Add Rating & Verification Columns to Profiles Table
alter table public.profiles 
  add column if not exists avg_rating numeric(3,2) default 0.0,
  add column if not exists total_reviews integer default 0,
  add column if not exists is_verified boolean default false;

-- 5.2 Create Reviews Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.profiles(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_reviewer_resource unique(reviewer_id, resource_id),
  constraint check_cannot_rate_self check (reviewer_id <> provider_id)
);

-- Performance Indexes
create index if not exists idx_reviews_provider_id on public.reviews(provider_id);
create index if not exists idx_reviews_resource_id on public.reviews(resource_id);
create index if not exists idx_reviews_reviewer_id on public.reviews(reviewer_id);

-- 5.3 Trigger Function to Automatically Recalculate Provider Rating & Verification
create or replace function public.recalculate_provider_rating()
returns trigger as $$
declare
  target_provider_id uuid;
  calc_avg numeric(3,2);
  calc_count integer;
begin
  if (TG_OP = 'DELETE') then
    target_provider_id := OLD.provider_id;
  else
    target_provider_id := NEW.provider_id;
  end if;

  -- Calculate average rating and total count across all received reviews
  select 
    coalesce(round(avg(rating)::numeric, 2), 0.0),
    count(*)
  into calc_avg, calc_count
  from public.reviews
  where provider_id = target_provider_id;

  -- Update provider's profile with recalculated rating and verification
  update public.profiles
  set 
    avg_rating = calc_avg,
    total_reviews = calc_count,
    is_verified = (calc_avg >= 4.5 and calc_count >= 5),
    updated_at = now()
  where id = target_provider_id;

  return null;
end;
$$ language plpgsql security definer;

-- Trigger attached to reviews table
drop trigger if exists trg_recalculate_provider_rating on public.reviews;
create trigger trg_recalculate_provider_rating
  after insert or update or delete on public.reviews
  for each row execute procedure public.recalculate_provider_rating();

-- 5.4 Row Level Security for Reviews Table
alter table public.reviews enable row level security;

-- Everyone can read reviews
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

-- Authenticated users can insert reviews for resources they did not provide
drop policy if exists "Authenticated users can submit reviews" on public.reviews;
create policy "Authenticated users can submit reviews"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id and
    reviewer_id <> provider_id
  );

-- Reviewers can update their own review
drop policy if exists "Reviewers can update own reviews" on public.reviews;
create policy "Reviewers can update own reviews"
  on public.reviews for update
  using (auth.uid() = reviewer_id);

-- Reviewers can delete their own review
drop policy if exists "Reviewers can delete own reviews" on public.reviews;
create policy "Reviewers can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = reviewer_id);

