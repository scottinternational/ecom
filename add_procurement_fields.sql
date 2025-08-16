-- Add procurement fields to product_suggestions table
-- This script adds supplier details, cost information, and counter sample images

-- Add supplier details columns
ALTER TABLE public.product_suggestions 
ADD COLUMN IF NOT EXISTS supplier_name TEXT,
ADD COLUMN IF NOT EXISTS supplier_address TEXT,
ADD COLUMN IF NOT EXISTS supplier_city TEXT,
ADD COLUMN IF NOT EXISTS supplier_state TEXT,
ADD COLUMN IF NOT EXISTS supplier_pincode TEXT;

-- Add procurement details columns
ALTER TABLE public.product_suggestions 
ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_rate INTEGER,
ADD COLUMN IF NOT EXISTS lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS counter_sample_images TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN public.product_suggestions.supplier_name IS 'Name of the supplier for this product';
COMMENT ON COLUMN public.product_suggestions.supplier_address IS 'Complete address of the supplier';
COMMENT ON COLUMN public.product_suggestions.supplier_city IS 'City of the supplier';
COMMENT ON COLUMN public.product_suggestions.supplier_state IS 'State of the supplier';
COMMENT ON COLUMN public.product_suggestions.supplier_pincode IS 'Pincode of the supplier';
COMMENT ON COLUMN public.product_suggestions.cost_price IS 'Cost price in INR';
COMMENT ON COLUMN public.product_suggestions.gst_rate IS 'GST rate percentage (0, 5, 12, 18, 28)';
COMMENT ON COLUMN public.product_suggestions.lead_time_days IS 'Lead time in days for sample production';
COMMENT ON COLUMN public.product_suggestions.counter_sample_images IS 'Array of URLs for counter sample images stored in Supabase storage';

-- Update the updated_at trigger to include new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_product_suggestions_updated_at ON public.product_suggestions;
CREATE TRIGGER update_product_suggestions_updated_at
    BEFORE UPDATE ON public.product_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for the new columns (if RLS is enabled)
-- These policies ensure users can read and update procurement details
DO $$
BEGIN
    -- Policy for reading procurement details
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_suggestions' 
        AND policyname = 'Users can read procurement details'
    ) THEN
        CREATE POLICY "Users can read procurement details" ON public.product_suggestions
        FOR SELECT USING (true);
    END IF;

    -- Policy for updating procurement details
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_suggestions' 
        AND policyname = 'Users can update procurement details'
    ) THEN
        CREATE POLICY "Users can update procurement details" ON public.product_suggestions
        FOR UPDATE USING (true);
    END IF;
END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'product_suggestions' 
AND table_schema = 'public'
AND column_name IN (
    'supplier_name', 'supplier_address', 'supplier_city', 'supplier_state', 'supplier_pincode',
    'cost_price', 'gst_rate', 'lead_time_days', 'counter_sample_images'
)
ORDER BY column_name;
