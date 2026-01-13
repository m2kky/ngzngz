-- Create storage buckets for avatars and workspace logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

DROP POLICY IF EXISTS "Anyone can update their own avatar." ON storage.objects;
CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' );

-- Set up security policies for logos
DROP POLICY IF EXISTS "Logo images are publicly accessible." ON storage.objects;
CREATE POLICY "Logo images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'logos' );

DROP POLICY IF EXISTS "Anyone can upload a logo." ON storage.objects;
CREATE POLICY "Anyone can upload a logo."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'logos' );

DROP POLICY IF EXISTS "Anyone can update their own logo." ON storage.objects;
CREATE POLICY "Anyone can update their own logo."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'logos' );
