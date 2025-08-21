import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useMarketplaceSettings } from "@/hooks/useMarketplaceSettings";

interface MarketplaceStatusCardProps {
  showManageButton?: boolean;
  onManageClick?: () => void;
  compact?: boolean;
}

export const MarketplaceStatusCard: React.FC<MarketplaceStatusCardProps> = ({
  showManageButton = true,
  onManageClick,
  compact = false
}) => {
  const { settings, loading, error } = useMarketplaceSettings();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="success" className="text-xs">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary" className="text-xs">Disconnected</Badge>;
      case 'pending':
        return <Badge variant="warning" className="text-xs">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive" className="text-xs">Error</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  const getConnectedCount = () => {
    if (!settings?.integrations) return 0;
    return settings.integrations.filter(integration => integration.is_active).length;
  };

  const getTotalCount = () => {
    return settings?.integrations?.length || 0;
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Marketplace Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            Marketplace Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <AlertCircle className="h-4 w-4 text-destructive mr-2" />
            <span className="text-sm text-destructive">Error loading status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Marketplace Status</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getConnectedCount()}/{getTotalCount()} Connected
            </Badge>
          </div>
        </div>
        <CardDescription>
          Current status of marketplace integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {compact ? (
          <div className="space-y-2">
            {settings?.integrations.slice(0, 3).map((marketplace) => (
              <div key={marketplace.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(marketplace.status)}
                  <span className="text-sm font-medium">{marketplace.display_name}</span>
                </div>
                {getStatusBadge(marketplace.status)}
              </div>
            ))}
            {settings?.integrations.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-xs text-muted-foreground">
                  +{settings.integrations.length - 3} more marketplaces
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {settings?.integrations.map((marketplace) => (
              <div key={marketplace.name} className="flex items-center justify-between p-2 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(marketplace.status)}
                  <div>
                    <div className="font-medium text-sm">{marketplace.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {marketplace.is_active ? 'Active integration' : 'Inactive integration'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(marketplace.status)}
                  {marketplace.last_sync && (
                    <div className="text-xs text-muted-foreground">
                      Last sync: {new Date(marketplace.last_sync).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showManageButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={onManageClick}
          >
            Manage Integrations
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
