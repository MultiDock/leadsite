-- Create profiles table that extends Supabase Auth
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  role text default 'user' check (role in ('user', 'admin')),
  coins integer default 500,
  created_at timestamp with time zone default now()
);

-- Create a secure RLS policy
alter table public.profiles enable row level security;

-- Allow users to view and update only their own profile
create policy "Users can view their own profile" 
  on profiles for select using (auth.uid() = id);
  
create policy "Users can update their own profile" 
  on profiles for update using (auth.uid() = id);

-- Trigger to create profile after signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create leads table
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  interest text not null,
  location text not null,
  email text not null,
  phone text not null,
  score integer not null check (score >= 1 and score <= 100),
  price integer not null check (price > 0),
  status text default 'available' check (status in ('available', 'sold')),
  added_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Create RLS policies
alter table public.leads enable row level security;

-- Anyone can view available leads
create policy "Anyone can view available leads" 
  on leads for select using (status = 'available');

-- Users can view leads they've purchased (via purchases table)
create policy "Users can view purchased leads" 
  on leads for select using (
    exists (
      select 1 from purchases 
      where purchases.lead_id = id and purchases.user_id = auth.uid()
    )
  );

-- Admins can insert leads
create policy "Admins can insert leads" 
  on leads for insert to authenticated using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Admins can update leads
create policy "Admins can update leads" 
  on leads for update to authenticated using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Admins can delete leads
create policy "Admins can delete leads" 
  on leads for delete to authenticated using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Create purchases table
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) not null,
  user_id uuid references public.profiles(id) not null,
  price integer not null,
  order_number text not null unique,
  created_at timestamp with time zone default now()
);

-- Create RLS policies
alter table public.purchases enable row level security;

-- Users can view their own purchases
create policy "Users can view their own purchases" 
  on purchases for select using (auth.uid() = user_id);

-- Function to decrement coins
create or replace function decrement_coins(amount integer)
returns integer as $$
declare
  current_coins integer;
begin
  select coins into current_coins from profiles where id = auth.uid();
  return greatest(0, current_coins - amount);
end;
$$ language plpgsql security definer;

