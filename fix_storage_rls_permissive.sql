-- Fix Storage RLS Policies for product_suggestions bucket - PERMISSIVE VERSION
-- This script creates permissive RLS policies to allow image uploads

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_suggestions', 'product_suggestions', true)
ON CONFLICT (id) DO NOTHING;

-- Drop ALL existing policies for storage.objects to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create a single permissive policy for all operations
CREATE POLICY "Allow all operations for product_suggestions" ON storage.objects
FOR ALL USING (bucket_id = 'product_suggestions');

-- Alternative: If the above doesn't work, try this even more permissive approach
-- Uncomment the following lines if the above policy doesn't work:

/*
-- Drop the previous policy
DROP POLICY IF EXISTS "Allow all operations for product_suggestions" ON storage.objects;

-- Create a completely permissive policy
CREATE POLICY "Public Access" ON storage.objects
FOR ALL USING (true);
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
ORDER BY policyname;
