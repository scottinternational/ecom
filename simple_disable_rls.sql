-- =====================================================
-- Simple Fix: Disable RLS for Immediate Testing
-- =====================================================

-- Disable RLS on product_suggestions table
ALTER TABLE public.product_suggestions DISABLE ROW LEVEL SECURITY;

-- Verify the change
SELECT 
  'RLS Status:' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'product_suggestions' 
      AND rowsecurity = false
    )
    THEN '✅ RLS disabled - you can now create suggestions!'
    ELSE '❌ RLS still enabled'
  END as result;

-- =====================================================
-- Test your image upload now!
-- =====================================================
