-- =====================================================
-- UPDATE PRODUCTS TABLE STRUCTURE
-- =====================================================

-- 1. First, let's check the current table structure
SELECT 
  'Current table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. Check brands table structure to confirm ID type
SELECT 
  'Brands table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'brands'
ORDER BY ordinal_position;

-- 3. Create a backup of the current data
CREATE TABLE IF NOT EXISTS products_backup AS 
SELECT * FROM products;

-- 4. Drop the existing products table
DROP TABLE IF EXISTS products CASCADE;

-- 5. Create new products table with required fields including the new columns
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku VARCHAR(100) NOT NULL UNIQUE,
  brand_id BIGINT REFERENCES brands(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  description TEXT,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  color VARCHAR(50),
  size VARCHAR(50),
  category VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to view products" ON products
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert products" ON products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update products" ON products
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete products" ON products
FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Create indexes for better performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_cost_price ON products(cost_price);
CREATE INDEX idx_products_selling_price ON products(selling_price);

-- 9. Insert sample data (optional - you can remove this if you don't want sample data)
INSERT INTO products (sku, brand_id, product_name, description, cost_price, selling_price, color, size, category, image_url) VALUES
('SKU001', (SELECT id FROM brands LIMIT 1), 'Classic T-Shirt', 'Premium cotton t-shirt with comfortable fit', 250.00, 450.00, 'Blue', 'M', 'Clothing', 'https://example.com/images/tshirt-blue.jpg'),
('SKU002', (SELECT id FROM brands LIMIT 1), 'Denim Jeans', 'High-quality denim jeans with perfect fit', 800.00, 1200.00, 'Blue', '32', 'Clothing', 'https://example.com/images/jeans-blue.jpg'),
('SKU003', (SELECT id FROM brands LIMIT 1), 'Running Shoes', 'Lightweight running shoes for professional athletes', 1200.00, 2200.00, 'Black', '10', 'Footwear', 'https://example.com/images/shoes-black.jpg'),
('SKU004', (SELECT id FROM brands LIMIT 1), 'Leather Bag', 'Genuine leather bag with multiple compartments', 1500.00, 2800.00, 'Brown', 'Large', 'Accessories', 'https://example.com/images/bag-brown.jpg'),
('SKU005', (SELECT id FROM brands LIMIT 1), 'Wireless Headphones', 'Noise-cancelling wireless headphones with premium sound', 1800.00, 3200.00, 'White', 'One Size', 'Electronics', 'https://example.com/images/headphones-white.jpg');

-- 10. Grant permissions
GRANT ALL ON products TO authenticated;

-- 11. Verify the new table structure
SELECT 
  'New table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- 12. Check the sample data
SELECT 
  'Sample data' as info,
  id,
  sku,
  product_name,
  description,
  cost_price,
  selling_price,
  color,
  size,
  category,
  image_url,
  created_at
FROM products
ORDER BY created_at DESC
LIMIT 5;

-- 13. Check RLS policies
SELECT 
  'RLS policies' as info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'products';
