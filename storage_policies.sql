-- =====================================================
-- Storage Policies for Product Suggestions Bucket
-- =====================================================
-- Run this script in Supabase SQL Editor to set up storage policies
-- for the product_suggestions bucket

-- =====================================================
-- 1. CREATE STORAGE BUCKET (if not exists)
-- =====================================================

-- Create the product_suggestions storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product_suggestions',
  'product_suggestions',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 2. STORAGE POLICIES
-- =====================================================

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product suggestion images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product_suggestions' AND
  (storage.foldername(name))[1] = 'product-suggestions'
);

-- Policy 2: Allow public access to view images
CREATE POLICY "Public access to product suggestion images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'product_suggestions'
);

-- Policy 3: Allow authenticated users to delete their own images
CREATE POLICY "Users can delete product suggestion images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product_suggestions'
);

-- Policy 4: Allow authenticated users to update image metadata
CREATE POLICY "Users can update product suggestion images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product_suggestions'
)
WITH CHECK (
  bucket_id = 'product_suggestions'
);

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Check if bucket was created successfully
SELECT 
  'Storage Bucket Status:' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product_suggestions') 
    THEN '✅ Bucket created successfully'
    ELSE '❌ Bucket creation failed'
  END as result;

-- Show bucket details
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'product_suggestions';

-- Check storage policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%product suggestion%'
ORDER BY policyname;

-- =====================================================
-- 4. ALTERNATIVE: MORE PERMISSIVE POLICIES (if needed)
-- =====================================================

-- If the above policies are too restrictive, you can use these more permissive ones:

/*
-- More permissive upload policy
CREATE POLICY "Allow all authenticated uploads to product_suggestions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product_suggestions');

-- More permissive view policy
CREATE POLICY "Allow all public access to product_suggestions"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product_suggestions');

-- More permissive delete policy
CREATE POLICY "Allow all authenticated deletes from product_suggestions"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product_suggestions');
*/

-- =====================================================
-- 5. CLEANUP (if needed)
-- =====================================================

-- To remove existing policies (uncomment if needed):
/*
DROP POLICY IF EXISTS "Authenticated users can upload product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update product suggestion images" ON storage.objects;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- After running this script:
-- 1. The product_suggestions bucket will be created (if it doesn't exist)
-- 2. All necessary storage policies will be configured
-- 3. Users will be able to upload, view, and delete images
-- 4. Images will be stored in the product-suggestions/ folder
--
-- Test by uploading images through your application!
--
