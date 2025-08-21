import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Globe, 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  TestTube, 
  Save,
  X,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useMarketplaceSettings, MarketplaceIntegration } from "@/hooks/useMarketplaceSettings";
import { useNotifications } from "@/hooks/useNotifications";

interface MarketplaceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MarketplaceSettingsDialog: React.FC<MarketplaceSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { 
    settings, 
    loading, 
    error,
    connectMarketplace, 
    disconnectMarketplace, 
    updateMarketplaceIntegration,
    updateGlobalSettings,
    testMarketplaceConnection,
    syncMarketplaceData
  } = useMarketplaceSettings();
  
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState("integrations");
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [syncingData, setSyncingData] = useState<string | null>(null);

  const handleConnectMarketplace = async (marketplace: MarketplaceIntegration) => {
    try {
      const success = await connectMarketplace(marketplace.name, {
        api_key: marketplace.api_key,
        api_secret: marketplace.api_secret,
        access_token: marketplace.access_token,
        seller_id: marketplace.seller_id,
        store_url: marketplace.store_url
      });

      if (success) {
        addNotification({
          title: "Connected Successfully",
          message: `Successfully connected to ${marketplace.display_name}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Connection Failed",
          message: `Failed to connect to ${marketplace.display_name}`,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Connection Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      });
    }
  };

  const handleDisconnectMarketplace = async (marketplace: MarketplaceIntegration) => {
    try {
      const success = await disconnectMarketplace(marketplace.name);
      
      if (success) {
        addNotification({
          title: "Disconnected Successfully",
          message: `Successfully disconnected from ${marketplace.display_name}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Disconnection Failed",
          message: `Failed to disconnect from ${marketplace.display_name}`,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Disconnection Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      });
    }
  };

  const handleTestConnection = async (marketplaceName: string) => {
    setTestingConnection(marketplaceName);
    try {
      const success = await testMarketplaceConnection(marketplaceName);
      
      if (success) {
        addNotification({
          title: "Connection Test Successful",
          message: `Successfully tested connection to ${marketplaceName}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Connection Test Failed",
          message: `Failed to test connection to ${marketplaceName}`,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Connection Test Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const handleSyncData = async (marketplaceName: string) => {
    setSyncingData(marketplaceName);
    try {
      const success = await syncMarketplaceData(marketplaceName);
      
      if (success) {
        addNotification({
          title: "Data Sync Successful",
          message: `Successfully synced data from ${marketplaceName}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Data Sync Failed",
          message: `Failed to sync data from ${marketplaceName}`,
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
      setSyncingData(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary" className="flex items-center gap-1"><WifiOff className="h-3 w-3" />Disconnected</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    return new Date(lastSync).toLocaleString();
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Marketplace Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading marketplace settings...</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Marketplace Settings
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-destructive">Error loading marketplace settings</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Marketplace Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="global">Global Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations" className="space-y-4">
            <div className="grid gap-4">
              {settings?.integrations.map((marketplace) => (
                <Card key={marketplace.name} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {marketplace.logo_url && (
                          <img 
                            src={marketplace.logo_url} 
                            alt={marketplace.display_name}
                            className="h-8 w-8 object-contain"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{marketplace.display_name}</CardTitle>
                          <CardDescription>
                            {marketplace.is_active ? 'Active integration' : 'Inactive integration'}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(marketplace.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Connection Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">API Key</Label>
                          <Input
                            type="password"
                            value={marketplace.api_key || ''}
                            onChange={(e) => updateMarketplaceIntegration(marketplace.name, { api_key: e.target.value })}
                            placeholder="Enter API key"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">API Secret</Label>
                          <Input
                            type="password"
                            value={marketplace.api_secret || ''}
                            onChange={(e) => updateMarketplaceIntegration(marketplace.name, { api_secret: e.target.value })}
                            placeholder="Enter API secret"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Seller ID</Label>
                          <Input
                            value={marketplace.seller_id || ''}
                            onChange={(e) => updateMarketplaceIntegration(marketplace.name, { seller_id: e.target.value })}
                            placeholder="Enter seller ID"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Store URL</Label>
                          <Input
                            value={marketplace.store_url || ''}
                            onChange={(e) => updateMarketplaceIntegration(marketplace.name, { store_url: e.target.value })}
                            placeholder="Enter store URL"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {/* Sync Settings */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Sync Settings</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Sync Frequency</Label>
                            <Select
                              value={marketplace.sync_frequency}
                              onValueChange={(value: any) => updateMarketplaceIntegration(marketplace.name, { sync_frequency: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="manual">Manual</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={marketplace.settings.auto_sync}
                              onCheckedChange={(checked) => updateMarketplaceIntegration(marketplace.name, { 
                                settings: { ...marketplace.settings, auto_sync: checked }
                              })}
                            />
                            <Label className="text-sm">Auto Sync</Label>
                          </div>
                        </div>
                      </div>

                      {/* Sync Options */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Sync Options</Label>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={marketplace.settings.sync_orders}
                              onCheckedChange={(checked) => updateMarketplaceIntegration(marketplace.name, { 
                                settings: { ...marketplace.settings, sync_orders: checked as boolean }
                              })}
                            />
                            <Label className="text-sm">Orders</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={marketplace.settings.sync_inventory}
                              onCheckedChange={(checked) => updateMarketplaceIntegration(marketplace.name, { 
                                settings: { ...marketplace.settings, sync_inventory: checked as boolean }
                              })}
                            />
                            <Label className="text-sm">Inventory</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={marketplace.settings.sync_pricing}
                              onCheckedChange={(checked) => updateMarketplaceIntegration(marketplace.name, { 
                                settings: { ...marketplace.settings, sync_pricing: checked as boolean }
                              })}
                            />
                            <Label className="text-sm">Pricing</Label>
                          </div>
                        </div>
                      </div>

                      {/* Last Sync Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Last sync: {formatLastSync(marketplace.last_sync)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {marketplace.is_active ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestConnection(marketplace.name)}
                              disabled={testingConnection === marketplace.name}
                            >
                              {testingConnection === marketplace.name ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <TestTube className="h-4 w-4 mr-2" />
                              )}
                              Test Connection
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncData(marketplace.name)}
                              disabled={syncingData === marketplace.name}
                            >
                              {syncingData === marketplace.name ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              Sync Now
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDisconnectMarketplace(marketplace)}
                            >
                              <WifiOff className="h-4 w-4 mr-2" />
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConnectMarketplace(marketplace)}
                          >
                            <Wifi className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="global" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Marketplace Settings</CardTitle>
                <CardDescription>Configure default settings for all marketplace integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Default Sync Frequency</Label>
                    <Select
                      value={settings?.global_settings.default_sync_frequency}
                      onValueChange={(value: any) => updateGlobalSettings({ default_sync_frequency: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings?.global_settings.auto_sync_enabled}
                      onCheckedChange={(checked) => updateGlobalSettings({ auto_sync_enabled: checked })}
                    />
                    <Label className="text-sm">Enable Auto Sync</Label>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Notifications</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings?.global_settings.notification_enabled}
                        onCheckedChange={(checked) => updateGlobalSettings({ notification_enabled: checked })}
                      />
                      <Label className="text-sm">Enable Notifications</Label>
                    </div>
                    <div>
                      <Label className="text-sm">Notification Email</Label>
                      <Input
                        type="email"
                        value={settings?.global_settings.notification_email || ''}
                        onChange={(e) => updateGlobalSettings({ notification_email: e.target.value })}
                        placeholder="Enter notification email"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Webhook Endpoint</Label>
                  <Input
                    value={settings?.global_settings.webhook_endpoint || ''}
                    onChange={(e) => updateGlobalSettings({ webhook_endpoint: e.target.value })}
                    placeholder="Enter webhook endpoint URL"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Webhook URL for receiving real-time updates from marketplaces
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Advanced configuration options for marketplace integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Advanced Configuration</h3>
                  <p>Advanced marketplace settings and configuration options will be available here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
