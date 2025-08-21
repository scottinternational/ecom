import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Globe,
  AlertCircle,
  Info
} from "lucide-react";
import { useMarketplaceSettings } from "@/hooks/useMarketplaceSettings";
import { useNotifications } from "@/hooks/useNotifications";

export const MarketplaceIntegrationTest: React.FC = () => {
  const { settings, testMarketplaceConnection, syncMarketplaceData } = useMarketplaceSettings();
  const { addNotification } = useNotifications();
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

  const handleTestConnection = async () => {
    if (!selectedMarketplace) {
      addNotification({
        title: "No Marketplace Selected",
        message: "Please select a marketplace to test",
        type: "warning",
      });
      return;
    }

    setTesting(true);
    try {
      const success = await testMarketplaceConnection(selectedMarketplace);
      setTestResults(prev => ({ ...prev, [selectedMarketplace]: success }));
      
      if (success) {
        addNotification({
          title: "Connection Test Successful",
          message: `Successfully connected to ${selectedMarketplace}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Connection Test Failed",
          message: `Failed to connect to ${selectedMarketplace}`,
          type: "error",
        });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [selectedMarketplace]: false }));
      addNotification({
        title: "Connection Test Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    if (!selectedMarketplace) {
      addNotification({
        title: "No Marketplace Selected",
        message: "Please select a marketplace to sync",
        type: "warning",
      });
      return;
    }

    setSyncing(true);
    try {
      const success = await syncMarketplaceData(selectedMarketplace);
      
      if (success) {
        addNotification({
          title: "Data Sync Successful",
          message: `Successfully synced data from ${selectedMarketplace}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Data Sync Failed",
          message: `Failed to sync data from ${selectedMarketplace}`,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Data Sync Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-primary" />
          Marketplace Integration Test
        </CardTitle>
        <CardDescription>
          Test marketplace connections and data synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Marketplace Selection */}
        <div className="space-y-2">
          <Label htmlFor="marketplace-select">Select Marketplace</Label>
          <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a marketplace to test" />
            </SelectTrigger>
            <SelectContent>
              {settings?.integrations.map((marketplace) => (
                <SelectItem key={marketplace.name} value={marketplace.name}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(marketplace.status)}
                    <span>{marketplace.display_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {marketplace.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Test Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleTestConnection}
            disabled={!selectedMarketplace || testing}
            variant="outline"
            size="sm"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
          
          <Button
            onClick={handleSyncData}
            disabled={!selectedMarketplace || syncing}
            variant="outline"
            size="sm"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Data
          </Button>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Test Results</Label>
            <div className="space-y-1">
              {Object.entries(testResults).map(([marketplace, success]) => (
                <div key={marketplace} className="flex items-center gap-2 text-sm">
                  {success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="capitalize">{marketplace}</span>
                  <Badge variant={success ? "success" : "destructive"} className="text-xs">
                    {success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Testing Information:</p>
            <ul className="space-y-1">
              <li>• Connection tests verify API credentials and access</li>
              <li>• Data sync tests retrieve sample data from the marketplace</li>
              <li>• Results are logged for debugging purposes</li>
              <li>• Failed tests may indicate credential or permission issues</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
