import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Settings, 
  Key, 
  Wifi, 
  WifiOff, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Bell,
  Database,
  ShoppingCart,
  DollarSign,
  Package
} from "lucide-react";
import { useMarketplaces, MarketplaceIntegration } from "@/hooks/useMarketplaces";
import { useNotifications } from "@/hooks/useNotifications";

interface MarketplaceIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplace: any;
}

export const MarketplaceIntegrationDialog: React.FC<MarketplaceIntegrationDialogProps> = ({
  open,
  onOpenChange,
  marketplace,
}) => {
  // Don't render if marketplace is null or if dialog is not open
  if (!marketplace || !open) {
    return null;
  }

  const { 
    integrations, 
    createIntegration, 
    updateIntegration, 
    deleteIntegration,
    getIntegrationByMarketplaceId,
    testConnection,
    syncData,
    fetchIntegrations
  } = useMarketplaces();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState("credentials");
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    api_key: "",
    api_secret: "",
    seller_id: "",
    store_url: "",
    sync_frequency: "daily" as "hourly" | "daily" | "weekly" | "manual",
    settings: {
      auto_sync: false,
      sync_orders: true,
      sync_inventory: true,
      sync_pricing: true,
      webhook_url: "",
      notification_email: "",
    }
  });

  // Additional safety check for marketplace object
  if (!marketplace.id || !marketplace.display_name) {
    console.warn('MarketplaceIntegrationDialog: Invalid marketplace object', marketplace);
    return null;
  }

  const existingIntegration = getIntegrationByMarketplaceId(marketplace.id);

  useEffect(() => {
    if (existingIntegration) {
      setFormData({
        api_key: existingIntegration.api_key || "",
        api_secret: existingIntegration.api_secret || "",
        seller_id: existingIntegration.seller_id || "",
        store_url: existingIntegration.store_url || "",
        sync_frequency: existingIntegration.sync_frequency,
        settings: {
          auto_sync: existingIntegration.settings.auto_sync,
          sync_orders: existingIntegration.settings.sync_orders,
          sync_inventory: existingIntegration.settings.sync_inventory,
          sync_pricing: existingIntegration.settings.sync_pricing,
          webhook_url: existingIntegration.settings.webhook_url || "",
          notification_email: existingIntegration.settings.notification_email || "",
        }
      });
    }
  }, [existingIntegration]);

  const handleSave = async () => {
    try {
      if (existingIntegration) {
        // Update existing integration
        const success = await updateIntegration(existingIntegration.id, {
          api_key: formData.api_key,
          api_secret: formData.api_secret,
          seller_id: formData.seller_id,
          store_url: formData.store_url,
          sync_frequency: formData.sync_frequency,
          settings: formData.settings,
        });

        if (success) {
          addNotification({
            title: "Success",
            message: `Integration for ${marketplace.display_name} updated successfully`,
            type: "success",
          });
        } else {
          addNotification({
            title: "Error",
            message: "Failed to update integration",
            type: "error",
          });
        }
      } else {
        // Create new integration
        const result = await createIntegration({
          marketplace_id: marketplace.id,
          api_key: formData.api_key,
          api_secret: formData.api_secret,
          seller_id: formData.seller_id,
          store_url: formData.store_url,
          sync_frequency: formData.sync_frequency,
          settings: formData.settings,
        });

        if (result) {
          addNotification({
            title: "Success",
            message: `Integration for ${marketplace.display_name} created successfully`,
            type: "success",
          });
        } else {
          addNotification({
            title: "Error",
            message: "Failed to create integration",
            type: "error",
          });
        }
      }
    } catch (error) {
      addNotification({
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
      });
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const success = await testConnection(marketplace.id);
      if (success) {
        addNotification({
          title: "Connection Test",
          message: `Successfully connected to ${marketplace.display_name}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Connection Test",
          message: `Failed to connect to ${marketplace.display_name}`,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Connection Test",
        message: "An error occurred during connection test",
        type: "error",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const success = await syncData(marketplace.id, 'full');
      if (success) {
        addNotification({
          title: "Data Sync",
          message: `Successfully synced data from ${marketplace.display_name}`,
          type: "success",
        });
      } else {
        addNotification({
          title: "Data Sync",
          message: `Failed to sync data from ${marketplace.display_name}`,
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Data Sync",
        message: "An error occurred during data sync",
        type: "error",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteIntegration = async () => {
    if (!existingIntegration) return;

    try {
      const success = await deleteIntegration(existingIntegration.id);
      if (success) {
        addNotification({
          title: "Success",
          message: `Integration for ${marketplace.display_name} deleted successfully`,
          type: "success",
        });
        onOpenChange(false);
      } else {
        addNotification({
          title: "Error",
          message: "Failed to delete integration",
          type: "error",
        });
      }
    } catch (error) {
      addNotification({
        title: "Error",
        message: "An unexpected error occurred",
        type: "error",
      });
    }
  };

  const getStatusBadge = () => {
    if (!existingIntegration) {
      return <Badge variant="secondary">Not Configured</Badge>;
    }
    
    switch (existingIntegration.status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!existingIntegration) {
      return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
    
    switch (existingIntegration.status) {
      case 'connected':
        return <Wifi className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Wifi className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <Wifi className="h-5 w-5 text-red-500" />;
      default:
        return <WifiOff className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {marketplace.display_name} Integration
          </DialogTitle>
          <DialogDescription>
            Configure API credentials and sync settings for {marketplace.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon()}
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  {existingIntegration?.last_sync && (
                    <span className="text-sm text-muted-foreground">
                      Last sync: {new Date(existingIntegration.last_sync).toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing || !existingIntegration}
                  >
                    {testing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncData}
                    disabled={syncing || !existingIntegration}
                  >
                    {syncing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    Sync Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credentials">API Credentials</TabsTrigger>
              <TabsTrigger value="settings">Sync Settings</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Credentials
                  </CardTitle>
                  <CardDescription>
                    Enter your {marketplace.display_name} API credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        value={formData.api_key}
                        onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                        placeholder="Enter API key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-secret">API Secret</Label>
                      <Input
                        id="api-secret"
                        type="password"
                        value={formData.api_secret}
                        onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                        placeholder="Enter API secret"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seller-id">Seller ID</Label>
                      <Input
                        id="seller-id"
                        value={formData.seller_id}
                        onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                        placeholder="Enter seller ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="store-url">Store URL</Label>
                      <Input
                        id="store-url"
                        value={formData.store_url}
                        onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                        placeholder="https://your-store.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Sync Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure data synchronization settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sync-frequency">Sync Frequency</Label>
                    <Select
                      value={formData.sync_frequency}
                      onValueChange={(value: "hourly" | "daily" | "weekly" | "manual") => 
                        setFormData({ ...formData, sync_frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sync frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto Sync</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically sync data based on frequency
                        </p>
                      </div>
                      <Switch
                        checked={formData.settings.auto_sync}
                        onCheckedChange={(checked) => 
                          setFormData({ 
                            ...formData, 
                            settings: { ...formData.settings, auto_sync: checked } 
                          })
                        }
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Data Types to Sync</Label>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            <span>Orders</span>
                          </div>
                          <Switch
                            checked={formData.settings.sync_orders}
                            onCheckedChange={(checked) => 
                              setFormData({ 
                                ...formData, 
                                settings: { ...formData.settings, sync_orders: checked } 
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span>Inventory</span>
                          </div>
                          <Switch
                            checked={formData.settings.sync_inventory}
                            onCheckedChange={(checked) => 
                              setFormData({ 
                                ...formData, 
                                settings: { ...formData.settings, sync_inventory: checked } 
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>Pricing</span>
                          </div>
                          <Switch
                            checked={formData.settings.sync_pricing}
                            onCheckedChange={(checked) => 
                              setFormData({ 
                                ...formData, 
                                settings: { ...formData.settings, sync_pricing: checked } 
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Webhooks & Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure webhook endpoints and notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      value={formData.settings.webhook_url}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, webhook_url: e.target.value } 
                        })
                      }
                      placeholder="https://your-domain.com/webhook"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL to receive real-time updates from {marketplace.display_name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notification-email">Notification Email</Label>
                    <Input
                      id="notification-email"
                      type="email"
                      value={formData.settings.notification_email}
                      onChange={(e) => 
                        setFormData({ 
                          ...formData, 
                          settings: { ...formData.settings, notification_email: e.target.value } 
                        })
                      }
                      placeholder="admin@yourcompany.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address for sync notifications and alerts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {existingIntegration && (
              <Button
                variant="destructive"
                onClick={handleDeleteIntegration}
              >
                Delete Integration
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {existingIntegration ? 'Update' : 'Save'} Integration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
