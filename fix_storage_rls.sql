-- Fix Storage RLS Policies for product_suggestions bucket
-- This script creates proper RLS policies to allow image uploads

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_suggestions', 'product_suggestions', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

-- Create new policies for storage.objects
-- Policy for uploading images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product_suggestions' 
  AND auth.role() = 'authenticated'
);

-- Policy for viewing images
CREATE POLICY "Allow authenticated users to view images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product_suggestions' 
  AND auth.role() = 'authenticated'
);

-- Policy for updating images
CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product_suggestions' 
  AND auth.role() = 'authenticated'
);

-- Policy for deleting images
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product_suggestions' 
  AND auth.role() = 'authenticated'
);

-- Alternative: If you want to allow all operations without authentication (for testing)
-- Uncomment the following lines if the above policies don't work:

/*
-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;

-- Create a permissive policy for testing
CREATE POLICY "Allow all operations" ON storage.objects
FOR ALL USING (bucket_id = 'product_suggestions');
*/

-- Verify the policies
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
OR policyname LIKE '%authenticated%';
