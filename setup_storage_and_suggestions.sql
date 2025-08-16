-- =====================================================
-- Product Suggestions with Supabase Storage Integration
-- =====================================================
-- This script sets up the complete product suggestions system
-- including the storage bucket and database table

-- =====================================================
-- 1. STORAGE BUCKET SETUP
-- =====================================================

-- Create the product_suggestions storage bucket
-- Note: This needs to be done via Supabase Dashboard or CLI
-- The bucket should be created with the following settings:
-- - Name: product_suggestions
-- - Public: true (for public access to images)
-- - File size limit: 10MB
-- - Allowed MIME types: image/*

-- =====================================================
-- 2. DATABASE TABLE SETUP
-- =====================================================

-- Create product suggestions table for R&D (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_marketplaces TEXT[] NOT NULL DEFAULT '{}',
  competitors TEXT[] NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_cost TEXT,
  expected_timeline TEXT,
  research_notes TEXT,
  product_url TEXT,
  product_images TEXT[], -- Stores URLs from Supabase storage bucket
  status TEXT NOT NULL DEFAULT 'In Research',
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable Row Level Security for product_suggestions (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'product_suggestions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.product_suggestions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS Policies for product_suggestions (only if they don't exist)
DO $$
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_suggestions' 
    AND policyname = 'Everyone can view product suggestions'
  ) THEN
    CREATE POLICY "Everyone can view product suggestions" ON public.product_suggestions FOR SELECT TO authenticated USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_suggestions' 
    AND policyname = 'Admins and managers can manage product suggestions'
  ) THEN
    CREATE POLICY "Admins and managers can manage product suggestions" ON public.product_suggestions FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));
  END IF;
END $$;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Create trigger for updating timestamps (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_product_suggestions_updated_at'
  ) THEN
    CREATE TRIGGER update_product_suggestions_updated_at 
    BEFORE UPDATE ON public.product_suggestions 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 5. STORAGE POLICIES (for Supabase Dashboard)
-- =====================================================

-- Storage bucket policies should be configured in Supabase Dashboard:
-- 1. Go to Storage > product_suggestions bucket
-- 2. Set up the following policies:

-- Policy for authenticated users to upload images:
-- Name: "Authenticated users can upload product suggestion images"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition: (bucket_id = 'product_suggestions')

-- Policy for public access to view images:
-- Name: "Public access to product suggestion images"
-- Operation: SELECT
-- Target roles: anon, authenticated
-- Policy definition: (bucket_id = 'product_suggestions')

-- Policy for authenticated users to delete their own images:
-- Name: "Users can delete product suggestion images"
-- Operation: DELETE
-- Target roles: authenticated
-- Policy definition: (bucket_id = 'product_suggestions')

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Verify the table was created successfully
SELECT 
  'Product Suggestions Table Status:' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_suggestions') 
    THEN '✅ Table created successfully'
    ELSE '❌ Table creation failed'
  END as result;

-- Show the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'product_suggestions' 
ORDER BY ordinal_position;

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

-- Check policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'product_suggestions';

-- =====================================================
-- 7. SAMPLE DATA (Optional)
-- =====================================================

-- Insert a sample product suggestion (uncomment if needed)
/*
INSERT INTO public.product_suggestions (
  title,
  description,
  target_marketplaces,
  competitors,
  priority,
  estimated_cost,
  expected_timeline,
  research_notes,
  product_url,
  status
) VALUES (
  'Smart Fitness Tracker',
  'A wearable device that tracks fitness metrics and provides health insights',
  ARRAY['Amazon', 'Flipkart'],
  ARRAY['Competitor A', 'Competitor B'],
  'high',
  '$25,000',
  '4-6 months',
  'Market research shows high demand for affordable fitness trackers',
  'https://amazon.in/dp/B08R41GK95',
  'In Research'
);
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- 
-- Next steps:
-- 1. Create the 'product_suggestions' storage bucket in Supabase Dashboard
-- 2. Configure storage bucket policies as mentioned above
-- 3. Test the image upload functionality in the application
-- 4. Verify that images are accessible via public URLs
--
