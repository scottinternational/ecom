-- =====================================================
-- FIX COUNTER SAMPLE IMAGES DATA
-- =====================================================
-- This script fixes the counter_sample_images column data
-- that was stored as objects instead of URLs
-- Note: counter_sample_images is TEXT[] (text array), not JSONB

-- =====================================================
-- 1. CHECK CURRENT DATA
-- =====================================================

-- Check what data we currently have
SELECT 
  id,
  title,
  counter_sample_images,
  array_length(counter_sample_images, 1) as array_length
FROM product_suggestions 
WHERE counter_sample_images IS NOT NULL 
AND array_length(counter_sample_images, 1) > 0
ORDER BY created_at DESC;

-- =====================================================
-- 2. FIX THE DATA - MANUAL APPROACH
-- =====================================================

-- Since we can't easily parse JSON objects in TEXT arrays,
-- we'll manually update the specific record with the correct URLs
-- Replace 'YOUR_RECORD_ID' with the actual record ID from step 1

-- First, let's see the current data to get the record ID
SELECT 
  id,
  title,
  counter_sample_images
FROM product_suggestions 
WHERE counter_sample_images IS NOT NULL 
AND array_length(counter_sample_images, 1) > 0
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- 3. MANUAL FIX (replace YOUR_RECORD_ID with actual ID)
-- =====================================================

-- Update the specific record with the correct URLs
-- Uncomment and replace 'YOUR_RECORD_ID' with the actual ID from step 2

/*
UPDATE product_suggestions 
SET counter_sample_images = ARRAY[
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727725_0_61oCGuSkaJL._SX522_.jpg',
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727726_1_61EX3UaUBeL._SX522_.jpg',
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727726_2_61olI+k0eOL._SX522_.jpg',
  'https://idmbhgegrfohkdfeekgk.supabase.co/storage/v1/object/public/product_suggestions/product_suggestions/1755348727726_3_61l0RC6gvwL._SX522_.jpg'
]
WHERE id = 'YOUR_RECORD_ID';
*/

-- =====================================================
-- 4. ALTERNATIVE: CLEAR AND RE-UPLOAD
-- =====================================================

-- If you want to clear the corrupted data and start fresh:
/*
UPDATE product_suggestions 
SET counter_sample_images = ARRAY[]::TEXT[]
WHERE counter_sample_images IS NOT NULL 
AND array_length(counter_sample_images, 1) > 0;
*/

-- =====================================================
-- 5. VERIFY THE FIX
-- =====================================================

-- Check the fixed data
SELECT 
  id,
  title,
  counter_sample_images,
  array_length(counter_sample_images, 1) as array_length
FROM product_suggestions 
WHERE counter_sample_images IS NOT NULL 
AND array_length(counter_sample_images, 1) > 0
ORDER BY created_at DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Counter sample images data fix script ready!' as status;
