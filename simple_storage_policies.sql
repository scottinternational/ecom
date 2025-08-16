-- =====================================================
-- Simple Storage Policies for Product Suggestions
-- =====================================================
-- This is a simpler, more permissive version of the storage policies
-- Use this if the main storage_policies.sql doesn't work

-- =====================================================
-- 1. CREATE BUCKET (if not exists)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product_suggestions',
  'product_suggestions',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. SIMPLE STORAGE POLICIES
-- =====================================================

-- Remove any existing policies for this bucket
DROP POLICY IF EXISTS "Authenticated users can upload product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update product suggestion images" ON storage.objects;

-- Simple upload policy - allow all authenticated users to upload
CREATE POLICY "Allow authenticated uploads to product_suggestions"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product_suggestions');

-- Simple view policy - allow public access to all images
CREATE POLICY "Allow public access to product_suggestions"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product_suggestions');

-- Simple delete policy - allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes from product_suggestions"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product_suggestions');

-- Simple update policy - allow authenticated users to update
CREATE POLICY "Allow authenticated updates to product_suggestions"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product_suggestions')
WITH CHECK (bucket_id = 'product_suggestions');

-- =====================================================
-- 3. VERIFICATION
-- =====================================================

-- Check bucket
SELECT 'Bucket Status:' as status, 
       CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product_suggestions') 
            THEN '✅ Created' ELSE '❌ Failed' END as result;

-- Check policies
SELECT 'Policies Created:' as status, 
       COUNT(*) as count 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%product_suggestions%';

-- Show all policies
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage' 
AND policyname LIKE '%product_suggestions%'
ORDER BY policyname;
