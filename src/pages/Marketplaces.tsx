import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, Store, RefreshCw, Upload, Link, X, Settings, Wifi, WifiOff } from "lucide-react";
import { useMarketplaces } from "@/hooks/useMarketplaces";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceIntegrationDialog } from "@/components/MarketplaceIntegrationDialog";

interface MarketplaceFormData {
  name: string;
  display_name: string;
  logo_url: string;
  logoFile?: File;
}

export default function Marketplaces() {
  const { 
    marketplaces, 
    integrations, 
    loading, 
    error, 
    createMarketplace, 
    updateMarketplace, 
    deleteMarketplace, 
    fetchMarketplaces,
    getIntegrationByMarketplaceId 
  } = useMarketplaces();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [editingMarketplace, setEditingMarketplace] = useState<any>(null);
  const [selectedMarketplace, setSelectedMarketplace] = useState<any>(null);
  const [formData, setFormData] = useState<MarketplaceFormData>({
    name: "",
    display_name: "",
    logo_url: "",
  });
  const [logoInputType, setLogoInputType] = useState<'url' | 'file'>('url');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const filteredMarketplaces = marketplaces.filter(marketplace =>
    marketplace.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marketplace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogoFileChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, logoFile: file, logo_url: "" });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, logoFile: undefined });
      setLogoPreview(null);
    }
  };

  const handleLogoUrlChange = (url: string) => {
    setFormData({ ...formData, logo_url: url, logoFile: undefined });
    setLogoPreview(url || null);
  };

  const uploadLogoToStorage = async (file: File): Promise<string | null> => {
    try {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed');
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `marketplace-logo-${timestamp}.${fileExt}`;
      const filePath = `marketplace-logos/${fileName}`;

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size, fileType: file.type });

      const { error: uploadError } = await supabase.storage
        .from('brands_logo')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, getting public URL...');

      const { data: { publicUrl } } = supabase.storage
        .from('brands_logo')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      
      // Try fallback to base64 for smaller files
      if (file.size <= 1 * 1024 * 1024) { // 1MB limit for base64
        try {
          console.log('Attempting base64 fallback...');
          const base64String = await fileToBase64(file);
          addNotification({
            title: "Upload Warning",
            message: "Storage upload failed, using base64 encoding instead",
            type: "warning",
          });
          return base64String;
        } catch (base64Error) {
          console.error('Base64 fallback also failed:', base64Error);
        }
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('File size exceeds')) {
          addNotification({
            title: "Upload Error",
            message: "File size exceeds 5MB limit",
            type: "error",
          });
        } else if (error.message.includes('Invalid file type')) {
          addNotification({
            title: "Upload Error",
            message: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed",
            type: "error",
          });
        } else if (error.message.includes('bucket') || error.message.includes('storage')) {
          addNotification({
            title: "Upload Error",
            message: "Storage bucket error. Please check your configuration.",
            type: "error",
          });
        } else {
          addNotification({
            title: "Upload Error",
            message: `Upload failed: ${error.message}`,
            type: "error",
          });
        }
      } else {
        addNotification({
          title: "Upload Error",
          message: "Failed to upload logo. Please try again.",
          type: "error",
        });
      }
      
      return null;
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      display_name: "",
      logo_url: "",
    });
    setLogoPreview(null);
    setLogoInputType('url');
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.display_name) {
      addNotification({
        title: "Validation Error",
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    let logoUrl = formData.logo_url;
    if (formData.logoFile) {
      logoUrl = await uploadLogoToStorage(formData.logoFile);
      if (!logoUrl) {
        addNotification({
          title: "Upload Error",
          message: "Failed to upload logo",
          type: "error",
        });
        return;
      }
    }

    const result = await createMarketplace({
      name: formData.name.toLowerCase().replace(/\s+/g, '-'),
      display_name: formData.display_name,
      logo_url: logoUrl,
    });

    if (result) {
      addNotification({
        title: "Success",
        message: `Marketplace "${formData.display_name}" created successfully`,
        type: "success",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } else {
      addNotification({
        title: "Error",
        message: "Failed to create marketplace",
        type: "error",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingMarketplace || !formData.display_name) {
      addNotification({
        title: "Validation Error",
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    let logoUrl = formData.logo_url;
    if (formData.logoFile) {
      logoUrl = await uploadLogoToStorage(formData.logoFile);
      if (!logoUrl) {
        addNotification({
          title: "Upload Error",
          message: "Failed to upload logo",
          type: "error",
        });
        return;
      }
    }

    const result = await updateMarketplace(editingMarketplace.id, {
      display_name: formData.display_name,
      logo_url: logoUrl,
    });

    if (result) {
      addNotification({
        title: "Success",
        message: `Marketplace "${formData.display_name}" updated successfully`,
        type: "success",
      });
      setIsEditDialogOpen(false);
      resetForm();
      setEditingMarketplace(null);
    } else {
      addNotification({
        title: "Error",
        message: "Failed to update marketplace",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await deleteMarketplace(id);
    if (result) {
      addNotification({
        title: "Success",
        message: `Marketplace "${name}" deleted successfully`,
        type: "success",
      });
    } else {
      addNotification({
        title: "Error",
        message: "Failed to delete marketplace",
        type: "error",
      });
    }
  };

  const openEditDialog = (marketplace: any) => {
    setEditingMarketplace(marketplace);
    setFormData({
      name: marketplace.name,
      display_name: marketplace.display_name,
      logo_url: marketplace.logo_url || "",
    });
    setLogoPreview(marketplace.logo_url || null);
    setIsEditDialogOpen(true);
  };

  const openIntegrationDialog = (marketplace: any) => {
    setSelectedMarketplace(marketplace);
    setIsIntegrationDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchMarketplaces();
    addNotification({
      title: "Refreshed",
      message: "Marketplace data refreshed",
      type: "success",
    });
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplaces')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      addNotification({
        title: "Database Connection",
        message: "Successfully connected to database",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Database Connection",
        message: "Failed to connect to database",
        type: "error",
      });
    }
  };

  const testStorageConnection = async () => {
    try {
      // Test if we can list files in the bucket
      const { data, error } = await supabase.storage
        .from('brands_logo')
        .list('', { limit: 1 });

      if (error) {
        throw error;
      }

      addNotification({
        title: "Storage Connection",
        message: "Successfully connected to brands_logo storage bucket",
        type: "success",
      });
    } catch (error) {
      console.error('Storage test error:', error);
      addNotification({
        title: "Storage Connection",
        message: "Failed to connect to brands_logo storage bucket. Check console for details.",
        type: "error",
      });
    }
  };

  const getStatusBadge = (marketplaceId: number) => {
    const integration = getIntegrationByMarketplaceId(marketplaceId);
    if (!integration) {
      return <Badge variant="secondary">Not Configured</Badge>;
    }
    
    switch (integration.status) {
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

  const getConnectedCount = () => {
    return integrations.filter(i => i.status === 'connected').length;
  };

  const getStatusIcon = (marketplace: any) => {
    const integration = getIntegrationByMarketplaceId(marketplace.id);
    if (!integration) {
      return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
    
    switch (integration.status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <Wifi className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-destructive">
            <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Error loading marketplaces</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplaces</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your marketplace integrations
          </p>
        </div>
         <div className="flex items-center space-x-2">
           <Button onClick={testDatabaseConnection} variant="outline">
             Test DB
           </Button>
           <Button onClick={testStorageConnection} variant="outline">
             Test Storage
           </Button>
           <Button onClick={handleRefresh} variant="outline">
             <RefreshCw className="h-4 w-4 mr-2" />
             Refresh
           </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Marketplace
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Marketplace</DialogTitle>
                <DialogDescription>
                  Create a new marketplace integration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="marketplace-name">Marketplace Name *</Label>
                  <Input
                    id="marketplace-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., amazon, flipkart"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name *</Label>
                  <Input
                    id="display-name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="e.g., Amazon, Flipkart"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant={logoInputType === 'url' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogoInputType('url')}
                        className="flex-1"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        URL
                      </Button>
                      <Button
                        type="button"
                        variant={logoInputType === 'file' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogoInputType('file')}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                    
                    {logoInputType === 'url' ? (
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={formData.logo_url}
                        onChange={(e) => handleLogoUrlChange(e.target.value)}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                      </div>
                    )}
                    
                    {logoPreview && (
                      <div className="relative inline-block">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={logoPreview} 
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white shadow-md hover:bg-gray-50"
                          onClick={() => {
                            setLogoPreview(null);
                            if (logoInputType === 'file') {
                              setFormData({ ...formData, logoFile: undefined });
                            } else {
                              setFormData({ ...formData, logo_url: "" });
                            }
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || !formData.display_name}>
                  Create Marketplace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Marketplaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{marketplaces.length}</div>
                <p className="text-xs text-info">In catalog</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {getConnectedCount()}
                </div>
                <p className="text-xs text-success">Active integrations</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {marketplaces.length - getConnectedCount()}
                </div>
                <p className="text-xs text-warning">Awaiting setup</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketplaces</h2>
          <p className="text-muted-foreground">Manage all your marketplace integrations</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search marketplaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-9">
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="flex justify-center">
              <Skeleton className="h-40 w-40 rounded-lg" />
            </div>
          ))
        ) : (
          <>
            {filteredMarketplaces.length === 0 ? (
              <div className="col-span-5 text-center py-12">
                <div className="text-muted-foreground">
                  <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No marketplaces found</p>
                  <p>Create your first marketplace to get started</p>
                </div>
              </div>
            ) : (
              filteredMarketplaces.map((marketplace) => (
                <div key={marketplace.id} className="relative group flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 ease-in-out bg-white shadow-sm hover:shadow-lg cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                      onClick={() => openIntegrationDialog(marketplace)}
                    >
                      {marketplace.logo_url ? (
                        <img 
                          src={marketplace.logo_url} 
                          alt={marketplace.display_name}
                          className="w-full h-full object-contain p-3"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${marketplace.logo_url ? 'hidden' : ''}`}>
                        <Store className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50 border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(marketplace);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Marketplace</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{marketplace.display_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(marketplace.id, marketplace.display_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Marketplace</DialogTitle>
            <DialogDescription>
              Update marketplace information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-display-name">Display Name *</Label>
              <Input
                id="edit-display-name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Enter display name"
              />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant={logoInputType === 'url' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogoInputType('url')}
                    className="flex-1"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    URL
                  </Button>
                  <Button
                    type="button"
                    variant={logoInputType === 'file' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLogoInputType('file')}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                
                {logoInputType === 'url' ? (
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => handleLogoUrlChange(e.target.value)}
                  />
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                    </p>
                  </div>
                )}
                
                {logoPreview && (
                  <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-white shadow-md hover:bg-gray-50"
                      onClick={() => {
                        setLogoPreview(null);
                        if (logoInputType === 'file') {
                          setFormData({ ...formData, logoFile: undefined });
                        } else {
                          setFormData({ ...formData, logo_url: "" });
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {editingMarketplace && (
              <div className="space-y-2">
                <Label>Marketplace Details</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Marketplace ID:</strong> {editingMarketplace.id}</p>
                  <p><strong>Name:</strong> {editingMarketplace.name}</p>
                  <p><strong>Created:</strong> {new Date(editingMarketplace.created_at).toLocaleDateString()}</p>
                  <p><strong>Logo Status:</strong> {editingMarketplace.logo_url ? 'Has Logo' : 'No Logo'}</p>
                  {editingMarketplace.logo_url && (
                    <div className="mt-2">
                      <p><strong>Current Logo:</strong></p>
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={editingMarketplace.logo_url} 
                          alt={editingMarketplace.display_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.display_name}>
              Update Marketplace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integration Dialog */}
      {selectedMarketplace && isIntegrationDialogOpen && (
        <MarketplaceIntegrationDialog
          marketplace={selectedMarketplace}
          open={isIntegrationDialogOpen}
          onOpenChange={setIsIntegrationDialogOpen}
        />
      )}
    </div>
  );
}
