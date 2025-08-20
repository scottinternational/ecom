-- =====================================================
-- NEW PRODUCTS SCHEMA WITH BRANDS TABLE
-- =====================================================
-- This script drops the existing products table and creates new tables
-- with the structure based on the provided image

-- Drop existing tables that depend on products
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.production_batches CASCADE;
DROP TABLE IF EXISTS public.product_reviews CASCADE;

-- Drop the existing products table
DROP TABLE IF EXISTS public.products CASCADE;

-- Create brands table
CREATE TABLE public.brands (
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

-- Create new products table with the structure from the image
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  color TEXT,
  size TEXT,
  category TEXT,
  description TEXT,
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  status product_status NOT NULL DEFAULT 'draft',
  images TEXT[],
  specifications JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table (recreated for new products table)
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  warehouse_location TEXT,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

-- Create order items table (recreated for new products table)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create production batches table (recreated for new products table)
CREATE TABLE public.production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  planned_quantity INTEGER NOT NULL,
  actual_quantity INTEGER DEFAULT 0,
  status production_status NOT NULL DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product reviews table (recreated for new products table)
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for brands
CREATE POLICY "Brands are viewable by authenticated users" ON public.brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Brands are insertable by authenticated users" ON public.brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Brands are updatable by authenticated users" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Brands are deletable by authenticated users" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for products
CREATE POLICY "Products are viewable by authenticated users" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Products are insertable by authenticated users" ON public.products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Products are updatable by authenticated users" ON public.products
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Products are deletable by authenticated users" ON public.products
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for inventory
CREATE POLICY "Inventory is viewable by authenticated users" ON public.inventory
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory is insertable by authenticated users" ON public.inventory
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Inventory is updatable by authenticated users" ON public.inventory
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory is deletable by authenticated users" ON public.inventory
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for order_items
CREATE POLICY "Order items are viewable by authenticated users" ON public.order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Order items are insertable by authenticated users" ON public.order_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Order items are updatable by authenticated users" ON public.order_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Order items are deletable by authenticated users" ON public.order_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for production_batches
CREATE POLICY "Production batches are viewable by authenticated users" ON public.production_batches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Production batches are insertable by authenticated users" ON public.production_batches
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Production batches are updatable by authenticated users" ON public.production_batches
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Production batches are deletable by authenticated users" ON public.production_batches
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS Policies for product_reviews
CREATE POLICY "Product reviews are viewable by authenticated users" ON public.product_reviews
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Product reviews are insertable by authenticated users" ON public.product_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Product reviews are updatable by authenticated users" ON public.product_reviews
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Product reviews are deletable by authenticated users" ON public.product_reviews
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample brand data
INSERT INTO public.brands (name, description, is_active) VALUES
  ('SCOTT INTERNATIONAL', 'Premium clothing and accessories brand', true),
  ('NIKE', 'Global sports and athletic wear brand', true),
  ('ADIDAS', 'International sportswear manufacturer', true),
  ('PUMA', 'German multinational corporation', true);

-- Insert sample product data based on the image
INSERT INTO public.products (sku, brand_id, product_name, color, size, category) VALUES
  ('THW-N-FS-BL-L', (SELECT id FROM public.brands WHERE name = 'SCOTT INTERNATIONAL'), 'SCOTT - THERMO FULL SLEEVE', 'BLACK', 'L', 'JACKETS'),
  ('THW-N-FS-BL-XL', (SELECT id FROM public.brands WHERE name = 'SCOTT INTERNATIONAL'), 'SCOTT - THERMO FULL SLEEVE', 'BLACK', 'XL', 'JACKETS');

-- Create indexes for better performance
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_brands_name ON public.brands(name);
CREATE INDEX idx_brands_is_active ON public.brands(is_active);
