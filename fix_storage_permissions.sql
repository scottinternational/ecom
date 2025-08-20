-- =====================================================
-- FIX STORAGE BUCKET PERMISSIONS FOR BRANDS LOGO
-- =====================================================

-- 1. Check if the storage bucket exists
SELECT 
  'Storage bucket check' as test,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'brands_logo';

-- 2. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brands_logo', 'brands_logo', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow authenticated users to upload brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update brand logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete brand logos" ON storage.objects;

-- 5. Create new storage policies for authenticated users
-- Policy for uploading files (INSERT)
CREATE POLICY "Allow authenticated users to upload brand logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brands_logo' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'brands_logo'
);

-- Policy for viewing files (SELECT)
CREATE POLICY "Allow public to view brand logos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'brands_logo'
);

-- Policy for updating files (UPDATE)
CREATE POLICY "Allow authenticated users to update brand logos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'brands_logo' 
  AND auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'brands_logo' 
  AND auth.role() = 'authenticated'
);

-- Policy for deleting files (DELETE)
CREATE POLICY "Allow authenticated users to delete brand logos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'brands_logo' 
  AND auth.role() = 'authenticated'
);

-- 6. Alternative: Create a more permissive policy for testing
-- This policy allows any authenticated user to upload to the brands_logo bucket
CREATE POLICY "Allow authenticated uploads to brands_logo" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'brands_logo' 
  AND auth.role() = 'authenticated'
);

-- 7. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 8. Test the bucket configuration
SELECT 
  'Final bucket configuration' as test,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'brands_logo';

-- 9. Check storage policies
SELECT 
  'Storage policies' as test,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%brand%';

-- 10. Check current user authentication
SELECT 
  'Current user' as test,
  auth.uid() as user_id,
  auth.role() as user_role,
  current_user as current_user_name;
