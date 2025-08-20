import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Brand {
  id: number; // Changed from string to number to match int8
  brand: string;
  logo?: string | null; // Changed from logo_url to logo
  created_at: string;
}

export interface CreateBrandData {
  brand: string;
  logo?: string;
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching brands...');
      
      // First, let's check if the table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('brands')
        .select('count')
        .limit(1);

      if (tableError) {
        console.error('Table check error:', tableError);
        throw new Error(`Table error: ${tableError.message}`);
      }

      console.log('Table exists, fetching brands...');

      // Test query to see if we can get any data at all
      const { data: testData, error: testError } = await supabase
        .from('brands')
        .select('*')
        .limit(1);

      console.log('Test query result:', { testData, testError });

      const { data, error: fetchError } = await supabase
        .from('brands')
        .select('*')
        .order('brand', { ascending: true });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Brands fetched successfully:', data);
      console.log('Data type:', typeof data);
      console.log('Data length:', data?.length);
      console.log('Is array:', Array.isArray(data));
      
      // If no data found, try RPC function as fallback
      if (!data || data.length === 0) {
        console.log('No data found, trying RPC function...');
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_brands_count');
        
        console.log('RPC function result:', { rpcData, rpcError });
        
        if (rpcData && rpcData.length > 0) {
          console.log('RPC function returned data:', rpcData);
          setBrands(rpcData);
          return;
        }
      }
      
      setBrands(data || []);
    } catch (err) {
      console.error('Error in fetchBrands:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch brands';
      setError(errorMessage);
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBrand = async (brandData: CreateBrandData): Promise<Brand | null> => {
    try {
      console.log('Creating brand:', brandData);

      const { data, error: createError } = await supabase
        .from('brands')
        .insert({
          ...brandData,
          logo: brandData.logo || null
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        throw createError;
      }

      console.log('Brand created successfully:', data);
      setBrands(prev => [...prev, data].sort((a, b) => a.brand.localeCompare(b.brand)));
      return data;
    } catch (err) {
      console.error('Error in createBrand:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create brand';
      setError(errorMessage);
      console.error('Error creating brand:', err);
      return null;
    }
  };

  const updateBrand = async (id: number, updates: Partial<CreateBrandData>): Promise<boolean> => {
    try {
      console.log('Updating brand:', id, updates);

      const { error: updateError } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Brand updated successfully');
      await fetchBrands();
      return true;
    } catch (err) {
      console.error('Error in updateBrand:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update brand';
      setError(errorMessage);
      console.error('Error updating brand:', err);
      return false;
    }
  };

  const deleteBrand = async (id: number): Promise<boolean> => {
    try {
      console.log('Deleting brand:', id);

      const { error: deleteError } = await supabase
        .from('brands')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Brand deleted successfully');
      setBrands(prev => prev.filter(brand => brand.id !== id));
      return true;
    } catch (err) {
      console.error('Error in deleteBrand:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete brand';
      setError(errorMessage);
      console.error('Error deleting brand:', err);
      return false;
    }
  };

  useEffect(() => {
    console.log('useBrands hook mounted, fetching brands...');
    fetchBrands();
  }, []);

  return {
    brands,
    loading,
    error,
    fetchBrands,
    createBrand,
    updateBrand,
    deleteBrand
  };
}
