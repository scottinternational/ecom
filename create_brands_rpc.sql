-- =====================================================
-- CREATE BRANDS RPC FUNCTION
-- =====================================================

-- Create a function to get brands count
CREATE OR REPLACE FUNCTION get_brands_count()
RETURNS TABLE (
  id bigint,
  brand text,
  logo text,
  created_at timestamptz
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, brand, logo, created_at FROM public.brands ORDER BY brand;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_brands_count() TO authenticated;

-- Test the function
SELECT * FROM get_brands_count();
