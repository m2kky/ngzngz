-- Create Clients Table
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  logo_url text,
  contact_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add ForeignKey to Projects
alter table public.projects 
add column if not exists client_id uuid references public.clients(id) on delete set null;

-- Enable RLS for Clients (Simplified for now)
alter table public.clients enable row level security;

create policy "Enable read access for authenticated users"
on public.clients for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on public.clients for insert
to authenticated
with check (true);
