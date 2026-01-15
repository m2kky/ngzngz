-- Enable RLS on storage.objects just in case (usually enabled by default)
alter table storage.objects enable row level security;

-- Policy to allow public access to avatars (Select)
create policy "Public Access to Avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload avatars (Insert)
create policy "Authenticated Users can Upload Avatars"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'avatars' );

-- Policy to allow users to update their own avatars (Update)
create policy "Users can Update their Avatars"
on storage.objects for update
to authenticated
using ( bucket_id = 'avatars' and owner = auth.uid() );

-- Policy to allow users to delete their own avatars (Delete)
create policy "Users can Delete their Avatars"
on storage.objects for delete
to authenticated
using ( bucket_id = 'avatars' and owner = auth.uid() );
