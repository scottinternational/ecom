-- =====================================================
-- FINAL PRODUCT SUGGESTIONS TABLE SCHEMA
-- =====================================================
-- This script creates/updates the complete product_suggestions table with all required fields
-- including target_price, proposed_selling_price, and procurement fields

-- Create product_suggestions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_marketplaces TEXT[] NOT NULL DEFAULT '{}',
  competitors TEXT[] DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium',
  target_price DECIMAL(10,2),
  proposed_selling_price DECIMAL(10,2),
  expected_timeline TEXT,
  research_notes TEXT,
  product_url TEXT,
  product_images TEXT[],
  status TEXT NOT NULL DEFAULT 'In Research',
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Procurement fields
  supplier_name TEXT,
  supplier_address TEXT,
  supplier_city TEXT,
  supplier_state TEXT,
  supplier_pincode TEXT,
  cost_price DECIMAL(10,2),
  gst_rate INTEGER,
  lead_time_days INTEGER,
  counter_sample_images TEXT[],
  procurement_notes TEXT
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE public.product_suggestions
ADD COLUMN IF NOT EXISTS target_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS proposed_selling_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS competitors TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS supplier_name TEXT,
ADD COLUMN IF NOT EXISTS supplier_address TEXT,
ADD COLUMN IF NOT EXISTS supplier_city TEXT,
ADD COLUMN IF NOT EXISTS supplier_state TEXT,
ADD COLUMN IF NOT EXISTS supplier_pincode TEXT,
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_rate INTEGER,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS counter_sample_images TEXT[],
ADD COLUMN IF NOT EXISTS procurement_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.product_suggestions.target_price IS 'Target selling price for the product in INR';
COMMENT ON COLUMN public.product_suggestions.proposed_selling_price IS 'Proposed selling price for the product in INR';
COMMENT ON COLUMN public.product_suggestions.competitors IS 'Array of competitor names';
COMMENT ON COLUMN public.product_suggestions.supplier_name IS 'Name of the supplier for this product';
COMMENT ON COLUMN public.product_suggestions.supplier_address IS 'Complete address of the supplier';
COMMENT ON COLUMN public.product_suggestions.supplier_city IS 'City of the supplier';
COMMENT ON COLUMN public.product_suggestions.supplier_state IS 'State of the supplier';
COMMENT ON COLUMN public.product_suggestions.supplier_pincode IS 'Pincode of the supplier';
COMMENT ON COLUMN public.product_suggestions.cost_price IS 'Cost price in INR';
COMMENT ON COLUMN public.product_suggestions.gst_rate IS 'GST rate percentage (0, 5, 12, 18, 28)';
COMMENT ON COLUMN public.product_suggestions.lead_time_days IS 'Lead time in days for sample production';
COMMENT ON COLUMN public.product_suggestions.counter_sample_images IS 'Array of URLs for counter sample images stored in Supabase storage';
COMMENT ON COLUMN public.product_suggestions.procurement_notes IS 'Rich text notes from procurement team with formatting, images, and detailed information';

-- Create or update the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_product_suggestions_updated_at ON public.product_suggestions;
CREATE TRIGGER update_product_suggestions_updated_at
    BEFORE UPDATE ON public.product_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.product_suggestions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view product suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Authenticated users can create product suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Users can update their own suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Admins and managers can manage all suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Users can delete their own suggestions" ON public.product_suggestions;
DROP POLICY IF EXISTS "Users can read procurement details" ON public.product_suggestions;
DROP POLICY IF EXISTS "Users can update procurement details" ON public.product_suggestions;

-- Create RLS policies
CREATE POLICY "Everyone can view product suggestions" ON public.product_suggestions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create product suggestions" ON public.product_suggestions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own suggestions" ON public.product_suggestions
FOR UPDATE TO authenticated USING (auth.uid() = submitted_by);

CREATE POLICY "Admins and managers can manage all suggestions" ON public.product_suggestions
FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete their own suggestions" ON public.product_suggestions
FOR DELETE TO authenticated USING (auth.uid() = submitted_by);

CREATE POLICY "Users can read procurement details" ON public.product_suggestions
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update procurement details" ON public.product_suggestions
FOR UPDATE TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Create storage bucket for product suggestions if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product_suggestions',
  'product_suggestions',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove all existing storage policies
DROP POLICY IF EXISTS "Allow all operations for product_suggestions" ON storage.objects;

-- Create new permissive storage policy
CREATE POLICY "Allow all operations for product_suggestions" ON storage.objects
FOR ALL USING (bucket_id = 'product_suggestions');

-- Verify the table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'product_suggestions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show final status
SELECT 'Product suggestions table schema updated successfully!' as status;
