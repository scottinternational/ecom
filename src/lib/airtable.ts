// Airtable API Integration
// This file handles all Airtable API interactions

interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

interface AirtableError {
  error: {
    type: string;
    message: string;
  };
}

class AirtableAPI {
  private config: AirtableConfig;
  private baseUrl: string;

  constructor(config: AirtableConfig) {
    this.config = config;
    this.baseUrl = `https://api.airtable.com/v0/${config.baseId}`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `Airtable API error: ${response.status} ${response.statusText}`;
        
        // Try to get more detailed error information
        try {
          const errorData: AirtableError = await response.json();
          if (errorData.error) {
            errorMessage = `Airtable API error: ${errorData.error.type} - ${errorData.error.message}`;
          }
        } catch (parseError) {
          // If we can't parse the error, use the status text
        }

        // Handle specific error cases
        if (response.status === 403) {
          errorMessage = 'Access denied. Please check your API key and permissions.';
        } else if (response.status === 404) {
          errorMessage = 'Resource not found. Please check your base ID and table name.';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait before making more requests.';
        }

        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred while connecting to Airtable');
    }
  }

  // Test the connection and permissions
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      // Try to fetch a single record to test the connection
      const response = await this.makeRequest(`/${this.config.tableName}?maxRecords=1`);
      
      return {
        success: true,
        message: 'Connection successful',
        details: {
          recordCount: response.records?.length || 0,
          tableName: this.config.tableName,
          baseId: this.config.baseId
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error }
      };
    }
  }

  // Fetch all records from a table
  async fetchRecords(tableName: string, options: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    fields?: string[];
    maxRecords?: number;
    pageSize?: number;
  } = {}): Promise<AirtableRecord[]> {
    const params = new URLSearchParams();

    if (options.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }

    if (options.sort) {
      params.append('sort[0][field]', options.sort[0].field);
      if (options.sort[0].direction) {
        params.append('sort[0][direction]', options.sort[0].direction);
      }
    }

    if (options.fields) {
      options.fields.forEach(field => {
        params.append('fields[]', field);
      });
    }

    if (options.maxRecords) {
      params.append('maxRecords', options.maxRecords.toString());
    }

    if (options.pageSize) {
      params.append('pageSize', options.pageSize.toString());
    }

    const endpoint = `/${tableName}?${params.toString()}`;
    const response: AirtableResponse = await this.makeRequest(endpoint);
    
    return response.records;
  }

  // Fetch a single record by ID
  async fetchRecord(tableName: string, recordId: string): Promise<AirtableRecord> {
    const response = await this.makeRequest(`/${tableName}/${recordId}`);
    return response;
  }

  // Search records by field value
  async searchRecords(tableName: string, field: string, value: string): Promise<AirtableRecord[]> {
    const filterFormula = `{${field}} = "${value}"`;
    return this.fetchRecords(tableName, { filterByFormula: filterFormula });
  }

  // Get image URLs from attachment fields with better error handling
  async getImageUrls(tableName: string, attachmentField: string, options: {
    filterByFormula?: string;
    maxRecords?: number;
  } = {}): Promise<Array<{ recordId: string; imageUrls: string[]; sku?: string }>> {
    try {
      const records = await this.fetchRecords(tableName, {
        fields: [attachmentField, 'SKU', 'sku'], // Include both possible SKU field names
        filterByFormula: options.filterByFormula,
        maxRecords: options.maxRecords,
      });

      return records
        .filter(record => record.fields[attachmentField])
        .map(record => {
          const attachments = record.fields[attachmentField];
          const imageUrls = Array.isArray(attachments) 
            ? attachments.map((attachment: any) => attachment.url)
            : [attachments.url];
          
          return {
            recordId: record.id,
            imageUrls,
            sku: record.fields['SKU'] || record.fields['sku'], // Get SKU if available
          };
        });
    } catch (error) {
      console.error('Error fetching image URLs:', error);
      throw error;
    }
  }

  // Create a new record
  async createRecord(tableName: string, fields: Record<string, any>): Promise<AirtableRecord> {
    const response = await this.makeRequest(`/${tableName}`, {
      method: 'POST',
      body: JSON.stringify({
        fields,
      }),
    });
    
    return response.records[0];
  }

  // Update a record
  async updateRecord(tableName: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    const response = await this.makeRequest(`/${tableName}/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        fields,
      }),
    });
    
    return response;
  }

  // Delete a record
  async deleteRecord(tableName: string, recordId: string): Promise<void> {
    await this.makeRequest(`/${tableName}/${recordId}`, {
      method: 'DELETE',
    });
  }

  // Upload file to Airtable
  async uploadFile(file: File): Promise<string> {
    // First, we need to upload the file to Airtable's file storage
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch('https://api.airtable.com/v0/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`File upload failed: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.url;
  }

  // Validate image URLs and return only accessible ones
  async validateImageUrls(imageUrls: string[]): Promise<string[]> {
    const validUrls: string[] = [];
    
    for (const url of imageUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          validUrls.push(url);
        } else {
          console.warn(`Image URL not accessible: ${url} (${response.status})`);
        }
      } catch (error) {
        console.warn(`Failed to validate image URL: ${url}`, error);
      }
    }
    
    return validUrls;
  }
}

