import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/hooks/useNotifications';
import { useProducts, CSVProduct } from '@/hooks/useProducts';
import { useBrands } from '@/hooks/useBrands';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Info, X, FileSpreadsheet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface UploadResult {
  product: CSVProduct;
  success: boolean;
  error?: string;
  brandFound?: boolean;
}

interface BatchProgress {
  current: number;
  total: number;
  batchSize: number;
  currentBatch: number;
  totalBatches: number;
}

export const ProductBulkUploadDialog = () => {
  const [open, setOpen] = useState(false);
  const [csvData, setCsvData] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'text' | 'file'>('text');
  const [parsedProducts, setParsedProducts] = useState<CSVProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);

  const { addNotification } = useNotifications();
  const { bulkCreateProducts, bulkUpdateProducts, bulkDeleteProducts } = useProducts();
  const { brands } = useBrands();

  // Batch processing configuration
  const BATCH_SIZE = 500; // Process 500 products at a time
  const MAX_PREVIEW_ROWS = 1000; // Show preview for first 1000 rows only

  // Reset all state when dialog opens/closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset all state when dialog closes
      resetForm();
    }
  };

  const requiredHeaders = ['action', 'sku', 'brand', 'product_name'];
  const optionalHeaders = ['description', 'cost_price', 'selling_price', 'color', 'size', 'category', 'image_url'];

  const csvTemplate = `action,sku,brand,product_name,description,cost_price,selling_price,color,size,category,image_url
add,SKU001,Brand Name,Product Name,Product description,250.00,450.00,Blue,M,Clothing,https://example.com/image1.jpg
update,SKU002,Another Brand,Updated Product,Updated description,800.00,1200.00,Red,L,Electronics,https://example.com/image2.jpg
remove,SKU003,Old Brand,Old Product,,,,,,,`;

  const instructions = [
    "📋 **Required Fields**: Action, SKU, Brand, Product Name",
    "🔄 **Actions**: Use 'add' for new products, 'update' for existing products, 'remove' for deletion",
    "💰 **Pricing**: Cost Price and Selling Price should be numbers (e.g., 250.00)",
    "🏷️ **Brands**: Use brand names (not IDs) - must exist in the system",
    "📝 **Format**: Use commas to separate values, no spaces around commas",
    "🔍 **Validation**: SKU must be unique for new products, prices must be valid numbers",
    "💡 **Tip**: Download the template to see the exact format",
    "⚠️ **Brand Check**: Make sure all brands are created in the Brands page first",
    "🖼️ **Images**: Use image_url field for product images (optional)",
    "⚪ **Blank Rows**: Empty rows are automatically skipped during upload",
    "📊 **Large Files**: Supports files with 10,000+ products (processed in batches)",
    "🔄 **Update Logic**: Updates existing products by SKU, ignores if SKU doesn't exist",
    "🗑️ **Remove Logic**: Deletes products by SKU, ignores if SKU doesn't exist"
  ];

  const validateCSV = (csvText: string): { products: CSVProduct[], errors: string[] } => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { products: [], errors: ['CSV must have at least a header row and one data row'] };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return { 
        products: [], 
        errors: [`Missing required headers: ${missingHeaders.join(', ')}`] 
      };
    }

    const products: CSVProduct[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip completely empty lines or lines with only commas
      if (!line || line.split(',').every(cell => cell.trim() === '')) {
        continue;
      }

      const values = line.split(',').map(v => v.trim());
      const product: CSVProduct = {
        sku: '',
        brand: '',
        product_name: '',
      };

      // Map values to product object
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'action':
            product.action = value as 'add' | 'update' | 'remove';
            break;
          case 'sku':
            product.sku = value;
            break;
          case 'brand':
            product.brand = value;
            break;
          case 'product_name':
            product.product_name = value;
            break;
          case 'description':
            product.description = value || undefined;
            break;
          case 'cost_price':
            product.cost_price = value ? parseFloat(value) : undefined;
            break;
          case 'selling_price':
            product.selling_price = value ? parseFloat(value) : undefined;
            break;
          case 'color':
            product.color = value || undefined;
            break;
          case 'size':
            product.size = value || undefined;
            break;
          case 'category':
            product.category = value || undefined;
            break;
          case 'image_url':
            product.image_url = value || undefined;
            break;
        }
      });

      // Only validate if the row has some data (not completely empty)
      const hasData = product.action && product.sku;

      if (!hasData) {
        // Skip completely empty rows
        continue;
      }

      // Validate required fields based on action
      if (!product.action) {
        errors.push(`Row ${i + 1}: Action is required`);
      } else if (!['add', 'update', 'remove'].includes(product.action)) {
        errors.push(`Row ${i + 1}: Action must be 'add', 'update', or 'remove'`);
      }

      if (!product.sku) {
        errors.push(`Row ${i + 1}: SKU is required`);
      }

      // For add and update actions, validate additional required fields
      if (product.action === 'add' || product.action === 'update') {
        if (!product.brand) {
          errors.push(`Row ${i + 1}: Brand is required for ${product.action} action`);
        }
        if (!product.product_name) {
          errors.push(`Row ${i + 1}: Product name is required for ${product.action} action`);
        }
      }

      // Validate numeric fields
      if (product.cost_price !== undefined && isNaN(product.cost_price)) {
        errors.push(`Row ${i + 1}: Cost price must be a valid number`);
      }
      if (product.selling_price !== undefined && isNaN(product.selling_price)) {
        errors.push(`Row ${i + 1}: Selling price must be a valid number`);
      }

      products.push(product);
    }

    return { products, errors };
  };

  const parseExcelFile = async (file: File): Promise<{ products: CSVProduct[], errors: string[] }> => {
    try {
      // For Excel files, we'll need to use a library like SheetJS
      // For now, we'll show an error and suggest using CSV
      return {
        products: [],
        errors: ['Excel files are not yet supported. Please convert to CSV format or use the text input method.']
      };
    } catch (error) {
      return {
        products: [],
        errors: ['Failed to parse Excel file. Please check the file format.']
      };
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrors([]);
    setUploadResults([]);
    setShowResults(false);

    // Validate file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setErrors(['Please select a valid CSV or Excel file (.csv, .xlsx, .xls)']);
      return;
    }

    try {
      if (file.type === 'text/csv' || fileExtension === '.csv') {
        // Handle CSV file
        const text = await file.text();
        const { products, errors: validationErrors } = validateCSV(text);
        setParsedProducts(products);
        setErrors(validationErrors);
        setCsvData(text);
      } else {
        // Handle Excel file
        const { products, errors: validationErrors } = await parseExcelFile(file);
        setParsedProducts(products);
        setErrors(validationErrors);
      }
    } catch (error) {
      setErrors(['Failed to read file. Please check the file format and try again.']);
    }
  };

  const handleCSVChange = (value: string) => {
    setCsvData(value);
    setSelectedFile(null);
    setErrors([]);
    setUploadResults([]);
    setShowResults(false);
    
    if (value.trim()) {
      const { products, errors: validationErrors } = validateCSV(value);
      setParsedProducts(products);
      setErrors(validationErrors);
    } else {
      setParsedProducts([]);
    }
  };

  const handleUpload = async () => {
    if (parsedProducts.length === 0) {
      addNotification({
        title: 'No Products to Upload',
        message: 'Please add valid CSV data first',
        type: 'error',
      });
      return;
    }

    if (errors.length > 0) {
      addNotification({
        title: 'Validation Errors',
        message: 'Please fix the errors before uploading',
        type: 'error',
      });
      return;
    }

    setIsProcessing(true);
    setBatchProgress({ 
      current: 0, 
      total: parsedProducts.length, 
      batchSize: BATCH_SIZE, 
      currentBatch: 0, 
      totalBatches: Math.ceil(parsedProducts.length / BATCH_SIZE) 
    });

    try {
      let currentIndex = 0;
      const totalBatches = Math.ceil(parsedProducts.length / BATCH_SIZE);
      const results: UploadResult[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const start = currentIndex;
        const end = Math.min(start + BATCH_SIZE, parsedProducts.length);
        const currentBatchProducts = parsedProducts.slice(start, end);

        // Update progress
        setBatchProgress(prev => prev ? {
          ...prev,
          currentBatch: i + 1,
          current: start
        } : null);

        // Process current batch
        const batchResults: UploadResult[] = await Promise.all(currentBatchProducts.map(async csvProduct => {
          const brand = brands.find(b => b.brand.toLowerCase() === csvProduct.brand.toLowerCase());
          
          if (!brand) {
            return {
              product: csvProduct,
              success: false,
              error: `Brand "${csvProduct.brand}" not found. Please ensure it exists in the Brands page.`,
              brandFound: false
            };
          }

          let result: UploadResult;
          switch (csvProduct.action) {
            case 'add':
              const addSuccess = await bulkCreateProducts([{
                sku: csvProduct.sku,
                brand_id: brand.id,
                product_name: csvProduct.product_name,
                description: csvProduct.description,
                cost_price: csvProduct.cost_price,
                selling_price: csvProduct.selling_price,
                color: csvProduct.color,
                size: csvProduct.size,
                category: csvProduct.category,
                image_url: csvProduct.image_url,
              }]);
              result = {
                product: csvProduct,
                success: addSuccess,
                error: addSuccess ? undefined : `Failed to add product with SKU: ${csvProduct.sku}`,
                brandFound: true
              };
              break;
            case 'update':
              const updateSuccess = await bulkUpdateProducts([{
                sku: csvProduct.sku,
                brand_id: brand.id,
                product_name: csvProduct.product_name,
                description: csvProduct.description,
                cost_price: csvProduct.cost_price,
                selling_price: csvProduct.selling_price,
                color: csvProduct.color,
                size: csvProduct.size,
                category: csvProduct.category,
                image_url: csvProduct.image_url,
              }]);
              result = {
                product: csvProduct,
                success: updateSuccess,
                error: updateSuccess ? undefined : `Failed to update product with SKU: ${csvProduct.sku}`,
                brandFound: true
              };
              break;
            case 'remove':
              const removeSuccess = await bulkDeleteProducts([csvProduct.sku]);
              result = {
                product: csvProduct,
                success: removeSuccess,
                error: removeSuccess ? undefined : `Failed to remove product with SKU: ${csvProduct.sku}`,
                brandFound: true
              };
              break;
            default:
              result = {
                product: csvProduct,
                success: false,
                error: `Unknown action: ${csvProduct.action}`,
                brandFound: true
              };
              break;
          }
          return result;
        }));

        results.push(...batchResults);
        currentIndex = end;

        // Small delay to prevent overwhelming the UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Filter out products with errors
      const validProducts = results.filter(r => r.success);
      const invalidProducts = results.filter(r => !r.success);

      if (validProducts.length === 0) {
        setUploadResults(results);
        setShowResults(true);
        addNotification({
          title: 'Upload Failed',
          message: 'No valid products to upload. Please check brand names or actions.',
          type: 'error',
        });
        return;
      }

      // Update results to show final status
      const finalResults = results.map(result => {
        if (result.success) {
          return { ...result, success: true };
        }
        return result;
      });

      setUploadResults(finalResults);
      setShowResults(true);

      // Count results by action type
      const addResults = finalResults.filter(r => r.product.action === 'add');
      const updateResults = finalResults.filter(r => r.product.action === 'update');
      const removeResults = finalResults.filter(r => r.product.action === 'remove');

      const addSuccess = addResults.filter(r => r.success).length;
      const addFailed = addResults.filter(r => !r.success).length;
      const updateSuccess = updateResults.filter(r => r.success).length;
      const updateFailed = updateResults.filter(r => !r.success).length;
      const removeSuccess = removeResults.filter(r => r.success).length;
      const removeFailed = removeResults.filter(r => !r.success).length;

      const totalSuccess = addSuccess + updateSuccess + removeSuccess;
      const totalFailed = addFailed + updateFailed + removeFailed;

      if (totalFailed > 0) {
        let message = '';
        if (addSuccess > 0 || addFailed > 0) message += `Added: ${addSuccess}/${addSuccess + addFailed}, `;
        if (updateSuccess > 0 || updateFailed > 0) message += `Updated: ${updateSuccess}/${updateSuccess + updateFailed}, `;
        if (removeSuccess > 0 || removeFailed > 0) message += `Removed: ${removeSuccess}/${removeSuccess + removeFailed}`;
        
        addNotification({
          title: 'Partial Operation Success',
          message: message,
          type: 'warning',
        });
      } else {
        let message = '';
        if (addSuccess > 0) message += `Added: ${addSuccess}, `;
        if (updateSuccess > 0) message += `Updated: ${updateSuccess}, `;
        if (removeSuccess > 0) message += `Removed: ${removeSuccess}`;
        
        addNotification({
          title: 'Bulk Operations Successful',
          message: message,
          type: 'success',
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      addNotification({
        title: 'Upload Failed',
        message: error instanceof Error ? error.message : 'Failed to upload products',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setCsvData('');
    setSelectedFile(null);
    setParsedProducts([]);
    setErrors([]);
    setUploadResults([]);
    setShowResults(false);
    setUploadMethod('text');
    setIsProcessing(false);
    setBatchProgress(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Operations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Product Operations</DialogTitle>
          <DialogDescription>
            Add, update, or remove multiple products using CSV format. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Upload Instructions</h4>
            </div>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="text-sm text-blue-800" dangerouslySetInnerHTML={{ __html: instruction }} />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {!showResults && (
            <>
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'text' | 'file')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    File Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv-data">CSV Data</Label>
                    <Textarea
                      id="csv-data"
                      placeholder="Paste your CSV data here..."
                      value={csvData}
                      onChange={(e) => handleCSVChange(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Drag and drop your CSV or Excel file here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Supported formats: .csv, .xlsx, .xls
                          </p>
                        </div>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          Choose File
                        </Button>
                      </div>
                    </div>
                    {selectedFile && (
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {errors.map((error, index) => (
                        <div key={index} className="text-sm">{error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {parsedProducts.length > 0 && errors.length === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">
                      Preview ({parsedProducts.length} products)
                      {parsedProducts.length > MAX_PREVIEW_ROWS && (
                        <span className="text-sm text-muted-foreground ml-2">
                          (showing first {MAX_PREVIEW_ROWS} rows)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                    {parsedProducts.slice(0, MAX_PREVIEW_ROWS).map((product, index) => (
                      <div key={index} className="text-sm py-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant={
                              product.action === 'add' ? 'default' : 
                              product.action === 'update' ? 'secondary' : 
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {product.action.toUpperCase()}
                          </Badge>
                          <strong>{product.sku}</strong>
                        </div>
                        {product.action !== 'remove' && (
                          <>
                            <div><strong>Product:</strong> {product.product_name} ({product.brand})</div>
                            {product.description && <div><strong>Description:</strong> {product.description}</div>}
                            {(product.cost_price || product.selling_price) && (
                              <div><strong>Pricing:</strong> ₹{product.cost_price || 0} / ₹{product.selling_price || 0}</div>
                            )}
                            {product.image_url && (
                              <div><strong>Image:</strong> <a href={product.image_url} target="_blank" rel="noopener noreferrer" className="underline">{product.image_url}</a></div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                    {parsedProducts.length > MAX_PREVIEW_ROWS && (
                      <div className="text-sm text-muted-foreground">
                        ... and {parsedProducts.length - MAX_PREVIEW_ROWS} more products
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brand Validation Preview */}
              {parsedProducts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">Brand Validation</span>
                  </div>
                  <div className="border rounded-lg p-4 max-h-32 overflow-y-auto">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Available Brands ({brands.length}):</span>
                        <span className="text-xs text-muted-foreground">Click to copy</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {brands.map((brand) => (
                          <Badge
                            key={brand.id}
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-gray-100"
                            onClick={() => navigator.clipboard.writeText(brand.brand)}
                            title={`Click to copy: ${brand.brand}`}
                          >
                            {brand.brand}
                          </Badge>
                        ))}
                      </div>
                      {brands.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                          No brands found. Please create brands in the Brands page first.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={isProcessing || parsedProducts.length === 0 || errors.length > 0}
                >
                  {isProcessing ? 'Processing...' : `Process ${parsedProducts.length} Operations`}
                </Button>
              </div>
            </>
          )}

          {/* Upload Results */}
          {showResults && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Upload Results</h3>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Upload More
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-medium">{result.product.sku}</span>
                          <Badge 
                            variant={
                              result.product.action === 'add' ? 'default' : 
                              result.product.action === 'update' ? 'secondary' : 
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {result.product.action.toUpperCase()}
                          </Badge>
                          <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                            {result.success ? "Success" : "Error"}
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <div><strong>Action:</strong> {result.product.action}</div>
                          {result.product.action !== 'remove' && (
                            <>
                              <div><strong>Product:</strong> {result.product.product_name}</div>
                              <div><strong>Brand:</strong> {result.product.brand}</div>
                              {result.product.description && (
                                <div><strong>Description:</strong> {result.product.description}</div>
                              )}
                              {(result.product.cost_price || result.product.selling_price) && (
                                <div>
                                  <strong>Pricing:</strong> ₹{result.product.cost_price || 0} / ₹{result.product.selling_price || 0}
                                </div>
                              )}
                              {result.product.color && <div><strong>Color:</strong> {result.product.color}</div>}
                              {result.product.size && <div><strong>Size:</strong> {result.product.size}</div>}
                              {result.product.category && <div><strong>Category:</strong> {result.product.category}</div>}
                              {result.product.image_url && (
                                <div><strong>Image URL:</strong> <a href={result.product.image_url} target="_blank" rel="noopener noreferrer" className="underline">{result.product.image_url}</a></div>
                              )}
                            </>
                          )}
                        </div>
                        {result.error && (
                          <div className="text-sm text-red-600 mt-2">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Batch Progress */}
          {isProcessing && batchProgress && (
            <div className="mt-4">
              <h4 className="text-lg font-medium mb-2">Upload Progress</h4>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Processing batch {batchProgress.currentBatch} of {batchProgress.totalBatches}</span>
                <span>Processed {batchProgress.current} of {batchProgress.total} products</span>
              </div>
              <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
