-- =====================================================
-- FIX BRANDS TABLE ISSUE
-- =====================================================
-- This script ensures the brands table exists and has proper RLS policies

-- Check if brands table exists, if not create it
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for brands (only if not already enabled)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'brands' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Brands are viewable by authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Brands are insertable by authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Brands are updatable by authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Brands are deletable by authenticated users" ON public.brands;

-- Create RLS Policies for brands
CREATE POLICY "Brands are viewable by authenticated users" ON public.brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Brands are insertable by authenticated users" ON public.brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Brands are updatable by authenticated users" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Brands are deletable by authenticated users" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON public.brands(is_active);

-- Insert sample brand data if table is empty
INSERT INTO public.brands (name, description, is_active) 
SELECT 'SCOTT INTERNATIONAL', 'Premium clothing and accessories brand', true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'SCOTT INTERNATIONAL');

INSERT INTO public.brands (name, description, is_active) 
SELECT 'NIKE', 'Global sports and athletic wear brand', true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'NIKE');

INSERT INTO public.brands (name, description, is_active) 
SELECT 'ADIDAS', 'International sportswear manufacturer', true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'ADIDAS');

INSERT INTO public.brands (name, description, is_active) 
SELECT 'PUMA', 'German multinational corporation', true
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'PUMA');

-- Grant necessary permissions
GRANT ALL ON public.brands TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
