-- =====================================================
-- REMOVE ESTIMATED COST FIELD FROM PRODUCT SUGGESTIONS
-- =====================================================
-- This script removes the estimated_cost column from the product_suggestions table

-- Remove estimated_cost column
ALTER TABLE public.product_suggestions
DROP COLUMN IF EXISTS estimated_cost;

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'product_suggestions'
AND table_schema = 'public'
AND column_name = 'estimated_cost';

SELECT 'Estimated cost column removed successfully!' as status;
