import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProductSuggestion {
  id: string;
  title: string;
  description: string;
  target_marketplaces: string[];
  competitors: string[];
  priority: string;
  target_price?: number;
  proposed_selling_price?: number;
  expected_timeline?: string;
  research_notes?: string;
  product_url?: string;
  product_images?: string[];
  status: string;
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductSuggestionData {
  title: string;
  description: string;
  target_marketplaces: string[];
  competitors: string[];
  priority: string;
  target_price?: number;
  proposed_selling_price?: number;
  expected_timeline?: string;
  research_notes?: string;
  product_url?: string;
  product_images?: string[];
}

export function useProductSuggestions() {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch all product suggestions
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_suggestions')
        .select(`
          *,
          profiles:submitted_by(email, full_name)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSuggestions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new product suggestion
  const createSuggestion = async (suggestionData: CreateProductSuggestionData): Promise<ProductSuggestion | null> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: createError } = await supabase
        .from('product_suggestions')
        .insert({
          ...suggestionData,
          submitted_by: user.id,
          status: 'In Research'
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Refresh the suggestions list
      await fetchSuggestions();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create suggestion');
      console.error('Error creating suggestion:', err);
      return null;
    }
  };

  // Update a product suggestion
  const updateSuggestion = async (id: string, updates: Partial<CreateProductSuggestionData>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('product_suggestions')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Refresh the suggestions list
      await fetchSuggestions();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update suggestion');
      console.error('Error updating suggestion:', err);
      return false;
    }
  };

  // Update suggestion status
  const updateSuggestionStatus = async (id: string, status: string): Promise<boolean> => {
    return updateSuggestion(id, { status });
  };

  // Delete a product suggestion
  const deleteSuggestion = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('product_suggestions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh the suggestions list
      await fetchSuggestions();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete suggestion');
      console.error('Error deleting suggestion:', err);
      return false;
    }
  };

  // Fetch suggestions on component mount
  useEffect(() => {
    fetchSuggestions();
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    createSuggestion,
    updateSuggestion,
    updateSuggestionStatus,
    deleteSuggestion,
  };
}
