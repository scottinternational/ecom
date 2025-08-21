import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceIntegration {
  id: string;
  name: string;
  display_name: string;
  logo_url?: string;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  seller_id?: string;
  store_url?: string;
  is_active: boolean;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  last_sync?: string;
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  settings: {
    auto_sync: boolean;
    sync_orders: boolean;
    sync_inventory: boolean;
    sync_pricing: boolean;
    webhook_url?: string;
    notification_email?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MarketplaceSettings {
  global_settings: {
    default_sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
    auto_sync_enabled: boolean;
    notification_enabled: boolean;
    notification_email: string;
    webhook_endpoint?: string;
  };
  integrations: MarketplaceIntegration[];
}

export const useMarketplaceSettings = () => {
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default marketplace configurations
  const defaultMarketplaces = [
    {
      name: 'amazon',
      display_name: 'Amazon',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      is_active: false,
      status: 'disconnected' as const,
      sync_frequency: 'daily' as const,
      settings: {
        auto_sync: false,
        sync_orders: true,
        sync_inventory: true,
        sync_pricing: true,
        webhook_url: '',
        notification_email: ''
      }
    },
    {
      name: 'flipkart',
      display_name: 'Flipkart',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Flipkart_logo.svg',
      is_active: false,
      status: 'disconnected' as const,
      sync_frequency: 'daily' as const,
      settings: {
        auto_sync: false,
        sync_orders: true,
        sync_inventory: true,
        sync_pricing: true,
        webhook_url: '',
        notification_email: ''
      }
    },
    {
      name: 'myntra',
      display_name: 'Myntra',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Myntra_logo.svg',
      is_active: false,
      status: 'disconnected' as const,
      sync_frequency: 'daily' as const,
      settings: {
        auto_sync: false,
        sync_orders: true,
        sync_inventory: true,
        sync_pricing: true,
        webhook_url: '',
        notification_email: ''
      }
    },
    {
      name: 'ajio',
      display_name: 'Ajio',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Ajio_logo.svg',
      is_active: false,
      status: 'disconnected' as const,
      sync_frequency: 'daily' as const,
      settings: {
        auto_sync: false,
        sync_orders: true,
        sync_inventory: true,
        sync_pricing: true,
        webhook_url: '',
        notification_email: ''
      }
    },
    {
      name: 'meesho',
      display_name: 'Meesho',
      logo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Meesho_logo.svg',
      is_active: false,
      status: 'disconnected' as const,
      sync_frequency: 'daily' as const,
      settings: {
        auto_sync: false,
        sync_orders: true,
        sync_inventory: true,
        sync_pricing: true,
        webhook_url: '',
        notification_email: ''
      }
    }
  ];

  // Fetch marketplace settings from database
  const fetchMarketplaceSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, check if marketplace_settings table exists, if not create it
      const { data: settingsData, error: settingsError } = await supabase
        .from('marketplace_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code === 'PGRST116') {
        // Table doesn't exist, create default settings
        const defaultSettings: MarketplaceSettings = {
          global_settings: {
            default_sync_frequency: 'daily',
            auto_sync_enabled: false,
            notification_enabled: true,
            notification_email: '',
            webhook_endpoint: ''
          },
          integrations: defaultMarketplaces.map(mp => ({
            id: mp.name,
            name: mp.name,
            display_name: mp.display_name,
            logo_url: mp.logo_url,
            is_active: mp.is_active,
            status: mp.status,
            sync_frequency: mp.sync_frequency,
            settings: mp.settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        };

        setSettings(defaultSettings);
        return;
      }

      if (settingsError) {
        throw settingsError;
      }

      // If settings exist, use them
      if (settingsData) {
        setSettings(settingsData);
      } else {
        // Create default settings
        const defaultSettings: MarketplaceSettings = {
          global_settings: {
            default_sync_frequency: 'daily',
            auto_sync_enabled: false,
            notification_enabled: true,
            notification_email: '',
            webhook_endpoint: ''
          },
          integrations: defaultMarketplaces.map(mp => ({
            id: mp.name,
            name: mp.name,
            display_name: mp.display_name,
            logo_url: mp.logo_url,
            is_active: mp.is_active,
            status: mp.status,
            sync_frequency: mp.sync_frequency,
            settings: mp.settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
        };

        const { error: insertError } = await supabase
          .from('marketplace_settings')
          .insert([defaultSettings]);

        if (insertError) {
          throw insertError;
        }

        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching marketplace settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch marketplace settings');
    } finally {
      setLoading(false);
    }
  };

  // Update marketplace integration
  const updateMarketplaceIntegration = async (marketplaceName: string, updates: Partial<MarketplaceIntegration>) => {
    try {
      if (!settings) return;

      const updatedIntegrations = settings.integrations.map(integration => 
        integration.name === marketplaceName 
          ? { ...integration, ...updates, updated_at: new Date().toISOString() }
          : integration
      );

      const updatedSettings = {
        ...settings,
        integrations: updatedIntegrations
      };

      const { error } = await supabase
        .from('marketplace_settings')
        .upsert([updatedSettings]);

      if (error) {
        throw error;
      }

      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('Error updating marketplace integration:', err);
      setError(err instanceof Error ? err.message : 'Failed to update marketplace integration');
      return false;
    }
  };

  // Connect to marketplace
  const connectMarketplace = async (marketplaceName: string, credentials: {
    api_key?: string;
    api_secret?: string;
    access_token?: string;
    seller_id?: string;
    store_url?: string;
  }) => {
    try {
      const success = await updateMarketplaceIntegration(marketplaceName, {
        ...credentials,
        is_active: true,
        status: 'connected',
        last_sync: new Date().toISOString()
      });

      if (success) {
        // Here you would typically make an API call to test the connection
        // For now, we'll just simulate a successful connection
        console.log(`Connected to ${marketplaceName}`);
      }

      return success;
    } catch (err) {
      console.error('Error connecting to marketplace:', err);
      return false;
    }
  };

  // Disconnect from marketplace
  const disconnectMarketplace = async (marketplaceName: string) => {
    try {
      const success = await updateMarketplaceIntegration(marketplaceName, {
        api_key: undefined,
        api_secret: undefined,
        access_token: undefined,
        refresh_token: undefined,
        seller_id: undefined,
        store_url: undefined,
        is_active: false,
        status: 'disconnected',
        last_sync: undefined
      });

      return success;
    } catch (err) {
      console.error('Error disconnecting from marketplace:', err);
      return false;
    }
  };

  // Update global settings
  const updateGlobalSettings = async (updates: Partial<MarketplaceSettings['global_settings']>) => {
    try {
      if (!settings) return false;

      const updatedSettings = {
        ...settings,
        global_settings: {
          ...settings.global_settings,
          ...updates
        }
      };

      const { error } = await supabase
        .from('marketplace_settings')
        .upsert([updatedSettings]);

      if (error) {
        throw error;
      }

      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('Error updating global settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update global settings');
      return false;
    }
  };

  // Test marketplace connection
  const testMarketplaceConnection = async (marketplaceName: string) => {
    try {
      const integration = settings?.integrations.find(i => i.name === marketplaceName);
      if (!integration || !integration.is_active) {
        throw new Error('Marketplace not connected');
      }

      // Here you would make an actual API call to test the connection
      // For now, we'll simulate a test
      await new Promise(resolve => setTimeout(resolve, 1000));

      const success = await updateMarketplaceIntegration(marketplaceName, {
        status: 'connected',
        last_sync: new Date().toISOString()
      });

      return success;
    } catch (err) {
      console.error('Error testing marketplace connection:', err);
      await updateMarketplaceIntegration(marketplaceName, {
        status: 'error'
      });
      return false;
    }
  };

  // Sync marketplace data
  const syncMarketplaceData = async (marketplaceName: string) => {
    try {
      const integration = settings?.integrations.find(i => i.name === marketplaceName);
      if (!integration || !integration.is_active) {
        throw new Error('Marketplace not connected');
      }

      // Here you would make actual API calls to sync data
      // For now, we'll simulate a sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      const success = await updateMarketplaceIntegration(marketplaceName, {
        last_sync: new Date().toISOString()
      });

      return success;
    } catch (err) {
      console.error('Error syncing marketplace data:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchMarketplaceSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchMarketplaceSettings,
    updateMarketplaceIntegration,
    connectMarketplace,
    disconnectMarketplace,
    updateGlobalSettings,
    testMarketplaceConnection,
    syncMarketplaceData
  };
};
