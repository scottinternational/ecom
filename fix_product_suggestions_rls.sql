-- =====================================================
-- Fix Product Suggestions RLS Policies
-- =====================================================
-- This script fixes the RLS policies that are blocking product suggestion creation

-- =====================================================
-- 1. REMOVE ALL EXISTING POLICIES
-- =====================================================

-- Drop all existing policies for product_suggestions table
DROP POLICY IF EXISTS "Everyone can view product suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Admins and managers can manage product suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Authenticated users can create product suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Admins and managers can manage all suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Users can delete their own suggestions" ON public.product_suggestions;

-- =====================================================
-- 2. CREATE NEW PERMISSIVE POLICIES
-- =====================================================

-- Policy 1: Allow authenticated users to view all suggestions
CREATE POLICY "Everyone can view product suggestions" ON public.product_suggestions 
FOR SELECT TO authenticated 
USING (true);

-- Policy 2: Allow authenticated users to create suggestions
CREATE POLICY "Authenticated users can create product suggestions" ON public.product_suggestions 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = submitted_by);

-- Policy 3: Allow users to update their own suggestions
CREATE POLICY "Users can update their own suggestions" ON public.product_suggestions 
FOR UPDATE TO authenticated 
USING (auth.uid() = submitted_by)
WITH CHECK (auth.uid() = submitted_by);

-- Policy 4: Allow admins and managers to manage all suggestions
CREATE POLICY "Admins and managers can manage all suggestions" ON public.product_suggestions 
FOR ALL TO authenticated 
USING (public.is_admin_or_manager(auth.uid()));

-- Policy 5: Allow users to delete their own suggestions
CREATE POLICY "Users can delete their own suggestions" ON public.product_suggestions 
FOR DELETE TO authenticated 
USING (auth.uid() = submitted_by);

-- =====================================================
-- 3. VERIFICATION QUERIES
-- =====================================================

-- Check current policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'product_suggestions' 
AND schemaname = 'public'
ORDER BY policyname;

-- Check RLS status
SELECT 
  'RLS Status:' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'product_suggestions' 
      AND rowsecurity = true
    )
    THEN '✅ RLS enabled'
    ELSE '❌ RLS not enabled'
  END as result;

-- =====================================================
-- 4. ALTERNATIVE: DISABLE RLS (if needed)
-- =====================================================

-- If you want to temporarily disable RLS for testing, uncomment this:
/*
ALTER TABLE public.product_suggestions DISABLE ROW LEVEL SECURITY;
*/

-- To re-enable RLS later:
/*
ALTER TABLE public.product_suggestions ENABLE ROW LEVEL SECURITY;
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- After running this script:
-- 1. Authenticated users can create product suggestions
-- 2. Users can view all suggestions
-- 3. Users can update/delete their own suggestions
-- 4. Admins/managers can manage all suggestions
-- 5. The image upload should work completely
--
