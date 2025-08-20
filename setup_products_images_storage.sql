-- =====================================================
-- SETUP PRODUCTS IMAGES STORAGE BUCKET
-- =====================================================

-- 1. Check if the bucket already exists
SELECT 
  'Current bucket status' as info,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE name = 'products_images';

-- 2. Create the products_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products_images', 'products_images', true, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- 3. Remove any existing policies on storage.objects for products_images
DELETE FROM storage.objects WHERE bucket_id = 'products_images';

-- 4. Drop existing policies that might interfere
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;
DROP POLICY IF EXISTS "products_images_policy" ON storage.objects;

-- 5. Create a simple, permissive policy for authenticated users
CREATE POLICY "products_images_policy" ON storage.objects
FOR ALL USING (
  bucket_id = 'products_images'
) WITH CHECK (
  bucket_id = 'products_images'
);

-- 6. Grant all permissions to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 7. Verify the setup
SELECT 
  'Final bucket configuration' as info,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE name = 'products_images';

SELECT 
  'Storage policies' as info,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

SELECT 
  'Current user' as info,
  auth.uid() as user_id,
  auth.role() as user_role;
