-- Create automation_rules table
create table if not exists automation_rules (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  trigger_event text not null,
  filters jsonb default '[]'::jsonb,
  actions_chain jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table automation_rules enable row level security;

-- Create policies
create policy "Users can view automation rules for their workspaces"
  on automation_rules for select
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = automation_rules.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can insert automation rules for their workspaces"
  on automation_rules for insert
  with check (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = automation_rules.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can update automation rules for their workspaces"
  on automation_rules for update
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = automation_rules.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

create policy "Users can delete automation rules for their workspaces"
  on automation_rules for delete
  using (
    exists (
      select 1 from workspace_members
      where workspace_members.workspace_id = automation_rules.workspace_id
      and workspace_members.user_id = auth.uid()
    )
  );

-- Create updated_at trigger handler if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create updated_at trigger
create trigger handle_updated_at before update on automation_rules
  for each row execute procedure public.handle_updated_at();
