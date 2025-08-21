-- Marketplace Settings Schema
-- This table stores all marketplace integration settings and configurations

-- Create marketplace_settings table
CREATE TABLE IF NOT EXISTS public.marketplace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Global settings
  global_settings JSONB NOT NULL DEFAULT '{
    "default_sync_frequency": "daily",
    "auto_sync_enabled": false,
    "notification_enabled": true,
    "notification_email": "",
    "webhook_endpoint": ""
  }',
  
  -- Marketplace integrations
  integrations JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure only one settings record exists
  CONSTRAINT unique_marketplace_settings UNIQUE (id)
);

-- Create marketplace_sync_logs table for tracking sync operations
CREATE TABLE IF NOT EXISTS public.marketplace_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_name TEXT NOT NULL,
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

-- Create marketplace_webhooks table for webhook configurations
CREATE TABLE IF NOT EXISTS public.marketplace_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_name TEXT NOT NULL,
  webhook_type TEXT NOT NULL, -- 'orders', 'inventory', 'pricing', 'all'
  webhook_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  secret_key TEXT,
  headers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace_api_credentials table for secure credential storage
CREATE TABLE IF NOT EXISTS public.marketplace_api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace_name TEXT NOT NULL UNIQUE,
  api_key TEXT,
  api_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  seller_id TEXT,
  store_url TEXT,
  is_encrypted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_marketplace ON public.marketplace_sync_logs(marketplace_name);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_status ON public.marketplace_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_logs_created_at ON public.marketplace_sync_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_webhooks_marketplace ON public.marketplace_webhooks(marketplace_name);
CREATE INDEX IF NOT EXISTS idx_marketplace_webhooks_active ON public.marketplace_webhooks(is_active);

-- Enable Row Level Security
ALTER TABLE public.marketplace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_api_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for marketplace_settings
CREATE POLICY "Users can view marketplace settings" ON public.marketplace_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage marketplace settings" ON public.marketplace_settings
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

-- Create RLS policies for marketplace_webhooks
CREATE POLICY "Users can view webhooks" ON public.marketplace_webhooks
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage webhooks" ON public.marketplace_webhooks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.profiles p ON ur.user_id = p.id
      WHERE ur.role = 'admin' AND p.id = auth.uid()
    )
  );

-- Create RLS policies for marketplace_api_credentials
CREATE POLICY "Admin users can manage API credentials" ON public.marketplace_api_credentials
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
CREATE TRIGGER update_marketplace_settings_updated_at 
  BEFORE UPDATE ON public.marketplace_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_webhooks_updated_at 
  BEFORE UPDATE ON public.marketplace_webhooks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_api_credentials_updated_at 
  BEFORE UPDATE ON public.marketplace_api_credentials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default marketplace settings
INSERT INTO public.marketplace_settings (global_settings, integrations) 
VALUES (
  '{
    "default_sync_frequency": "daily",
    "auto_sync_enabled": false,
    "notification_enabled": true,
    "notification_email": "",
    "webhook_endpoint": ""
  }',
  '[
    {
      "id": "amazon",
      "name": "amazon",
      "display_name": "Amazon",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      "is_active": false,
      "status": "disconnected",
      "sync_frequency": "daily",
      "settings": {
        "auto_sync": false,
        "sync_orders": true,
        "sync_inventory": true,
        "sync_pricing": true,
        "webhook_url": "",
        "notification_email": ""
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "flipkart",
      "name": "flipkart",
      "display_name": "Flipkart",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/24/Flipkart_logo.svg",
      "is_active": false,
      "status": "disconnected",
      "sync_frequency": "daily",
      "settings": {
        "auto_sync": false,
        "sync_orders": true,
        "sync_inventory": true,
        "sync_pricing": true,
        "webhook_url": "",
        "notification_email": ""
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "myntra",
      "name": "myntra",
      "display_name": "Myntra",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Myntra_logo.svg",
      "is_active": false,
      "status": "disconnected",
      "sync_frequency": "daily",
      "settings": {
        "auto_sync": false,
        "sync_orders": true,
        "sync_inventory": true,
        "sync_pricing": true,
        "webhook_url": "",
        "notification_email": ""
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "ajio",
      "name": "ajio",
      "display_name": "Ajio",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Ajio_logo.svg",
      "is_active": false,
      "status": "disconnected",
      "sync_frequency": "daily",
      "settings": {
        "auto_sync": false,
        "sync_orders": true,
        "sync_inventory": true,
        "sync_pricing": true,
        "webhook_url": "",
        "notification_email": ""
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    {
      "id": "meesho",
      "name": "meesho",
      "display_name": "Meesho",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Meesho_logo.svg",
      "is_active": false,
      "status": "disconnected",
      "sync_frequency": "daily",
      "settings": {
        "auto_sync": false,
        "sync_orders": true,
        "sync_inventory": true,
        "sync_pricing": true,
        "webhook_url": "",
        "notification_email": ""
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ]'
) ON CONFLICT (id) DO NOTHING;

-- Create a function to get marketplace settings
CREATE OR REPLACE FUNCTION get_marketplace_settings()
RETURNS JSONB AS $$
DECLARE
  settings JSONB;
BEGIN
  SELECT global_settings, integrations INTO settings
  FROM public.marketplace_settings
  LIMIT 1;
  
  RETURN settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update marketplace settings
CREATE OR REPLACE FUNCTION update_marketplace_settings(
  new_global_settings JSONB DEFAULT NULL,
  new_integrations JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.marketplace_settings
  SET 
    global_settings = COALESCE(new_global_settings, global_settings),
    integrations = COALESCE(new_integrations, integrations),
    updated_at = now()
  WHERE id = (SELECT id FROM public.marketplace_settings LIMIT 1);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_sync_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_webhooks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_api_credentials TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_marketplace_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION update_marketplace_settings(JSONB, JSONB) TO authenticated;
