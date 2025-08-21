-- Marketplaces Schema - Fixed Version
-- This script handles existing tables and ensures all required columns exist

-- First, let's check if the marketplaces table exists and what columns it has
DO $$
BEGIN
    -- Create marketplaces table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplaces') THEN
        CREATE TABLE public.marketplaces (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            logo_url TEXT,
            is_active BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    ELSE
        -- Add missing columns if table exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'name') THEN
            ALTER TABLE public.marketplaces ADD COLUMN name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'display_name') THEN
            ALTER TABLE public.marketplaces ADD COLUMN display_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'logo_url') THEN
            ALTER TABLE public.marketplaces ADD COLUMN logo_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'is_active') THEN
            ALTER TABLE public.marketplaces ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'created_at') THEN
            ALTER TABLE public.marketplaces ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplaces' AND column_name = 'updated_at') THEN
            ALTER TABLE public.marketplaces ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        END IF;
        
        -- Add constraints if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_name = 'marketplaces' AND constraint_name = 'marketplaces_name_key') THEN
            ALTER TABLE public.marketplaces ADD CONSTRAINT marketplaces_name_key UNIQUE (name);
        END IF;
    END IF;
END $$;

-- Create marketplace_integrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
    id BIGSERIAL PRIMARY KEY,
    marketplace_id BIGINT NOT NULL,
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

-- Add missing columns to marketplace_integrations if table exists but is missing columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_integrations') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'marketplace_id') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN marketplace_id BIGINT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_key') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN api_key TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'api_secret') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN api_secret TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'access_token') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN access_token TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'refresh_token') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN refresh_token TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'token_expires_at') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN token_expires_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'seller_id') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN seller_id TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'store_url') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN store_url TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'is_connected') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN is_connected BOOLEAN NOT NULL DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'status') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN status TEXT NOT NULL DEFAULT 'disconnected';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'sync_frequency') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN sync_frequency TEXT NOT NULL DEFAULT 'daily';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'settings') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN settings JSONB DEFAULT '{"auto_sync": false, "sync_orders": true, "sync_inventory": true, "sync_pricing": true, "webhook_url": "", "notification_email": ""}';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'last_sync') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN last_sync TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'created_at') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_integrations' AND column_name = 'updated_at') THEN
            ALTER TABLE public.marketplace_integrations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        END IF;
        
        -- Add unique constraint if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_name = 'marketplace_integrations' AND constraint_name = 'marketplace_integrations_marketplace_id_key') THEN
            ALTER TABLE public.marketplace_integrations ADD CONSTRAINT marketplace_integrations_marketplace_id_key UNIQUE (marketplace_id);
        END IF;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'marketplace_integrations' 
        AND constraint_name = 'marketplace_integrations_marketplace_id_fkey'
    ) THEN
        ALTER TABLE public.marketplace_integrations 
        ADD CONSTRAINT marketplace_integrations_marketplace_id_fkey 
        FOREIGN KEY (marketplace_id) REFERENCES public.marketplaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create marketplace_sync_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.marketplace_sync_logs (
    id BIGSERIAL PRIMARY KEY,
    marketplace_id BIGINT NOT NULL,
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

-- Add missing columns to marketplace_sync_logs if table exists but is missing columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_sync_logs') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'marketplace_id') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN marketplace_id BIGINT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'sync_type') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN sync_type TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'status') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN status TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'started_at') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'completed_at') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'records_processed') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN records_processed INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'records_succeeded') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN records_succeeded INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'records_failed') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN records_failed INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'error_message') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN error_message TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'metadata') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN metadata JSONB DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'marketplace_sync_logs' AND column_name = 'created_at') THEN
            ALTER TABLE public.marketplace_sync_logs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
        END IF;
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'marketplace_sync_logs' 
        AND constraint_name = 'marketplace_sync_logs_marketplace_id_fkey'
    ) THEN
        ALTER TABLE public.marketplace_sync_logs 
        ADD CONSTRAINT marketplace_sync_logs_marketplace_id_fkey 
        FOREIGN KEY (marketplace_id) REFERENCES public.marketplaces(id) ON DELETE CASCADE;
    END IF;
END $$;

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

-- Create RLS policies for marketplaces (drop if exists first)
DROP POLICY IF EXISTS "Users can view marketplaces" ON public.marketplaces;
CREATE POLICY "Users can view marketplaces" ON public.marketplaces
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin users can manage marketplaces" ON public.marketplaces;
CREATE POLICY "Admin users can manage marketplaces" ON public.marketplaces
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.profiles p ON ur.user_id = p.id
            WHERE ur.role = 'admin' AND p.id = auth.uid()
        )
    );

-- Create RLS policies for marketplace_integrations
DROP POLICY IF EXISTS "Users can view marketplace integrations" ON public.marketplace_integrations;
CREATE POLICY "Users can view marketplace integrations" ON public.marketplace_integrations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin users can manage marketplace integrations" ON public.marketplace_integrations;
CREATE POLICY "Admin users can manage marketplace integrations" ON public.marketplace_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.profiles p ON ur.user_id = p.id
            WHERE ur.role = 'admin' AND p.id = auth.uid()
        )
    );

