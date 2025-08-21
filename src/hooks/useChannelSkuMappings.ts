import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChannelSkuMapping {
  id: number;
  channel_sku: string;
  channel_name: string;
  master_sku: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateChannelSkuMappingData {
  channel_sku: string;
  channel_name: string;
  master_sku: string;
  status?: 'Active' | 'Inactive';
}

export interface BulkUploadResult {
  success: boolean;
  message: string;
  data?: ChannelSkuMapping[];
  errors?: string[];
}

export const useChannelSkuMappings = () => {
  const [mappings, setMappings] = useState<ChannelSkuMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(200);

  const fetchMappings = async (page = 1, searchTerm = '', statusFilter = 'all', channelFilter = 'all') => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching mappings with:', { page, searchTerm, statusFilter, channelFilter });

      let query = supabase
        .from('channel_sku_mappings')
        .select('*', { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        console.log('Applying search filter:', searchTerm);
        query = query.or(`channel_sku.ilike.%${searchTerm}%,channel_name.ilike.%${searchTerm}%,master_sku.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== 'all') {
        console.log('Applying status filter:', statusFilter);
        query = query.eq('status', statusFilter);
      }
      if (channelFilter !== 'all') {
        console.log('Applying channel filter:', channelFilter);
        query = query.eq('channel_name', channelFilter);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      console.log('Fetched mappings:', { count, dataLength: data?.length, page });

      setMappings(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mappings');
      console.error('Error fetching channel SKU mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMappings = async (searchTerm = '', statusFilter = 'all', channelFilter = 'all') => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching all mappings with:', { searchTerm, statusFilter, channelFilter });

      let query = supabase
        .from('channel_sku_mappings')
        .select('*');

      // Apply filters
      if (searchTerm) {
        console.log('Applying search filter (all):', searchTerm);
        query = query.or(`channel_sku.ilike.%${searchTerm}%,channel_name.ilike.%${searchTerm}%,master_sku.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== 'all') {
        console.log('Applying status filter (all):', statusFilter);
        query = query.eq('status', statusFilter);
      }
      if (channelFilter !== 'all') {
        console.log('Applying channel filter (all):', channelFilter);
        query = query.eq('channel_name', channelFilter);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      console.log('Fetched all mappings:', { dataLength: data?.length });

      setMappings(data || []);
      setTotalCount(data?.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mappings');
      console.error('Error fetching channel SKU mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMapping = async (mappingData: CreateChannelSkuMappingData): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from('channel_sku_mappings')
        .insert([mappingData]);

      if (insertError) {
        throw insertError;
      }

      await fetchMappings(currentPage);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mapping');
      console.error('Error creating channel SKU mapping:', err);
      return false;
    }
  };

  const updateMapping = async (id: number, mappingData: Partial<CreateChannelSkuMappingData>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('channel_sku_mappings')
        .update(mappingData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await fetchMappings(currentPage);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mapping');
      console.error('Error updating channel SKU mapping:', err);
      return false;
    }
  };

  const deleteMapping = async (id: number): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('channel_sku_mappings')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      await fetchMappings(currentPage);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mapping');
      console.error('Error deleting channel SKU mapping:', err);
      return false;
    }
  };

  const bulkUpload = async (file: File, skipMasterSkuValidation = false): Promise<BulkUploadResult> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      const results: ChannelSkuMapping[] = [];
      const errors: string[] = [];

      console.log(`Processing ${dataLines.length} rows from CSV file`);

      // First, collect all unique master SKUs for validation
      const uniqueMasterSkus = new Set<string>();
      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length >= 3) {
          const [, , master_sku] = columns;
          if (master_sku) {
            uniqueMasterSkus.add(master_sku);
          }
        }
      }

      // Validate that all master SKUs exist in the products table (unless skipped)
      if (!skipMasterSkuValidation && uniqueMasterSkus.size > 0) {
        console.log(`Validating ${uniqueMasterSkus.size} unique master SKUs against products table`);
        
        try {
          // Check if products table exists and has data
          const { data: existingProducts, error: productError } = await supabase
            .from('products')
            .select('sku')
            .in('sku', Array.from(uniqueMasterSkus));

          if (productError) {
            console.error('Error fetching products:', productError);
            
            // If it's a table not found error, skip validation
            if (productError.code === '42P01') { // Table doesn't exist
              console.warn('Products table not found, skipping master SKU validation');
            } else {
              return {
                success: false,
                message: `Failed to validate master SKUs: ${productError.message}`,
                errors: [`Database error: ${productError.message}`]
              };
            }
          } else {
            const existingSkus = new Set(existingProducts?.map(p => p.sku) || []);
            const missingSkus = Array.from(uniqueMasterSkus).filter(sku => !existingSkus.has(sku));

            if (missingSkus.length > 0) {
              return {
                success: false,
                message: `Found ${missingSkus.length} master SKUs that don't exist in the products table`,
                errors: missingSkus.map(sku => `Master SKU "${sku}" not found in products table`)
              };
            }

            console.log(`All ${uniqueMasterSkus.size} master SKUs validated successfully`);
          }
        } catch (validationError) {
          console.error('Master SKU validation error:', validationError);
          // Continue with upload even if validation fails
          console.warn('Skipping master SKU validation due to error, proceeding with upload');
        }
      } else if (skipMasterSkuValidation) {
        console.log('Skipping master SKU validation as requested');
      }

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 3) {
          errors.push(`Row ${i + 2}: Insufficient columns. Expected 3-4 columns, got ${columns.length}`);
          continue;
        }

        const [channel_sku, channel_name, master_sku, status = 'Active'] = columns;

        // Validate required fields
        if (!channel_sku || !channel_name || !master_sku) {
          errors.push(`Row ${i + 2}: Missing required fields (channel_sku: "${channel_sku}", channel_name: "${channel_name}", master_sku: "${master_sku}")`);
          continue;
        }

        // Validate status
        if (status && !['Active', 'Inactive'].includes(status)) {
          errors.push(`Row ${i + 2}: Invalid status "${status}". Must be 'Active' or 'Inactive'`);
          continue;
        }

        // Add to results for bulk insert/update
        results.push({
          id: 0, // Will be assigned by database
          channel_sku,
          channel_name,
          master_sku,
          status: status as 'Active' | 'Inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `Found ${errors.length} validation errors in upload file`,
          errors
        };
      }

      if (results.length === 0) {
        return {
          success: false,
          message: 'No valid mappings found in upload file'
        };
      }

      // Global deduplication - keep only the last occurrence of each unique combination
      const uniqueResults = new Map<string, ChannelSkuMapping>();
      const globalDuplicates: string[] = [];
      
      results.forEach((record) => {
        const key = `${record.channel_sku}-${record.channel_name}`;
        if (uniqueResults.has(key)) {
          globalDuplicates.push(`Duplicate: ${record.channel_sku} on ${record.channel_name}`);
        }
        uniqueResults.set(key, record); // This will overwrite previous entries, keeping the last one
      });

      const deduplicatedResults = Array.from(uniqueResults.values());
      
      if (globalDuplicates.length > 0) {
        console.warn(`Found ${globalDuplicates.length} global duplicates, keeping last occurrence of each:`, globalDuplicates);
      }

      console.log(`Starting batch processing for ${deduplicatedResults.length} unique mappings (removed ${globalDuplicates.length} duplicates)`);

      // Process in batches of 1000
      const BATCH_SIZE = 1000;
      const batches = [];
      for (let i = 0; i < deduplicatedResults.length; i += BATCH_SIZE) {
        batches.push(deduplicatedResults.slice(i, i + BATCH_SIZE));
      }

      console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} records each`);

      let totalInserted = 0;
      let totalUpdated = 0;
      const batchErrors: string[] = [];

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} records`);

        try {
          // Deduplicate records within the batch based on channel_sku and channel_name
          const uniqueBatchData = new Map<string, any>();
          const duplicatesInBatch: string[] = [];
          
          batch.forEach((record) => {
            const key = `${record.channel_sku}-${record.channel_name}`;
            if (uniqueBatchData.has(key)) {
              duplicatesInBatch.push(`Duplicate: ${record.channel_sku} on ${record.channel_name}`);
            } else {
              uniqueBatchData.set(key, record);
            }
          });

          if (duplicatesInBatch.length > 0) {
            console.warn(`Found ${duplicatesInBatch.length} duplicates in batch ${batchIndex + 1}:`, duplicatesInBatch);
          }

          // Prepare batch data for upsert (remove id, created_at, updated_at)
          const batchData = Array.from(uniqueBatchData.values()).map(({ id, created_at, updated_at, ...rest }) => rest);

          console.log(`Processing ${batchData.length} unique records in batch ${batchIndex + 1}`);

          // Use upsert to handle duplicates (insert or update)
          const { data: upsertedData, error: batchError } = await supabase
            .from('channel_sku_mappings')
            .upsert(batchData, { 
              onConflict: 'channel_sku,channel_name',
              ignoreDuplicates: false 
            })
            .select();

          if (batchError) {
            console.error(`Batch ${batchIndex + 1} error:`, batchError);
            
            // If it's a duplicate conflict error, try processing records individually
            if (batchError.code === '21000') {
              console.log(`Attempting individual record processing for batch ${batchIndex + 1} due to duplicate conflicts`);
              
              let individualSuccessCount = 0;
              const individualErrors: string[] = [];
              
              for (const record of batchData) {
                try {
                  const { error: individualError } = await supabase
                    .from('channel_sku_mappings')
                    .upsert([record], { 
                      onConflict: 'channel_sku,channel_name',
                      ignoreDuplicates: false 
                    });
                  
                  if (individualError) {
                    individualErrors.push(`Record ${record.channel_sku} on ${record.channel_name}: ${individualError.message}`);
                  } else {
                    individualSuccessCount++;
                  }
                } catch (individualException) {
                  individualErrors.push(`Record ${record.channel_sku} on ${record.channel_name}: ${individualException instanceof Error ? individualException.message : 'Unknown error'}`);
                }
              }
              
              totalInserted += individualSuccessCount;
              console.log(`Individual processing for batch ${batchIndex + 1}: ${individualSuccessCount} successful, ${individualErrors.length} failed`);
              
              if (individualErrors.length > 0) {
                batchErrors.push(`Batch ${batchIndex + 1}: ${individualErrors.length} records failed during individual processing`);
              }
              
              continue;
            }
            
            // Provide detailed error information for other errors
            if (batchError.code === '23503') { // Foreign key violation
              batchErrors.push(`Batch ${batchIndex + 1}: Foreign key constraint violation. Ensure all master_sku values exist in the products table.`);
            } else if (batchError.code === '23514') { // Check constraint violation
              batchErrors.push(`Batch ${batchIndex + 1}: Status constraint violation. Status must be 'Active' or 'Inactive'.`);
            } else if (batchError.code === '22P02') { // Invalid text representation
              batchErrors.push(`Batch ${batchIndex + 1}: Invalid data format. Check for special characters or invalid values.`);
            } else {
              batchErrors.push(`Batch ${batchIndex + 1}: ${batchError.message} (Code: ${batchError.code})`);
            }
            
            // Continue with next batch instead of failing completely
            continue;
          }

          if (upsertedData) {
            totalInserted += upsertedData.length;
            console.log(`Batch ${batchIndex + 1} successful: ${upsertedData.length} records processed`);
          }

        } catch (batchException) {
          console.error(`Batch ${batchIndex + 1} exception:`, batchException);
          batchErrors.push(`Batch ${batchIndex + 1}: Unexpected error - ${batchException instanceof Error ? batchException.message : 'Unknown error'}`);
        }
      }

      // Refresh mappings after all batches are processed
      await fetchMappings(currentPage);

      if (batchErrors.length > 0) {
        return {
          success: false,
          message: `Partial upload completed. ${totalInserted} records processed, but ${batchErrors.length} batches failed.${globalDuplicates.length > 0 ? ` ${globalDuplicates.length} duplicates were automatically removed.` : ''}`,
          errors: batchErrors,
          data: deduplicatedResults.slice(0, totalInserted) // Return only successfully processed data
        };
      }

      return {
        success: true,
        message: `Successfully processed ${totalInserted} mappings in ${batches.length} batches${globalDuplicates.length > 0 ? ` (${globalDuplicates.length} duplicates were automatically removed)` : ''} (duplicates were updated)`,
        data: deduplicatedResults
      };
    } catch (err) {
      console.error('Bulk upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to process bulk upload';
      
      // Provide more specific error information
      let detailedError = errorMessage;
      if (err instanceof Error) {
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          detailedError = 'Network error: Please check your internet connection and try again.';
        } else if (errorMessage.includes('permission') || errorMessage.includes('auth')) {
          detailedError = 'Authentication error: Please ensure you are logged in and have proper permissions.';
        } else if (errorMessage.includes('database') || errorMessage.includes('connection')) {
          detailedError = 'Database connection error: Please try again later or contact support.';
        }
      }
      
      return {
        success: false,
        message: detailedError,
        errors: [detailedError]
      };
    }
  };

  const exportMappings = async (): Promise<string> => {
    const csvHeader = 'Channel_SKU,Channel_Name,Master_SKU,Status\n';
    const csvData = mappings.map(mapping => 
      `"${mapping.channel_sku}","${mapping.channel_name}","${mapping.master_sku}","${mapping.status}"`
    ).join('\n');
    
    return csvHeader + csvData;
  };

  const downloadTemplate = (): void => {
    const template = 'Channel_SKU,Channel_Name,Master_SKU,Status\n"AMZ-001","Amazon","PROD-001","Active"\n"FK-001","Flipkart","PROD-001","Active"\n"MYN-001","Myntra","PROD-002","Active"';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'channel_sku_mappings_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchMappings(1);
  }, []);

  return {
    mappings,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    fetchMappings,
    fetchAllMappings,
    createMapping,
    updateMapping,
    deleteMapping,
    bulkUpload,
    exportMappings,
    downloadTemplate
  };
};