// Create a singleton instance
let airtableInstance: AirtableAPI | null = null;

export const initializeAirtable = (config: AirtableConfig): AirtableAPI => {
  airtableInstance = new AirtableAPI(config);
  return airtableInstance;
};

export const getAirtableInstance = (): AirtableAPI => {
  if (!airtableInstance) {
    throw new Error('Airtable not initialized. Call initializeAirtable() first.');
  }
  return airtableInstance;
};

// Test Airtable connection
export const testAirtableConnection = async (config: AirtableConfig): Promise<{ success: boolean; message: string; details?: any }> => {
  const tempInstance = new AirtableAPI(config);
  return tempInstance.testConnection();
};

// Helper function to get image URLs for products
export const getProductImages = async (tableName: string, imageField: string = 'Images'): Promise<Array<{ recordId: string; imageUrls: string[] }>> => {
  const airtable = getAirtableInstance();
  return airtable.getImageUrls(tableName, imageField);
};

// Helper function to get brand images
export const getBrandImages = async (tableName: string, imageField: string = 'Logo'): Promise<Array<{ recordId: string; imageUrls: string[] }>> => {
  const airtable = getAirtableInstance();
  return airtable.getImageUrls(tableName, imageField);
};

// Helper function to search for a specific product by SKU
export const getProductBySku = async (tableName: string, sku: string, skuField: string = 'SKU'): Promise<AirtableRecord | null> => {
  const airtable = getAirtableInstance();
  const records = await airtable.searchRecords(tableName, skuField, sku);
  return records.length > 0 ? records[0] : null;
};

// Helper function to get all products with their images
export const getAllProductsWithImages = async (tableName: string, options: {
  imageField?: string;
  skuField?: string;
  nameField?: string;
  maxRecords?: number;
  validateImages?: boolean;
} = {}): Promise<Array<{
  recordId: string;
  sku: string;
  name: string;
  imageUrls: string[];
}>> => {
  const airtable = getAirtableInstance();
  const {
    imageField = 'Images',
    skuField = 'SKU',
    nameField = 'Name',
    maxRecords = 1000,
    validateImages = false
  } = options;

  // Build fields array, avoiding duplicates if nameField is the same as skuField
  const fields = [skuField, imageField];
  if (nameField !== skuField) {
    fields.push(nameField);
  }

  const records = await airtable.fetchRecords(tableName, {
    fields,
    maxRecords,
  });

  const products = records
    .filter(record => record.fields[skuField])
    .map(record => {
      const attachments = record.fields[imageField];
      const imageUrls = Array.isArray(attachments) 
        ? attachments.map((attachment: any) => attachment.url)
        : attachments ? [attachments.url] : [];

      return {
        recordId: record.id,
        sku: record.fields[skuField],
        name: nameField === skuField ? record.fields[skuField] : (record.fields[nameField] || record.fields[skuField]), // Use SKU as name if nameField is same as skuField or if name is not available
        imageUrls,
      };
    });

  // Validate images if requested
  if (validateImages) {
    for (const product of products) {
      if (product.imageUrls.length > 0) {
        product.imageUrls = await airtable.validateImageUrls(product.imageUrls);
      }
    }
  }

  return products;
};

export default AirtableAPI;
