-- =====================================================
-- SIMPLE FIX FOR COUNTER SAMPLE IMAGES
-- =====================================================
-- Using the actual record ID from the console logs

-- Fix the specific record with ID: 6efa17fd-32a3-444b-84cb-9ff11e0499b4
UPDATE product_suggestions 
SET counter_sample_images = ARRAY[
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727725_0_61oCGuSkaJL._SX522_.jpg',
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727726_1_61EX3UaUBeL._SX522_.jpg',
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727726_2_61olI+k0eOL._SX522_.jpg',
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727726_3_61l0RC6gvwL._SX522_.jpg'
]
WHERE id = '6efa17fd-32a3-444b-84cb-9ff11e0499b4';

-- Verify the fix
SELECT 
  id,
  title,
  counter_sample_images
FROM product_suggestions 
WHERE id = '6efa17fd-32a3-444b-84cb-9ff11e0499b4';

SELECT 'Counter sample images fixed!' as status;
