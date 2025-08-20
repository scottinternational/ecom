-- =====================================================
-- SIMPLE STORAGE FIX FOR BRANDS LOGO UPLOAD
-- =====================================================

-- 1. First, let's check what we have
SELECT 'Current bucket status' as info, name, public, file_size_limit FROM storage.buckets WHERE name = 'brands_logo';

-- 2. Make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brands_logo', 'brands_logo', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 3. Remove ALL existing policies on storage.objects for brands_logo
DELETE FROM storage.objects WHERE bucket_id = 'brands_logo';

-- 4. Drop all existing policies that might interfere
DROP POLICY IF EXISTS "Allow authenticated users to upload brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to brands_logo" ON storage.objects;

-- 5. Create a simple, permissive policy for authenticated users
CREATE POLICY "brands_logo_policy" ON storage.objects
FOR ALL USING (
  bucket_id = 'brands_logo'
) WITH CHECK (
  bucket_id = 'brands_logo'
);

-- 6. Grant all permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 7. Verify the setup
SELECT 'Final bucket configuration' as info, name, public, file_size_limit FROM storage.buckets WHERE name = 'brands_logo';
SELECT 'Storage policies' as info, policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
SELECT 'Current user' as info, auth.uid() as user_id, auth.role() as user_role;
