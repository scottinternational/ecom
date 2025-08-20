-- =====================================================
-- TEST BRANDS TABLE ACCESS
-- =====================================================

-- Test 1: Check if table exists
SELECT 
  'Table exists' as test,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'brands';

-- Test 2: Check table structure
SELECT 
  'Table structure' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brands'
ORDER BY ordinal_position;

-- Test 3: Check RLS policies
SELECT 
  'RLS policies' as test,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'brands';

-- Test 4: Try to select data
SELECT 
  'Data access' as test,
  COUNT(*) as brand_count
FROM public.brands;

-- Test 5: Show sample data
SELECT 
  'Sample data' as test,
  id,
  brand,
  created_at
FROM public.brands 
ORDER BY brand 
LIMIT 3;
