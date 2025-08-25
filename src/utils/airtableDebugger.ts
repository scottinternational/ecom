// Airtable Debug Utility
// This utility helps debug Airtable connection and image fetching issues

import { testAirtableConnection, initializeAirtable, getAirtableInstance, getAllProductsWithImages } from '@/lib/airtable';

interface DebugConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
  imageField: string;
  skuField: string;
  nameField: string;
}

interface DebugResult {
  connection: {
    success: boolean;
    message: string;
    details?: any;
  };
  tableInfo?: {
    recordCount: number;
    fields: string[];
    sampleRecords: any[];
  };
  imageAnalysis?: {
    totalProducts: number;
    productsWithImages: number;
    totalImages: number;
    validImages: number;
    invalidUrls: string[];
    sampleImages: Array<{
      sku: string;
      name: string;
      imageUrls: string[];
      isValid: boolean[];
    }>;
  };
  errors: string[];
}

export class AirtableDebugger {
  private config: DebugConfig;

  constructor(config: DebugConfig) {
    this.config = config;
  }

  async runFullDiagnostic(): Promise<DebugResult> {
    const result: DebugResult = {
      connection: { success: false, message: '' },
      errors: []
    };

    console.log('🔍 Starting Airtable diagnostic...');

    // Step 1: Test connection
    try {
      console.log('📡 Testing connection...');
      result.connection = await testAirtableConnection({
        apiKey: this.config.apiKey,
        baseId: this.config.baseId,
        tableName: this.config.tableName,
      });

      if (!result.connection.success) {
        result.errors.push(`Connection failed: ${result.connection.message}`);
        return result;
      }

      console.log('✅ Connection successful');
    } catch (error) {
      result.errors.push(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }

    // Step 2: Initialize Airtable for further analysis
    try {
      console.log('🔧 Initializing Airtable instance...');
      initializeAirtable({
        apiKey: this.config.apiKey,
        baseId: this.config.baseId,
        tableName: this.config.tableName,
      });
      console.log('✅ Airtable initialized successfully');
    } catch (error) {
      result.errors.push(`Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }

    // Step 3: Get table information
    try {
      console.log('📊 Analyzing table structure...');
      const airtable = getAirtableInstance();
      
      // Get a few records to analyze structure
      const records = await airtable.fetchRecords(this.config.tableName, {
        maxRecords: 10,
      });

      if (records.length === 0) {
        result.errors.push('No records found in table');
        return result;
      }

      // Analyze fields
      const fields = Object.keys(records[0].fields);
      const sampleRecords = records.slice(0, 3);

      result.tableInfo = {
        recordCount: records.length,
        fields,
        sampleRecords,
      };

      console.log(`✅ Table analysis complete. Found ${fields.length} fields`);
    } catch (error) {
      result.errors.push(`Table analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 4: Analyze images
    try {
      console.log('🖼️ Analyzing images...');
      
      // Check if nameField exists in the table, if not use skuField as fallback
      const availableFields = result.tableInfo?.fields || [];
      const nameField = availableFields.includes(this.config.nameField) ? this.config.nameField : this.config.skuField;
      
      console.log(`Using nameField: ${nameField} (available fields: ${availableFields.join(', ')})`);
      
      const products = await getAllProductsWithImages(this.config.tableName, {
        imageField: this.config.imageField,
        skuField: this.config.skuField,
        nameField: nameField,
        maxRecords: 50, // Limit for debugging
        validateImages: true,
      });

      const totalProducts = products.length;
      const productsWithImages = products.filter(p => p.imageUrls.length > 0).length;
      const totalImages = products.reduce((sum, p) => sum + p.imageUrls.length, 0);
      
      // Validate image URLs
      const invalidUrls: string[] = [];
      const sampleImages: Array<{
        sku: string;
        name: string;
        imageUrls: string[];
        isValid: boolean[];
      }> = [];

      for (const product of products.slice(0, 5)) { // Analyze first 5 products
        const isValid: boolean[] = [];
        
        for (const url of product.imageUrls) {
          try {
            const response = await fetch(url, { method: 'HEAD' });
            isValid.push(response.ok);
            if (!response.ok) {
              invalidUrls.push(url);
            }
          } catch (error) {
            isValid.push(false);
            invalidUrls.push(url);
          }
        }

        sampleImages.push({
          sku: product.sku,
          name: product.name,
          imageUrls: product.imageUrls,
          isValid,
        });
      }

      const validImages = totalImages - invalidUrls.length;

      result.imageAnalysis = {
        totalProducts,
        productsWithImages,
        totalImages,
        validImages,
        invalidUrls,
        sampleImages,
      };

      console.log(`✅ Image analysis complete. ${validImages}/${totalImages} images are valid`);
    } catch (error) {
      result.errors.push(`Image analysis error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  async testSpecificSku(sku: string): Promise<{
    success: boolean;
    record?: any;
    images?: string[];
    errors: string[];
  }> {
    const result = {
      success: false,
      record: undefined as any,
      images: [] as string[],
      errors: [] as string[],
    };

    try {
      console.log(`🔍 Testing SKU: ${sku}`);
      
      const airtable = getAirtableInstance();
      const records = await airtable.searchRecords(this.config.tableName, this.config.skuField, sku);

      if (records.length === 0) {
        result.errors.push(`No record found for SKU: ${sku}`);
        return result;
      }

      const record = records[0];
      result.record = record;

      // Extract images
      const attachments = record.fields[this.config.imageField];
      if (attachments) {
        const imageUrls = Array.isArray(attachments) 
          ? attachments.map((attachment: any) => attachment.url)
          : [attachments.url];
        
        result.images = imageUrls;
        result.success = true;

        console.log(`✅ Found ${imageUrls.length} images for SKU: ${sku}`);
      } else {
        result.errors.push(`No images found for SKU: ${sku}`);
      }
    } catch (error) {
      result.errors.push(`Error testing SKU: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  generateReport(diagnosticResult: DebugResult): string {
    let report = '📋 Airtable Diagnostic Report\n';
    report += '=' .repeat(50) + '\n\n';

    // Connection Status
    report += '🔗 Connection Status:\n';
    report += `Status: ${diagnosticResult.connection.success ? '✅ Success' : '❌ Failed'}\n`;
    report += `Message: ${diagnosticResult.connection.message}\n`;
    if (diagnosticResult.connection.details) {
      report += `Details: ${JSON.stringify(diagnosticResult.connection.details, null, 2)}\n`;
    }
    report += '\n';

    // Table Information
    if (diagnosticResult.tableInfo) {
      report += '📊 Table Information:\n';
      report += `Record Count: ${diagnosticResult.tableInfo.recordCount}\n`;
      report += `Fields: ${diagnosticResult.tableInfo.fields.join(', ')}\n`;
      report += '\n';
    }

    // Image Analysis
    if (diagnosticResult.imageAnalysis) {
      report += '🖼️ Image Analysis:\n';
      report += `Total Products: ${diagnosticResult.imageAnalysis.totalProducts}\n`;
      report += `Products with Images: ${diagnosticResult.imageAnalysis.productsWithImages}\n`;
      report += `Total Images: ${diagnosticResult.imageAnalysis.totalImages}\n`;
      report += `Valid Images: ${diagnosticResult.imageAnalysis.validImages}\n`;
      report += `Invalid Images: ${diagnosticResult.imageAnalysis.invalidUrls.length}\n`;
      report += '\n';

      if (diagnosticResult.imageAnalysis.sampleImages.length > 0) {
        report += '📸 Sample Images:\n';
        diagnosticResult.imageAnalysis.sampleImages.forEach((sample, index) => {
          report += `${index + 1}. SKU: ${sample.sku}\n`;
          report += `   Name: ${sample.name}\n`;
          report += `   Images: ${sample.imageUrls.length}\n`;
          sample.imageUrls.forEach((url, urlIndex) => {
            const status = sample.isValid[urlIndex] ? '✅' : '❌';
            report += `   ${status} ${url}\n`;
          });
          report += '\n';
        });
      }
    }

    // Errors
    if (diagnosticResult.errors.length > 0) {
      report += '❌ Errors:\n';
      diagnosticResult.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += '\n';
    }

    // Recommendations
    report += '💡 Recommendations:\n';
    if (diagnosticResult.connection.success) {
      report += '✅ Connection is working properly\n';
    } else {
      report += '❌ Check your API key, base ID, and table name\n';
      report += '❌ Ensure your API key has read permissions\n';
    }

    if (diagnosticResult.imageAnalysis) {
      const validPercentage = (diagnosticResult.imageAnalysis.validImages / diagnosticResult.imageAnalysis.totalImages) * 100;
      if (validPercentage < 80) {
        report += '⚠️ Many image URLs appear to be invalid or expired\n';
        report += '⚠️ Consider refreshing image URLs in Airtable\n';
      }
    }

    return report;
  }
}

// Export a simple function for easy use
export const debugAirtable = async (config: DebugConfig): Promise<string> => {
  const debuggerInstance = new AirtableDebugger(config);
  const result = await debuggerInstance.runFullDiagnostic();
  return debuggerInstance.generateReport(result);
};

export default AirtableDebugger;
