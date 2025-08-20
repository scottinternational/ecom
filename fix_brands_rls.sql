-- =====================================================
-- FIX BRANDS RLS POLICIES
-- =====================================================

-- Check current RLS status
SELECT 
  'RLS Status' as test,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'brands';

-- Check existing RLS policies
SELECT 
  'Current RLS policies' as test,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'brands';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.brands;

-- Create new RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON public.brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON public.brands TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Test the policies
SELECT 
  'Test query as authenticated user' as test,
  COUNT(*) as brand_count
FROM public.brands;

-- Show all brands after fixing policies
SELECT 
  'All brands after RLS fix' as test,
  id,
  brand,
  logo,
  created_at
FROM public.brands 
ORDER BY brand;
