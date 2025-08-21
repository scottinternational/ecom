import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Marketplace {
  id: number;
  name: string;
  display_name: string;
  logo_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceIntegration {
  id: number;
  marketplace_id: number;
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  seller_id?: string;
  store_url?: string;
  is_connected: boolean;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  sync_frequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  settings: {
    auto_sync: boolean;
    sync_orders: boolean;
    sync_inventory: boolean;
    sync_pricing: boolean;
    webhook_url?: string;
    notification_email?: string;
  };
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMarketplaceData {
  name: string;
  display_name: string;
  logo_url?: string;
}

export interface CreateIntegrationData {
  marketplace_id: number;
  api_key?: string;
  api_secret?: string;
  seller_id?: string;
  store_url?: string;
  sync_frequency?: 'hourly' | 'daily' | 'weekly' | 'manual';
  settings?: Partial<MarketplaceIntegration['settings']>;
}

export function useMarketplaces() {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [integrations, setIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMarketplaces = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching marketplaces...');

      const { data, error: fetchError } = await supabase
        .from('marketplaces')
        .select('*')
        .order('display_name', { ascending: true });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Marketplaces fetched successfully:', data);
      setMarketplaces(data || []);
    } catch (err) {
      console.error('Error in fetchMarketplaces:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch marketplaces';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('marketplace_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch integrations error:', fetchError);
        throw fetchError;
      }

      console.log('Integrations fetched successfully:', data);
      setIntegrations(data || []);
    } catch (err) {
      console.error('Error in fetchIntegrations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch integrations';
      setError(errorMessage);
    }
  };

  const createMarketplace = async (marketplaceData: CreateMarketplaceData): Promise<Marketplace | null> => {
    try {
      console.log('Creating marketplace:', marketplaceData);

      const { data, error: createError } = await supabase
        .from('marketplaces')
        .insert(marketplaceData)
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        throw createError;
      }

      console.log('Marketplace created successfully:', data);
      setMarketplaces(prev => [...prev, data].sort((a, b) => a.display_name.localeCompare(b.display_name)));
      return data;
    } catch (err) {
      console.error('Error in createMarketplace:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create marketplace';
      setError(errorMessage);
      return null;
    }
  };

  const updateMarketplace = async (id: number, updates: Partial<CreateMarketplaceData>): Promise<boolean> => {
    try {
      console.log('Updating marketplace:', id, updates);

      const { error: updateError } = await supabase
        .from('marketplaces')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Marketplace updated successfully');
      await fetchMarketplaces();
      return true;
    } catch (err) {
      console.error('Error in updateMarketplace:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update marketplace';
      setError(errorMessage);
      return false;
    }
  };

  const deleteMarketplace = async (id: number): Promise<boolean> => {
    try {
      console.log('Deleting marketplace:', id);

      const { error: deleteError } = await supabase
        .from('marketplaces')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Marketplace deleted successfully');
      setMarketplaces(prev => prev.filter(marketplace => marketplace.id !== id));
      return true;
    } catch (err) {
      console.error('Error in deleteMarketplace:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete marketplace';
      setError(errorMessage);
      return false;
    }
  };

  const createIntegration = async (integrationData: CreateIntegrationData): Promise<MarketplaceIntegration | null> => {
    try {
      console.log('Creating integration:', integrationData);

      const { data, error: createError } = await supabase
        .from('marketplace_integrations')
        .insert({
          ...integrationData,
          settings: {
            auto_sync: false,
            sync_orders: true,
            sync_inventory: true,
            sync_pricing: true,
            webhook_url: "",
            notification_email: "",
            ...integrationData.settings
          }
        })
        .select()
        .single();

      if (createError) {
        console.error('Create integration error:', createError);
        throw createError;
      }

      console.log('Integration created successfully:', data);
      setIntegrations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error in createIntegration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create integration';
      setError(errorMessage);
      return null;
    }
  };

  const updateIntegration = async (id: number, updates: Partial<MarketplaceIntegration>): Promise<boolean> => {
    try {
      console.log('Updating integration:', id, updates);

      const { error: updateError } = await supabase
        .from('marketplace_integrations')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        console.error('Update integration error:', updateError);
        throw updateError;
      }

      console.log('Integration updated successfully');
      await fetchIntegrations();
      return true;
    } catch (err) {
      console.error('Error in updateIntegration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update integration';
      setError(errorMessage);
      return false;
    }
  };

  const deleteIntegration = async (id: number): Promise<boolean> => {
    try {
      console.log('Deleting integration:', id);

      const { error: deleteError } = await supabase
        .from('marketplace_integrations')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete integration error:', deleteError);
        throw deleteError;
      }

      console.log('Integration deleted successfully');
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      return true;
    } catch (err) {
      console.error('Error in deleteIntegration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete integration';
      setError(errorMessage);
      return false;
    }
  };

  const getIntegrationByMarketplaceId = (marketplaceId: number): MarketplaceIntegration | undefined => {
    return integrations.find(integration => integration.marketplace_id === marketplaceId);
  };

  const testConnection = async (marketplaceId: number): Promise<boolean> => {
    try {
      const integration = getIntegrationByMarketplaceId(marketplaceId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just update the status to connected
      await updateIntegration(integration.id, {
        status: 'connected',
        is_connected: true
      });

      return true;
    } catch (err) {
      console.error('Error testing connection:', err);
      const integration = getIntegrationByMarketplaceId(marketplaceId);
      if (integration) {
        await updateIntegration(integration.id, {
          status: 'error',
          is_connected: false
        });
      }
      return false;
    }
  };

  const syncData = async (marketplaceId: number, syncType: 'orders' | 'inventory' | 'pricing' | 'full' = 'full'): Promise<boolean> => {
    try {
      const integration = getIntegrationByMarketplaceId(marketplaceId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update last sync time
      await updateIntegration(integration.id, {
        last_sync: new Date().toISOString()
      });

      return true;
    } catch (err) {
      console.error('Error syncing data:', err);
      return false;
    }
  };

  useEffect(() => {
    console.log('useMarketplaces hook mounted, fetching data...');
    fetchMarketplaces();
    fetchIntegrations();
  }, []);

  return {
    marketplaces,
    integrations,
    loading,
    error,
    fetchMarketplaces,
    fetchIntegrations,
    createMarketplace,
    updateMarketplace,
    deleteMarketplace,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    getIntegrationByMarketplaceId,
    testConnection,
    syncData
  };
}
