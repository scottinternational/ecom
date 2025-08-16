-- =====================================================
-- ADD PROCUREMENT NOTES COLUMN
-- =====================================================
-- This script adds a procurement_notes column to store rich text content
-- from the procurement team

-- Add procurement_notes column to store rich text content
ALTER TABLE public.product_suggestions
ADD COLUMN IF NOT EXISTS procurement_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.product_suggestions.procurement_notes IS 'Rich text notes from procurement team with formatting, images, and detailed information';

-- Update the updated_at trigger to include new column
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

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'product_suggestions'
AND table_schema = 'public'
AND column_name = 'procurement_notes';

SELECT 'Procurement notes column added successfully!' as status;
