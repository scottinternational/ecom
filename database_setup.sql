-- Complete Database Setup Script for Product Voyage Control
-- This script sets up all tables, enums, functions, triggers, and RLS policies

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff', 'viewer');
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'discontinued', 'out_of_stock');
CREATE TYPE public.campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');
CREATE TYPE public.production_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  status product_status NOT NULL DEFAULT 'draft',
  images TEXT[],
  specifications JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory table
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

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create production batches table
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

-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT,
  budget DECIMAL(10,2),
  status campaign_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  metrics JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product reviews table
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

-- Create product suggestions table for R&D
CREATE TABLE public.product_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_marketplaces TEXT[] NOT NULL DEFAULT '{}',
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_cost TEXT,
  expected_timeline TEXT,
  research_notes TEXT,
  product_url TEXT,
  product_images TEXT[],
  status TEXT NOT NULL DEFAULT 'In Research',
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suggestions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'manager')
  )
$$;

-- Create a function to promote a user to admin role
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(_user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get user ID from profiles table
  SELECT id INTO _user_id 
  FROM public.profiles 
  WHERE email = _user_email;
  
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Remove existing roles for this user
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Add admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin');
  
  RETURN true;
END;
$$;

-- Create a function to assign roles to users
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is admin
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;
  
  -- Remove existing role for this user
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Add new role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role);
  
  RETURN true;
END;
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can create user profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all user roles" ON public.user_roles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for categories (admins and managers can manage, all can view)
CREATE POLICY "Everyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for suppliers (admins and managers can manage, all can view)
CREATE POLICY "Everyone can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for products (all authenticated users can view, admins/managers can manage)
CREATE POLICY "Everyone can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage products" ON public.products FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for inventory (all authenticated users can view, admins/managers can manage)
CREATE POLICY "Everyone can view inventory" ON public.inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage inventory" ON public.inventory FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for orders (all authenticated users can view and manage)
CREATE POLICY "Everyone can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'staff'));

-- RLS Policies for order_items (inherit from orders)
CREATE POLICY "Everyone can view order items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage order items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'staff'));

-- RLS Policies for production_batches
CREATE POLICY "Everyone can view production batches" ON public.production_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage production batches" ON public.production_batches FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for marketing_campaigns
CREATE POLICY "Everyone can view marketing campaigns" ON public.marketing_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage marketing campaigns" ON public.marketing_campaigns FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for product_reviews
CREATE POLICY "Everyone can view approved reviews" ON public.product_reviews FOR SELECT TO authenticated USING (is_approved = true);
CREATE POLICY "Admins and managers can view all reviews" ON public.product_reviews FOR SELECT TO authenticated USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can manage reviews" ON public.product_reviews FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for product_suggestions
CREATE POLICY "Everyone can view product suggestions" ON public.product_suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and managers can manage product suggestions" ON public.product_suggestions FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON public.product_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_suggestions_updated_at BEFORE UPDATE ON public.product_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO public.categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports & Outdoors', 'Sports equipment and outdoor gear');

-- Insert sample suppliers
INSERT INTO public.suppliers (name, contact_email, contact_phone, address) VALUES 
('TechCorp Inc.', 'contact@techcorp.com', '+1-555-0101', '123 Tech Street, Silicon Valley, CA'),
('Fashion Forward Ltd.', 'info@fashionforward.com', '+1-555-0102', '456 Fashion Ave, New York, NY'),
('Home Essentials Co.', 'sales@homeessentials.com', '+1-555-0103', '789 Home Lane, Chicago, IL');
