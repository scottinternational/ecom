import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, Search, Building2, RefreshCw, Upload, Link, X } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BrandFormData {
  brand: string;
  logo?: string;
  logoFile?: File;
}

export default function Brands() {
  const { brands, loading, error, createBrand, updateBrand, deleteBrand, fetchBrands } = useBrands();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    brand: "",
    logo: "",
  });
  const [logoInputType, setLogoInputType] = useState<'url' | 'file'>('url');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Debug logging
  console.log('Brands component rendered:', { brands, loading, error, brandsLength: brands.length });

  const filteredBrands = brands.filter(brand =>
    brand.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Filtered brands:', filteredBrands);

  // Force refresh brands on component mount
  useEffect(() => {
    console.log('Brands component mounted, forcing refresh...');
  }, []);

  const handleLogoFileChange = (file: File | null) => {
    if (file) {
      setFormData({ ...formData, logoFile: file, logo: "" });
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
    setFormData({ ...formData, logo: url, logoFile: undefined });
    setLogoPreview(url || null);
  };

  const uploadLogoToStorage = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting file upload...', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        bucketName: 'brands_logo'
      });
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return null;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please use JPG, PNG, GIF, or WebP");
        return null;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName; // Don't include bucket name in path

      console.log('Uploading to path:', filePath);

      // Check if user is authenticated
      const { data: { user } } = await (supabase as any).auth.getUser();
      console.log('Current user:', user);

      if (!user) {
        toast.error("You must be logged in to upload files");
        return null;
      }

      // Upload file to Supabase storage
      const { data, error } = await (supabase as any).storage
        .from('brands_logo')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        
        // If storage upload fails, try base64 conversion as fallback
        if (error.message.includes('row-level security') || error.message.includes('permission')) {
          console.log('Storage upload failed, trying base64 conversion...');
          return await convertFileToBase64(file);
        } else {
          toast.error(`Upload failed: ${error.message}`);
          return null;
        }
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = (supabase as any).storage
        .from('brands_logo')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };

  // Fallback method: convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('File converted to base64');
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert file to base64'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = async () => {
    try {
      let logoUrl = formData.logo;
      
      // If a file was uploaded, upload it to storage first
      if (formData.logoFile) {
        const uploadedUrl = await uploadLogoToStorage(formData.logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          toast.error("Failed to upload logo file");
          return;
        }
      }

      const success = await createBrand({ brand: formData.brand, logo: logoUrl });
      if (success) {
        toast.success("Brand created successfully");
        addNotification({
          title: "Brand Created",
          message: `${formData.brand} has been created successfully`,
          type: "success",
        });
        setIsCreateDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to create brand");
    }
  };

  const handleEdit = async () => {
    if (!editingBrand) return;
    
    try {
      let logoUrl = formData.logo;
      
      // If a file was uploaded, upload it to storage first
      if (formData.logoFile) {
        const uploadedUrl = await uploadLogoToStorage(formData.logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          toast.error("Failed to upload logo file");
          return;
        }
      }

      const success = await updateBrand(editingBrand.id, { brand: formData.brand, logo: logoUrl });
      if (success) {
        toast.success("Brand updated successfully");
        addNotification({
          title: "Brand Updated",
          message: `${formData.brand} has been updated successfully`,
          type: "success",
        });
        setIsEditDialogOpen(false);
        setEditingBrand(null);
        resetForm();
      }
    } catch (error) {
      toast.error("Failed to update brand");
    }
  };

  const handleDelete = async (brandId: number, brandName: string) => {
    try {
      const success = await deleteBrand(brandId);
      if (success) {
        toast.success("Brand deleted successfully");
        addNotification({
          title: "Brand Deleted",
          message: `${brandName} has been deleted successfully`,
          type: "success",
        });
      }
    } catch (error) {
      toast.error("Failed to delete brand");
    }
  };

  // Test function to manually check database
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      
      // Test 1: Basic query
      const { data: basicData, error: basicError } = await (supabase as any)
        .from('brands')
        .select('*')
        .limit(5);
      
      console.log('Basic query result:', { basicData, basicError });
      
      // Test 2: Count query
      const { data: countData, error: countError } = await (supabase as any)
        .from('brands')
        .select('count');
      
      console.log('Count query result:', { countData, countError });
      
      // Test 3: Raw SQL query (if possible)
      const { data: rawData, error: rawError } = await (supabase as any)
        .rpc('get_brands_count');
      
      console.log('Raw SQL result:', { rawData, rawError });

      // Test 4: Storage bucket access
      console.log('Testing storage bucket access...');
      const { data: storageData, error: storageError } = await (supabase as any).storage
        .from('brands_logo')
        .list('', { limit: 1 });
      
      console.log('Storage test result:', { storageData, storageError });
      
      toast.info(`Found ${basicData?.length || 0} brands in database. Storage: ${storageError ? 'Error' : 'OK'}`);
    } catch (err) {
      console.error('Test query error:', err);
      toast.error('Database test failed');
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      console.log('Manual refresh triggered...');
      await fetchBrands();
      toast.success('Brands refreshed');
    } catch (err) {
      console.error('Refresh error:', err);
      toast.error('Failed to refresh brands');
    }
  };

  const openEditDialog = (brand: any) => {
    setEditingBrand(brand);
    setFormData({
      brand: brand.brand || "",
      logo: brand.logo || "",
    });
    setLogoPreview(brand.logo || null);
    setLogoInputType('url');
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      brand: "",
      logo: "",
    });
    setLogoPreview(null);
    setLogoInputType('url');
  };

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Brands</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Brand Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product brands and their information
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={testDatabaseConnection} variant="outline">
            Test DB
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Brand</DialogTitle>
                <DialogDescription>
                  Add a new brand to your product catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand Name *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Enter brand name"
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
                        value={formData.logo}
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
                              setFormData({ ...formData, logo: "" });
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
                <Button onClick={handleCreate} disabled={!formData.brand}>
                  Create Brand
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
              Total Brands
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{brands.length}</div>
                <p className="text-xs text-info">In catalog</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Brands with Logos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {brands.filter(b => b.logo).length}
                </div>
                <p className="text-xs text-success">With logo</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Brands without Logos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {brands.filter(b => !b.logo).length}
                </div>
                <p className="text-xs text-warning">Without logo</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Brands</h2>
          <p className="text-muted-foreground">Manage all your product brands</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
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
            {filteredBrands.length === 0 ? (
              <div className="col-span-5 text-center py-12">
                <div className="text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No brands found</p>
                  <p>Create your first brand to get started</p>
                </div>
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <div key={brand.id} className="relative group flex justify-center">
                  <div className="relative">
                    <div 
                      className="w-40 h-40 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 ease-in-out bg-white shadow-sm hover:shadow-lg cursor-pointer transform hover:scale-105 hover:-translate-y-1"
                      onClick={() => openEditDialog(brand)}
                    >
                      {brand.logo ? (
                        <img 
                          src={brand.logo} 
                          alt={brand.brand}
                          className="w-full h-full object-contain p-3"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${brand.logo ? 'hidden' : ''}`}>
                        <Building2 className="h-16 w-16 text-gray-400" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 bg-white shadow-md hover:bg-gray-50 border border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(brand);
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
                            <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{brand.brand}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(brand.id, brand.brand)}
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
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>
              Update brand information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Brand Name *</Label>
              <Input
                id="edit-brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Enter brand name"
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
                    value={formData.logo}
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
                          setFormData({ ...formData, logo: "" });
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {editingBrand && (
              <div className="space-y-2">
                <Label>Brand Details</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Brand ID:</strong> {editingBrand.id}</p>
                  <p><strong>Created:</strong> {new Date(editingBrand.created_at).toLocaleDateString()}</p>
                  <p><strong>Logo Status:</strong> {editingBrand.logo ? 'Has Logo' : 'No Logo'}</p>
                  {editingBrand.logo && (
                    <div className="mt-2">
                      <p><strong>Current Logo:</strong></p>
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={editingBrand.logo} 
                          alt={editingBrand.brand}
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
            <Button onClick={handleEdit} disabled={!formData.brand}>
              Update Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
