import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { useAirtableImages } from '@/hooks/useAirtableImages';
import { testAirtableConnection } from '@/lib/airtable';
import { debugAirtable } from '@/utils/airtableDebugger';
import { Loader2, CheckCircle, XCircle, RefreshCw, TestTube, Settings, Image as ImageIcon, Bug } from 'lucide-react';

interface AirtableImageManagerProps {
  onImagesLoaded?: () => void;
}

export const AirtableImageManager: React.FC<AirtableImageManagerProps> = ({ 
  onImagesLoaded 
}) => {
  const { addNotification } = useNotifications();
  const {
    productImages,
    brandImages,
    loading,
    error,
    initialize,
    getProductImage,
    getBrandImage,
    refreshImages,
    fetchProductImage,
    fetchAllProductImages,
    fetchAllBrandImages,
  } = useAirtableImages();

  const [config, setConfig] = useState({
    apiKey: '',
    baseId: '',
    productsTable: 'sku', // Updated to match your table name
    brandsTable: '', // Disabled brand images
    imageField: 'image1', // Updated to match your field name
    skuField: 'sku', // Updated to match your field name
    nameField: '', // Leave empty if no name field exists
    brandNameField: 'Name',
    brandLogoField: 'Logo',
  });

  const [isConfigured, setIsConfigured] = useState(false);
  const [testSku, setTestSku] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [debugReport, setDebugReport] = useState<string>('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Load configuration from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('airtable-image-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setIsConfigured(true);
      } catch (err) {
        console.error('Failed to parse saved Airtable config:', err);
      }
    }
  }, []);

  // Watch for productImages changes and send pending notifications
  useEffect(() => {
    if (pendingNotification) {
      const updatedNotification = {
        ...pendingNotification,
        message: pendingNotification.message.includes('loaded') 
          ? `${pendingNotification.message} (${productImages.size} images)`
          : pendingNotification.message
      };
      addNotification(updatedNotification);
      setPendingNotification(null);
    }
  }, [productImages.size, pendingNotification, addNotification]);

  // Save configuration to localStorage
  const saveConfig = (newConfig: typeof config) => {
    localStorage.setItem('airtable-image-config', JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  // Test Airtable connection
  const handleTestConnection = async () => {
    if (!config.apiKey || !config.baseId || !config.productsTable) {
      addNotification({
        title: 'Configuration Required',
        message: 'Please fill in API Key, Base ID, and Products Table name',
        type: 'warning',
      });
      return;
    }

    setConnectionStatus('testing');
    setConnectionDetails(null);

    try {
      const result = await testAirtableConnection({
        apiKey: config.apiKey,
        baseId: config.baseId,
        tableName: config.productsTable,
      });

      setConnectionDetails(result);
      
      if (result.success) {
        setConnectionStatus('success');
        addNotification({
          title: 'Connection Successful',
          message: `Connected to Airtable base: ${config.baseId}`,
          type: 'success',
        });
      } else {
        setConnectionStatus('error');
        addNotification({
          title: 'Connection Failed',
          message: result.message,
          type: 'error',
        });
      }
    } catch (err) {
      setConnectionStatus('error');
      setConnectionDetails({ success: false, message: err instanceof Error ? err.message : 'Unknown error' });
      addNotification({
        title: 'Connection Error',
        message: err instanceof Error ? err.message : 'Failed to test connection',
        type: 'error',
      });
    }
  };

  // Initialize Airtable and load images
  const handleInitialize = async () => {
    if (!config.apiKey || !config.baseId || !config.productsTable) {
      addNotification({
        title: 'Configuration Required',
        message: 'Please fill in all required fields',
        type: 'warning',
      });
      return;
    }

    try {
      // Initialize Airtable
      await initialize({
        apiKey: config.apiKey,
        baseId: config.baseId,
        productsTable: config.productsTable,
        brandsTable: config.brandsTable,
        imageField: config.imageField,
        skuField: config.skuField,
        nameField: config.nameField,
      });

      setIsConfigured(true);
      saveConfig(config);
      
      // Load all product images
      await fetchAllProductImages();
      
      // Notify parent component if callback provided
      if (onImagesLoaded) {
        onImagesLoaded();
      }
      
      // Set pending notification to be sent when productImages state updates
      setPendingNotification({
        title: 'Airtable Connected',
        message: `Successfully connected to Airtable and loaded images`,
        type: 'success',
      });
      
    } catch (err) {
      addNotification({
        title: 'Connection Failed',
        message: err instanceof Error ? err.message : 'Failed to connect to Airtable',
        type: 'error',
      });
    }
  };

  // Test connection with a specific SKU
  const handleTestSku = async () => {
    if (!testSku.trim()) {
      addNotification({
        title: 'Test SKU Required',
        message: 'Please enter a SKU to test',
        type: 'warning',
      });
      return;
    }

    try {
      const result = await fetchProductImage(testSku);
      setTestResult(result);
      
      if (result) {
        addNotification({
          title: 'Test Successful',
          message: `Found image for SKU: ${testSku} (${result.imageUrls.length} images)`,
          type: 'success',
        });
      } else {
        addNotification({
          title: 'Test Failed',
          message: `No image found for SKU: ${testSku}`,
          type: 'warning',
        });
      }
    } catch (err) {
      addNotification({
        title: 'Test Failed',
        message: err instanceof Error ? err.message : 'Failed to test connection',
        type: 'error',
      });
    }
  };

  // Refresh all images
  const handleRefreshImages = async () => {
    try {
      await refreshImages();
      
      // Notify parent component if callback provided
      if (onImagesLoaded) {
        onImagesLoaded();
      }
      
      // Set pending notification to be sent when productImages state updates
      setPendingNotification({
        title: 'Images Refreshed',
        message: `Loaded images from Airtable`,
        type: 'success',
      });
      
    } catch (err) {
      addNotification({
        title: 'Refresh Failed',
        message: err instanceof Error ? err.message : 'Failed to refresh images',
        type: 'error',
      });
    }
  };

  // Update configuration
  const handleConfigChange = (field: keyof typeof config, value: string) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    
    // Reset connection status when config changes
    setConnectionStatus('idle');
    setConnectionDetails(null);
  };

  // Run full diagnostic
  const handleRunDiagnostic = async () => {
    if (!config.apiKey || !config.baseId || !config.productsTable) {
      addNotification({
        title: 'Configuration Required',
        message: 'Please fill in API Key, Base ID, and Products Table name',
        type: 'warning',
      });
      return;
    }

    setIsDebugging(true);
    setDebugReport('');

    try {
      const report = await debugAirtable({
        apiKey: config.apiKey,
        baseId: config.baseId,
        tableName: config.productsTable,
        imageField: config.imageField,
        skuField: config.skuField,
        nameField: config.nameField || config.skuField, // Use SKU field if no name field
      });

      setDebugReport(report);
      
      addNotification({
        title: 'Diagnostic Complete',
        message: 'Full diagnostic report generated. Check the debug section below.',
        type: 'success',
      });
    } catch (err) {
      addNotification({
        title: 'Diagnostic Failed',
        message: err instanceof Error ? err.message : 'Failed to run diagnostic',
        type: 'error',
      });
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Airtable Configuration
          </CardTitle>
          <CardDescription>
            Configure your Airtable connection to fetch product images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Airtable API key"
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseId">Base ID *</Label>
              <Input
                id="baseId"
                placeholder="Enter your Airtable base ID"
                value={config.baseId}
                onChange={(e) => handleConfigChange('baseId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productsTable">Products Table *</Label>
              <Input
                id="productsTable"
                placeholder="Enter table name (e.g., sku)"
                value={config.productsTable}
                onChange={(e) => handleConfigChange('productsTable', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageField">Image Field *</Label>
              <Input
                id="imageField"
                placeholder="Enter image field name (e.g., image1)"
                value={config.imageField}
                onChange={(e) => handleConfigChange('imageField', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skuField">SKU Field *</Label>
              <Input
                id="skuField"
                placeholder="Enter SKU field name (e.g., sku)"
                value={config.skuField}
                onChange={(e) => handleConfigChange('skuField', e.target.value)}
              />
            </div>
                         <div className="space-y-2">
               <Label htmlFor="nameField">Name Field (Optional)</Label>
               <Input
                 id="nameField"
                 placeholder="Leave empty if no name field exists"
                 value={config.nameField}
                 onChange={(e) => handleConfigChange('nameField', e.target.value)}
               />
               <p className="text-xs text-muted-foreground">
                 If no name field exists, the SKU will be used as the display name
               </p>
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={loading || connectionStatus === 'testing'}
              variant="outline"
              size="sm"
            >
              {connectionStatus === 'testing' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>

            <Button
              onClick={handleRunDiagnostic}
              disabled={loading || isDebugging}
              variant="outline"
              size="sm"
            >
              {isDebugging ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bug className="h-4 w-4 mr-2" />
              )}
              Full Diagnostic
            </Button>

            {connectionStatus === 'success' && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}

            {connectionStatus === 'error' && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                Connection Failed
              </Badge>
            )}
          </div>

          {connectionDetails && (
            <div className="text-sm text-muted-foreground">
              {connectionDetails.success ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {connectionDetails.message}
                  {connectionDetails.details && (
                    <span className="text-xs">
                      (Table: {connectionDetails.details.tableName}, Records: {connectionDetails.details.recordCount})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  {connectionDetails.message}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleInitialize}
              disabled={loading || connectionStatus !== 'success'}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-2" />
              )}
              Initialize & Load Images
            </Button>

            {isConfigured && (
              <Button
                onClick={handleRefreshImages}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh Images
              </Button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test SKU Lookup</CardTitle>
          <CardDescription>
            Test if a specific SKU has images in your Airtable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter SKU to test"
              value={testSku}
              onChange={(e) => setTestSku(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTestSku()}
            />
            <Button
              onClick={handleTestSku}
              disabled={!testSku.trim() || loading}
              variant="outline"
            >
              Test SKU
            </Button>
          </div>

          {testResult && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Test Result for SKU: {testSku}</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Record ID:</strong> {testResult.recordId}</div>
                <div><strong>Name:</strong> {testResult.name}</div>
                <div><strong>Images Found:</strong> {testResult.imageUrls.length}</div>
                {testResult.imageUrls.length > 0 && (
                  <div className="mt-2">
                    <strong>Image URLs:</strong>
                    <div className="mt-1 space-y-1">
                      {testResult.imageUrls.map((url: string, index: number) => (
                        <div key={index} className="text-xs break-all bg-white p-2 rounded border">
                          {url}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Image Statistics</CardTitle>
            <CardDescription>
              Current status of loaded images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{productImages.size}</div>
                <div className="text-sm text-muted-foreground">Product Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{brandImages.size}</div>
                <div className="text-sm text-muted-foreground">Brand Images</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {debugReport && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Report</CardTitle>
            <CardDescription>
              Detailed diagnostic information about your Airtable connection and images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-xs whitespace-pre-wrap font-mono text-gray-800 max-h-96 overflow-y-auto">
                {debugReport}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
