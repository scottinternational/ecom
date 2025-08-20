-- =====================================================
-- TEST BRANDS TABLE ACCESS
-- =====================================================
-- This script tests if the brands table exists and is accessible

-- Check if brands table exists
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'brands';

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brands'
ORDER BY ordinal_position;

-- Check RLS policies
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
WHERE schemaname = 'public' 
AND tablename = 'brands';

-- Try to select from brands table
SELECT COUNT(*) as brand_count FROM public.brands;

-- Show sample data
SELECT * FROM public.brands LIMIT 5;
