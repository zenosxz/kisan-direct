-- Reference schema for Kisan Direct (SIH26033)
-- Tables already exist in Supabase; this documents expected columns.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique,
  phone text unique not null,
  name text,
  role text check (role in ('farmer', 'buyer', 'fpo_agent', 'admin')),
  state text,
  district text,
  upi_id text,
  created_at timestamptz default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references users(id),
  crop text not null,
  quantity numeric not null,
  price_per_quintal numeric not null,
  state text,
  district text,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id),
  buyer_id uuid references users(id),
  farmer_id uuid references users(id),
  quantity numeric not null,
  amount numeric not null,
  status text default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz default now()
);

create table if not exists mandi_prices (
  id uuid primary key default gen_random_uuid(),
  crop text,
  state text,
  market text,
  modal_price numeric,
  min_price numeric,
  max_price numeric,
  arrival_date date,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  rating int,
  comment text,
  created_at timestamptz default now()
);

create table if not exists disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  raised_by uuid references users(id),
  reason text,
  status text default 'open',
  created_at timestamptz default now()
);
