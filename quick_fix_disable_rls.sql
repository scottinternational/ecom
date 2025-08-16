-- =====================================================
-- Quick Fix: Disable RLS for Product Suggestions
-- =====================================================
-- This temporarily disables RLS to allow product suggestion creation
-- Use this for immediate testing, then run the proper fix later

-- Disable RLS on product_suggestions table
ALTER TABLE public.product_suggestions DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  'RLS Status:' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'product_suggestions' 
      AND rowsecurity = false
    )
    THEN '✅ RLS disabled - you can now create suggestions'
    ELSE '❌ RLS still enabled'
  END as result;

-- =====================================================
-- IMPORTANT: Re-enable RLS later with proper policies
-- =====================================================
-- After testing, run the fix_product_suggestions_rls.sql script
-- to re-enable RLS with proper policies
