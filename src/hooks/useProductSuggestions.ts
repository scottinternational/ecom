import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  product_images: string[];
  status: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
  // New procurement fields
  supplier_name?: string;
  supplier_address?: string;
  supplier_city?: string;
  supplier_state?: string;
  supplier_pincode?: string;
  cost_price?: number;
  gst_rate?: number;
  lead_time_days?: number;
  counter_sample_images?: string[];
  procurement_notes?: string; // Rich text notes from procurement team
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
  product_images: string[];
}

export interface UpdateProcurementData {
  supplier_name?: string;
  supplier_address?: string;
  supplier_city?: string;
  supplier_state?: string;
  supplier_pincode?: string;
  cost_price?: number;
  gst_rate?: number;
  lead_time_days?: number;
  counter_sample_images?: string[];
  status?: string;
}

export const useProductSuggestions = () => {
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching suggestions:', fetchError);
        setError(fetchError.message);
        return;
      }

      setSuggestions(data || []);
    } catch (err) {
      console.error('Error in fetchSuggestions:', err);
      setError('Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  };

  const createSuggestion = async (suggestionData: CreateProductSuggestionData) => {
    try {
      const { data, error: createError } = await supabase
        .from('product_suggestions')
        .insert([suggestionData])
        .select()
        .single();

      if (createError) {
        console.error('Error creating suggestion:', createError);
        throw new Error(createError.message);
      }

      setSuggestions(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error in createSuggestion:', err);
      throw err;
    }
  };

  const updateProcurementDetails = async (id: string, procurementData: UpdateProcurementData) => {
    try {
      const { data, error: updateError } = await supabase
        .from('product_suggestions')
        .update(procurementData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating procurement details:', updateError);
        throw new Error(updateError.message);
      }

      setSuggestions(prev => 
        prev.map(suggestion => 
          suggestion.id === id ? { ...suggestion, ...data } : suggestion
        )
      );

      return data;
    } catch (err) {
      console.error('Error in updateProcurementDetails:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return {
    suggestions,
    loading,
    error,
    fetchSuggestions,
    createSuggestion,
    updateProcurementDetails
  };
};
