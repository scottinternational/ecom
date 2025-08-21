-- Marketplaces Schema
-- This table stores marketplace information similar to brands

-- Create marketplaces table
CREATE TABLE IF NOT EXISTS public.marketplaces (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace_integrations table for API settings
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
  id BIGSERIAL PRIMARY KEY,
  marketplace_id BIGINT NOT NULL REFERENCES public.marketplaces(id) ON DELETE CASCADE,
  api_key TEXT,
  api_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  seller_id TEXT,
  store_url TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'disconnected', -- 'connected', 'disconnected', 'pending', 'error'
  sync_frequency TEXT NOT NULL DEFAULT 'daily', -- 'hourly', 'daily', 'weekly', 'manual'
  settings JSONB DEFAULT '{
    "auto_sync": false,
    "sync_orders": true,
    "sync_inventory": true,
    "sync_pricing": true,
    "webhook_url": "",
    "notification_email": ""
  }',
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(marketplace_id)
);

-- Create marketplace_sync_logs table for tracking sync operations
CREATE TABLE IF NOT EXISTS public.marketplace_sync_logs (
  id BIGSERIAL PRIMARY KEY,
  marketplace_id BIGINT NOT NULL REFERENCES public.marketplaces(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'orders', 'inventory', 'pricing', 'full'
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  records_processed INTEGER DEFAULT 0,
  records_succeeded INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplaces_name ON public.marketplaces(name);
CREATE INDEX IF NOT EXISTS idx_marketplaces_active ON public.marketplaces(is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_marketplace_id ON public.marketplace_integrations(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_status ON public.marketplace_integrations(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_marketplace_id ON public.marketplace_sync_logs(marketplace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_status ON public.marketplace_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_created_at ON public.marketplace_sync_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.marketplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplaces
CREATE POLICY "Users can view marketplaces" ON public.marketplaces
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage marketplaces" ON public.marketplaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON ur.user_id = p.id
      WHERE ur.role = 'admin' AND p.id = auth.uid()
    )
  );

-- Create RLS policies for marketplace_integrations
CREATE POLICY "Users can view marketplace integrations" ON public.marketplace_integrations
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage marketplace integrations" ON public.marketplace_integrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON ur.user_id = p.id
      WHERE ur.role = 'admin' AND p.id = auth.uid()
    )
  );

-- Create RLS policies for marketplace_sync_logs
CREATE POLICY "Users can view sync logs" ON public.marketplace_sync_logs
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage sync logs" ON public.marketplace_sync_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON ur.user_id = p.id
      WHERE ur.role = 'admin' AND p.id = auth.uid()
    )
  );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_marketplaces_updated_at 
  BEFORE UPDATE ON public.marketplaces 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_integrations_updated_at 
  BEFORE UPDATE ON public.marketplace_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default marketplaces
INSERT INTO public.marketplaces (name, display_name, logo_url, is_active) VALUES
  ('amazon', 'Amazon', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', true),
  ('flipkart', 'Flipkart', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Flipkart_logo.svg', true),
  ('myntra', 'Myntra', 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Myntra_logo.svg', true),
  ('ajio', 'Ajio', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Ajio_logo.svg', true),
  ('meesho', 'Meesho', 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Meesho_logo.svg', true),
  ('unicommerce', 'Unicommerce', 'https://unicommerce.com/wp-content/uploads/2023/03/unicommerce-logo.svg', true)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_sync_logs TO authenticated;
