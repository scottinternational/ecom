import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useChannelSkuMappings, BulkUploadResult } from '@/hooks/useChannelSkuMappings';

interface ChannelSkuMappingBulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PreviewRow {
  channel_sku: string;
  channel_name: string;
  master_sku: string;
  status: string;
  isValid: boolean;
  error?: string;
}

export const ChannelSkuMappingBulkUploadDialog: React.FC<ChannelSkuMappingBulkUploadDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addNotification } = useNotifications();
  const { bulkUpload, downloadTemplate } = useChannelSkuMappings();
  
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [skipMasterSkuValidation, setSkipMasterSkuValidation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    currentBatch: number;
    totalBatches: number;
    processedRecords: number;
    totalRecords: number;
  } | null>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      addNotification({
        title: 'Invalid File',
        message: 'Please select a CSV file',
        type: 'error',
      });
      return;
    }

    setFile(selectedFile);
    await generatePreview(selectedFile);
  };

  const generatePreview = async (selectedFile: File) => {
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        addNotification({
          title: 'Invalid File',
          message: 'File must contain at least a header row and one data row',
          type: 'error',
        });
        return;
      }

      // Skip header row and take first 30 rows for preview
      const dataLines = lines.slice(1, 31);
      const preview: PreviewRow[] = [];

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
        
        const [channel_sku, channel_name, master_sku, status = 'Active'] = columns;
        
        let isValid = true;
        let error = '';

        // Validation
        if (columns.length < 3) {
          isValid = false;
          error = 'Insufficient columns';
        } else if (!channel_sku || !channel_name || !master_sku) {
          isValid = false;
          error = 'Missing required fields';
        } else if (status && !['Active', 'Inactive'].includes(status)) {
          isValid = false;
          error = 'Invalid status (must be Active or Inactive)';
        }

        preview.push({
          channel_sku: channel_sku || '',
          channel_name: channel_name || '',
          master_sku: master_sku || '',
          status: status || 'Active',
          isValid,
          error: error || undefined,
        });
      }

      setPreviewData(preview);
      setPreviewMode(true);
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to read file',
        type: 'error',
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(null);
    
    try {
      // Calculate total records for progress tracking
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const totalRecords = lines.length - 1; // Exclude header
      const BATCH_SIZE = 1000;
      const totalBatches = Math.ceil(totalRecords / BATCH_SIZE);
      
      setUploadProgress({
        currentBatch: 0,
        totalBatches,
        processedRecords: 0,
        totalRecords
      });

      const result: BulkUploadResult = await bulkUpload(file, skipMasterSkuValidation);
      
      if (result.success) {
        addNotification({
          title: 'Success',
          message: result.message,
          type: 'success',
        });
        onOpenChange(false);
        resetForm();
      } else {
        // Show detailed error information
        let errorMessage = result.message;
        if (result.errors && result.errors.length > 0) {
          if (result.errors.length <= 3) {
            errorMessage += `\n\nErrors:\n${result.errors.join('\n')}`;
          } else {
            errorMessage += `\n\nFirst 3 errors:\n${result.errors.slice(0, 3).join('\n')}\n\n... and ${result.errors.length - 3} more errors. Check console for full details.`;
          }
        }
        
        addNotification({
          title: 'Upload Failed',
          message: errorMessage,
          type: 'error',
        });
        
        // Log all errors to console for debugging
        if (result.errors && result.errors.length > 0) {
          console.error('Bulk upload errors:', result.errors);
        }
      }
    } catch (error) {
      console.error('Upload exception:', error);
      addNotification({
        title: 'Error',
        message: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setPreviewMode(false);
    setSkipMasterSkuValidation(false);
    setUploadProgress(null);
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate();
    addNotification({
      title: 'Template Downloaded',
      message: 'Channel SKU mappings template has been downloaded',
      type: 'success',
    });
  };

  const validCount = previewData.filter(row => row.isValid).length;
  const invalidCount = previewData.filter(row => !row.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Channel SKU Mappings</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import channel SKU mappings. The file should contain Channel_SKU, Channel_Name, Master_SKU, and optionally Status columns. Duplicate records will be updated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Download Template</h4>
              <p className="text-sm text-muted-foreground">
                Download the template file to see the required format
              </p>
            </div>
            <Button onClick={handleDownloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload">Select CSV File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{file.name}</span>
                <span>({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Upload Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Upload Options</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-validation"
                checked={skipMasterSkuValidation}
                onCheckedChange={(checked) => setSkipMasterSkuValidation(checked as boolean)}
              />
              <Label htmlFor="skip-validation" className="text-sm">
                Skip master SKU validation (use if products table is not available)
              </Label>
            </div>
            {skipMasterSkuValidation && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Master SKU validation will be skipped. This means the system won't verify if the master SKUs exist in the products table.
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {previewMode && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Preview (First 30 rows)</h4>
                <div className="flex items-center space-x-4">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {validCount} Valid
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      {invalidCount} Invalid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Channel SKU</th>
                        <th className="px-3 py-2 text-left font-medium">Channel Name</th>
                        <th className="px-3 py-2 text-left font-medium">Master SKU</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                        <th className="px-3 py-2 text-left font-medium">Validation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr
                          key={index}
                          className={`border-t ${
                            row.isValid ? 'bg-green-50' : 'bg-red-50'
                          }`}
                        >
                          <td className="px-3 py-2 font-mono">{row.channel_sku}</td>
                          <td className="px-3 py-2">{row.channel_name}</td>
                          <td className="px-3 py-2 font-mono">{row.master_sku}</td>
                          <td className="px-3 py-2">
                            <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
                              {row.status}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">
                            {row.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="flex items-center space-x-1">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-xs text-red-600">{row.error}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {invalidCount > 0 && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">Validation Errors Found</p>
                    <p>Please fix the errors in your CSV file before uploading.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {uploadProgress && (
            <div className="w-full mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Processing Batch {uploadProgress.currentBatch + 1} of {uploadProgress.totalBatches}
                </span>
                <span className="text-sm text-blue-600">
                  {uploadProgress.processedRecords} / {uploadProgress.totalRecords} records
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (uploadProgress.processedRecords / uploadProgress.totalRecords) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Processing in batches of 1000 records for better performance...
              </p>
            </div>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading || invalidCount > 0}
            className="min-w-[100px]"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
