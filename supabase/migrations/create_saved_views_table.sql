-- Create saved_views table
create table if not exists public.saved_views (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('list', 'board', 'calendar')),
  config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.saved_views enable row level security;

-- Policies
create policy "Users can view saved views in their workspace"
  on public.saved_views for select
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = saved_views.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can create saved views in their workspace"
  on public.saved_views for insert
  with check (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = saved_views.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can update saved views in their workspace"
  on public.saved_views for update
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = saved_views.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can delete saved views in their workspace"
  on public.saved_views for delete
  using (
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = saved_views.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
create trigger handle_updated_at before update on public.saved_views
  for each row execute procedure moddatetime (updated_at);
