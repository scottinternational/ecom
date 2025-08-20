-- =====================================================
-- DEBUG BRANDS TABLE
-- =====================================================

-- Check if table exists
SELECT 
  'Table exists' as test,
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'brands';

-- Check table structure
SELECT 
  'Table structure' as test,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brands'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  'RLS policies' as test,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'brands';

-- Count total records
SELECT 
  'Total count' as test,
  COUNT(*) as brand_count
FROM public.brands;

-- Show all brands
SELECT 
  'All brands' as test,
  id,
  brand,
  description,
  logo_url,
  website,
  contact_email,
  contact_phone,
  address,
  is_active,
  created_by,
  created_at,
  updated_at
FROM public.brands 
ORDER BY brand;

-- Check if user is authenticated
SELECT 
  'Current user' as test,
  auth.uid() as user_id,
  auth.role() as user_role;
