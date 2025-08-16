-- Add Product Suggestions Table and Related Components
-- This script only adds the missing product_suggestions functionality

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
