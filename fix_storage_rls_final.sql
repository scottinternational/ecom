-- =====================================================
-- FINAL STORAGE FIX FOR PRODUCT SUGGESTIONS
-- =====================================================
-- This script ensures the storage bucket and policies are correctly set up
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CREATE/UPDATE STORAGE BUCKET
-- =====================================================

-- Create the product_suggestions storage bucket with proper settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product_suggestions',
  'product_suggestions',
  true, -- Public bucket for easy access
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- 2. REMOVE ALL EXISTING POLICIES
-- =====================================================

-- Drop ALL existing policies for storage.objects to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Public access to product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update product suggestion images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to product_suggestions" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to product_suggestions" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from product_suggestions" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to product_suggestions" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations for product_suggestions" ON storage.objects;

-- =====================================================
-- 3. CREATE NEW PERMISSIVE POLICIES
-- =====================================================

-- Create a single permissive policy for ALL operations on the product_suggestions bucket
CREATE POLICY "Allow all operations for product_suggestions" ON storage.objects
FOR ALL USING (bucket_id = 'product_suggestions');

-- =====================================================
-- 4. VERIFY THE SETUP
-- =====================================================

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'product_suggestions';

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%product_suggestions%'
ORDER BY policyname;

-- =====================================================
-- 5. TEST DATA (Optional)
-- =====================================================

-- Check if there are any existing files in the bucket
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at
FROM storage.objects 
WHERE bucket_id = 'product_suggestions'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 6. ADDITIONAL SECURITY (Optional)
-- =====================================================

-- If you want more specific policies instead of the permissive one above,
-- uncomment and use these instead:

/*
-- Policy for uploading images
CREATE POLICY "Allow uploads to product_suggestions" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product_suggestions');

-- Policy for viewing images (public access)
CREATE POLICY "Allow public view of product_suggestions" ON storage.objects
FOR SELECT USING (bucket_id = 'product_suggestions');

-- Policy for updating images
CREATE POLICY "Allow updates to product_suggestions" ON storage.objects
FOR UPDATE USING (bucket_id = 'product_suggestions');

-- Policy for deleting images
CREATE POLICY "Allow deletes from product_suggestions" ON storage.objects
FOR DELETE USING (bucket_id = 'product_suggestions');
*/

-- =====================================================
-- 7. CLEANUP OLD FILES (Optional)
-- =====================================================

-- If you want to clean up any corrupted or old files, uncomment this:
/*
DELETE FROM storage.objects 
WHERE bucket_id = 'product_suggestions' 
AND created_at < NOW() - INTERVAL '1 day';
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Storage bucket and policies have been configured successfully!' as status;
