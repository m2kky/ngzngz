-- جدول لتخزين الذكريات والملاحظات الدائمة
create table sensei_memories (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) not null,
  content text not null, -- المعلومة نفسها (مثلاً: العميل بيكره اللون الأحمر)
  category text check (category in ('preference', 'fact', 'plan', 'insight')) default 'fact',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- تفعيل RLS (الأمان)
alter table sensei_memories enable row level security;

-- السماح للأعضاء بالقراءة والكتابة
create policy "Enable all access for workspace members" on sensei_memories
  for all using (
    workspace_id in (
      select workspace_id from workspace_members where user_id = auth.uid()
    )
  );
