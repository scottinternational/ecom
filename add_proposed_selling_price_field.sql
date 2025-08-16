-- =====================================================
-- ADD PROPOSED SELLING PRICE FIELD TO PRODUCT SUGGESTIONS
-- =====================================================
-- This script adds a proposed_selling_price column to store the proposed selling price
-- for the product suggestion

-- Add proposed_selling_price column to store proposed selling price
ALTER TABLE public.product_suggestions
ADD COLUMN IF NOT EXISTS proposed_selling_price DECIMAL(10,2);

-- Add comment for documentation
COMMENT ON COLUMN public.product_suggestions.proposed_selling_price IS 'Proposed selling price for the product in INR';

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
AND column_name = 'proposed_selling_price';

SELECT 'Proposed selling price column added successfully!' as status;
