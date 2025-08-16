import { supabase } from "@/integrations/supabase/client";

export interface UpdateProcurementData {
  supplier_name?: string | null;
  supplier_address?: string | null;
  supplier_city?: string | null;
  supplier_state?: string | null;
  supplier_pincode?: string | null;
  cost_price?: number | null;
  gst_rate?: number | null;
  lead_time_days?: number | null;
  counter_sample_images?: string[];
  procurement_notes?: string | null; // Rich text notes from procurement team
  status?: string;
}

export const updateProcurementDetails = async (id: string, procurementData: UpdateProcurementData) => {
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

    return data;
  } catch (err) {
    console.error('Error in updateProcurementDetails:', err);
    throw err;
  }
};