-- Create RLS policies for marketplace_sync_logs
DROP POLICY IF EXISTS "Users can view sync logs" ON public.marketplace_sync_logs;
CREATE POLICY "Users can view sync logs" ON public.marketplace_sync_logs
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin users can manage sync logs" ON public.marketplace_sync_logs;
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
DROP TRIGGER IF EXISTS update_marketplaces_updated_at ON public.marketplaces;
CREATE TRIGGER update_marketplaces_updated_at 
    BEFORE UPDATE ON public.marketplaces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_integrations_updated_at ON public.marketplace_integrations;
CREATE TRIGGER update_marketplace_integrations_updated_at 
    BEFORE UPDATE ON public.marketplace_integrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default marketplaces (only if they don't exist)
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

-- Create channel_sku_mappings table for mapping channel SKUs to master SKUs
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_sku_mappings') THEN
        CREATE TABLE public.channel_sku_mappings (
            id BIGSERIAL PRIMARY KEY,
            channel_sku VARCHAR(255) NOT NULL,
            channel_name VARCHAR(100) NOT NULL,
            master_sku VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Add missing columns to channel_sku_mappings if table exists but is missing columns
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_sku_mappings') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'channel_sku_mappings' AND column_name = 'channel_sku') THEN
            ALTER TABLE public.channel_sku_mappings ADD COLUMN channel_sku VARCHAR(255) NOT NULL;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'channel_sku_mappings' AND column_name = 'channel_name') THEN
            ALTER TABLE public.channel_sku_mappings ADD COLUMN channel_name VARCHAR(100) NOT NULL;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'channel_sku_mappings' AND column_name = 'master_sku') THEN
            ALTER TABLE public.channel_sku_mappings ADD COLUMN master_sku VARCHAR(255) NOT NULL;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'channel_sku_mappings' AND column_name = 'status') THEN
            ALTER TABLE public.channel_sku_mappings ADD COLUMN status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive'));
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'channel_sku_mappings' AND column_name = 'created_at') THEN
            ALTER TABLE public.channel_sku_mappings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'channel_sku_mappings' AND column_name = 'updated_at') THEN
            ALTER TABLE public.channel_sku_mappings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_sku_mappings') THEN
        IF NOT EXISTS (SELECT FROM information_schema.table_constraints WHERE table_name = 'channel_sku_mappings' AND constraint_name = 'channel_sku_mappings_channel_sku_channel_name_unique') THEN
            ALTER TABLE public.channel_sku_mappings ADD CONSTRAINT channel_sku_mappings_channel_sku_channel_name_unique UNIQUE (channel_sku, channel_name);
        END IF;
    END IF;
END $$;

-- Add indexes if they don't exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_sku_mappings') THEN
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'channel_sku_mappings' AND indexname = 'idx_channel_sku_mappings_channel_name') THEN
            CREATE INDEX idx_channel_sku_mappings_channel_name ON public.channel_sku_mappings (channel_name);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'channel_sku_mappings' AND indexname = 'idx_channel_sku_mappings_master_sku') THEN
            CREATE INDEX idx_channel_sku_mappings_master_sku ON public.channel_sku_mappings (master_sku);
        END IF;
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'channel_sku_mappings' AND indexname = 'idx_channel_sku_mappings_status') THEN
            CREATE INDEX idx_channel_sku_mappings_status ON public.channel_sku_mappings (status);
        END IF;
    END IF;
END $$;

-- Add RLS policies for channel_sku_mappings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_sku_mappings') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.channel_sku_mappings;
        DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.channel_sku_mappings;
        DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.channel_sku_mappings;
        DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.channel_sku_mappings;
        
        -- Enable RLS
        ALTER TABLE public.channel_sku_mappings ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Enable read access for authenticated users" ON public.channel_sku_mappings
            FOR SELECT USING (auth.role() = 'authenticated');
            
        CREATE POLICY "Enable insert access for authenticated users" ON public.channel_sku_mappings
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
            
        CREATE POLICY "Enable update access for authenticated users" ON public.channel_sku_mappings
            FOR UPDATE USING (auth.role() = 'authenticated');
            
        CREATE POLICY "Enable delete access for authenticated users" ON public.channel_sku_mappings
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Add updated_at trigger for channel_sku_mappings
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'channel_sku_mappings') THEN
        -- Drop existing trigger if it exists
        DROP TRIGGER IF EXISTS update_channel_sku_mappings_updated_at ON public.channel_sku_mappings;
        
        -- Create trigger function if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $func$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $func$ language 'plpgsql';
        END IF;
        
        -- Create trigger
        CREATE TRIGGER update_channel_sku_mappings_updated_at
            BEFORE UPDATE ON public.channel_sku_mappings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
