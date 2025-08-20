-- =====================================================
-- CREATE BRANDS TABLE - FIX 400 ERROR
-- =====================================================

-- Step 1: Create the brands table
CREATE TABLE IF NOT EXISTS public.brands (
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

-- Step 2: Enable RLS
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.brands
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON public.brands
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON public.brands
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON public.brands
  FOR DELETE USING (auth.role() = 'authenticated');

-- Step 4: Insert sample data
INSERT INTO public.brands (name, description, is_active) VALUES
  ('SCOTT INTERNATIONAL', 'Premium clothing and accessories brand', true),
  ('NIKE', 'Global sports and athletic wear brand', true),
  ('ADIDAS', 'International sportswear manufacturer', true),
  ('PUMA', 'German multinational corporation', true)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Grant permissions
GRANT ALL ON public.brands TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Verify the table was created
SELECT 'Brands table created successfully' as status;
SELECT COUNT(*) as brand_count FROM public.brands;
