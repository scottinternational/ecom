import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { 
  Filter, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Database, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useChannelSkuMappings, ChannelSkuMapping, CreateChannelSkuMappingData } from "@/hooks/useChannelSkuMappings";
import { ChannelSkuMappingBulkUploadDialog } from "@/components/ChannelSkuMappingBulkUploadDialog";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

interface ProductWithImage {
  sku: string;
  name: string;
  product_image?: string | null; // This will store image_url from the database
  brand_logo?: string | null;
}

const Mapping = () => {
  const { addNotification } = useNotifications();
  const { 
    mappings, 
    loading, 
    error, 
    totalCount,
    currentPage,
    pageSize,
    createMapping, 
    updateMapping, 
    deleteMapping, 
    exportMappings,
    fetchMappings,
    fetchAllMappings
  } = useChannelSkuMappings();
  const { products } = useProducts();

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [showAllData, setShowAllData] = useState(false);
  const [productImages, setProductImages] = useState<Map<string, ProductWithImage>>(new Map());
  const fetchedSkusRef = useRef<Set<string>>(new Set());

  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<ChannelSkuMapping | null>(null);

  // State for form data
  const [formData, setFormData] = useState<CreateChannelSkuMappingData>({
    channel_sku: "",
    channel_name: "",
    master_sku: "",
    status: "Active",
  });

  // Get unique channel names for filter
  const uniqueChannels = [...new Set(mappings.map(m => m.channel_name))];

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  // Fetch product images for the mappings
  const fetchProductImages = async (masterSkus: string[]) => {
    try {
      if (masterSkus.length === 0) return;

      // Process in very small batches to avoid URL length issues
      const BATCH_SIZE = 10; // Much smaller batch size
      const imageMap = new Map<string, ProductWithImage>();

      for (let i = 0; i < masterSkus.length; i += BATCH_SIZE) {
        const batch = masterSkus.slice(i, i + BATCH_SIZE);
        
        try {
          const { data: batchData, error: batchError } = await supabase
            .from('products')
            .select(`
              sku, 
              product_name, 
              image_url,
              brand:brands(id, brand, logo)
            `)
            .in('sku', batch);

          if (batchError) {
            console.error('Error fetching batch:', batchError);
            // Fallback to individual queries for this batch
            for (const sku of batch) {
              try {
                const { data: singleData, error: singleError } = await supabase
                  .from('products')
                  .select(`
                    sku, 
                    product_name, 
                    image_url,
                    brand:brands(id, brand, logo)
                  `)
                  .eq('sku', sku)
                  .single();

                if (!singleError && singleData) {
                  console.log(`Fetched product data for SKU ${sku}:`, singleData);
                  imageMap.set(singleData.sku, {
                    sku: singleData.sku,
                    name: singleData.product_name,
                    product_image: singleData.image_url,
                    brand_logo: singleData.brand?.logo || null
                  });
                }
              } catch (singleError) {
                console.error(`Error fetching single SKU ${sku}:`, singleError);
              }
            }
            continue;
          }

          batchData?.forEach(product => {
            console.log(`Fetched product data for SKU ${product.sku}:`, product);
            imageMap.set(product.sku, {
              sku: product.sku,
              name: product.product_name,
              product_image: product.image_url,
              brand_logo: product.brand?.logo || null
            });
          });
        } catch (error) {
          console.error('Error in batch processing:', error);
          // Fallback to individual queries for this batch
          for (const sku of batch) {
            try {
              const { data: singleData, error: singleError } = await supabase
                .from('products')
                .select(`
                  sku, 
                  product_name, 
                  image_url,
                  brand:brands(id, brand, logo)
                `)
                .eq('sku', sku)
                .single();

              if (!singleError && singleData) {
                console.log(`Fetched product data for SKU ${sku}:`, singleData);
                imageMap.set(singleData.sku, {
                  sku: singleData.sku,
                  name: singleData.product_name,
                  product_image: singleData.image_url,
                  brand_logo: singleData.brand?.logo || null
                });
              }
            } catch (singleError) {
              console.error(`Error fetching single SKU ${sku}:`, singleError);
            }
          }
        }
      }

      console.log('Total products fetched:', imageMap.size);
      console.log('Product images map:', Array.from(imageMap.entries()));
      
      // Update the ref to track fetched SKUs
      masterSkus.forEach(sku => fetchedSkusRef.current.add(sku));
      
      // Merge with existing images instead of replacing
      setProductImages(prevImages => {
        const newMap = new Map(prevImages);
        imageMap.forEach((value, key) => {
          newMap.set(key, value);
        });
        return newMap;
      });

    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  // Handle search and filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setShowAllData(true);
      fetchAllMappings(value, statusFilter, channelFilter);
    } else {
      setShowAllData(false);
      fetchMappings(1, value, statusFilter, channelFilter);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (searchTerm.trim() || value !== 'all' || channelFilter !== 'all') {
      setShowAllData(true);
      fetchAllMappings(searchTerm, value, channelFilter);
    } else {
      setShowAllData(false);
      fetchMappings(1, searchTerm, value, channelFilter);
    }
  };

  const handleChannelFilterChange = (value: string) => {
    setChannelFilter(value);
    if (searchTerm.trim() || statusFilter !== 'all' || value !== 'all') {
      setShowAllData(true);
      fetchAllMappings(searchTerm, statusFilter, value);
    } else {
      setShowAllData(false);
      fetchMappings(1, searchTerm, statusFilter, value);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchMappings(page, searchTerm, statusFilter, channelFilter);
    }
  };

  // Get channel logo
  const getChannelLogo = (channelName: string) => {
    switch (channelName.toLowerCase()) {
      case "amazon":
        return "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg";
      case "flipkart":
        return "https://upload.wikimedia.org/wikipedia/commons/2/20/Flipkart_logo.png";
      case "myntra":
        return "https://upload.wikimedia.org/wikipedia/commons/c/c8/Myntra_logo.png";
      case "jiomart":
        return "https://upload.wikimedia.org/wikipedia/commons/8/8a/JioMart_logo.png";
      case "ajio":
        return "https://upload.wikimedia.org/wikipedia/commons/8/8a/Ajio_logo.png";
      case "meesho":
        return "https://upload.wikimedia.org/wikipedia/commons/8/8a/Meesho_logo.png";
      default:
        return "";
    }
  };

  // Get product image
  const getProductImage = (masterSku: string) => {
    const product = productImages.get(masterSku);
    const imageUrl = product?.product_image || "";
    return imageUrl;
  };

  // Get brand logo
  const getBrandLogo = (masterSku: string) => {
    const product = productImages.get(masterSku);
    const logoUrl = product?.brand_logo || "";
    return logoUrl;
  };

  // Fetch product images when mappings change
  useEffect(() => {
    if (mappings.length > 0) {
      const uniqueMasterSkus = [...new Set(mappings.map(m => m.master_sku))];
      // Only fetch if we don't already have these SKUs in our ref
      const missingSkus = uniqueMasterSkus.filter(sku => !fetchedSkusRef.current.has(sku));
      if (missingSkus.length > 0) {
        console.log('Fetching images for missing SKUs:', missingSkus);
        fetchProductImages(missingSkus);
      }
    }
  }, [mappings]);

  // Reset form
  const resetForm = () => {
    setFormData({
      channel_sku: "",
      channel_name: "",
      master_sku: "",
      status: "Active",
    });
  };

  // Handle create mapping
  const handleCreate = async () => {
    if (!formData.channel_sku || !formData.channel_name || !formData.master_sku) {
      addNotification({
        title: "Validation Error",
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    const result = await createMapping(formData);
    if (result) {
      addNotification({
        title: "Success",
        message: "Channel SKU mapping created successfully",
        type: "success",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } else {
      addNotification({
        title: "Error",
        message: "Failed to create mapping",
        type: "error",
      });
    }
  };

  // Handle edit mapping
  const handleEdit = async () => {
    if (!editingMapping || !formData.channel_sku || !formData.channel_name || !formData.master_sku) {
      addNotification({
        title: "Validation Error",
        message: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    const result = await updateMapping(editingMapping.id, formData);
    if (result) {
      addNotification({
        title: "Success",
        message: "Channel SKU mapping updated successfully",
        type: "success",
      });
      setIsEditDialogOpen(false);
      resetForm();
      setEditingMapping(null);
    } else {
      addNotification({
        title: "Error",
        message: "Failed to update mapping",
        type: "error",
      });
    }
  };

  // Handle delete mapping
  const handleDelete = async (mapping: ChannelSkuMapping) => {
    const result = await deleteMapping(mapping.id);
    if (result) {
      addNotification({
        title: "Success",
        message: "Channel SKU mapping deleted successfully",
        type: "success",
      });
    } else {
      addNotification({
        title: "Error",
        message: "Failed to delete mapping",
        type: "error",
      });
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const csvData = await exportMappings();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `channel_sku_mappings_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addNotification({
        title: "Export Successful",
        message: "Channel SKU mappings exported successfully",
        type: "success",
      });
    } catch (error) {
      addNotification({
        title: "Export Failed",
        message: "Failed to export mappings",
        type: "error",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (mapping: ChannelSkuMapping) => {
    setEditingMapping(mapping);
    setFormData({
      channel_sku: mapping.channel_sku,
      channel_name: mapping.channel_name,
      master_sku: mapping.master_sku,
      status: mapping.status,
    });
    setIsEditDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    // Clear the fetched SKUs ref to force re-fetching of images
    fetchedSkusRef.current.clear();
    setProductImages(new Map());
    
    if (showAllData) {
      fetchAllMappings(searchTerm, statusFilter, channelFilter);
    } else {
      fetchMappings(currentPage, searchTerm, statusFilter, channelFilter);
    }
    addNotification({
      title: "Refreshed",
      message: "Channel SKU mappings refreshed",
      type: "success",
    });
  };

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-destructive">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Error loading mappings</p>
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
          <h1 className="text-3xl font-bold text-foreground">Channel SKU Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Map channel-specific SKUs to master product SKUs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setIsBulkUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mapping
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Channel SKU Mapping</DialogTitle>
                <DialogDescription>
                  Create a new mapping between channel SKU and master SKU
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="channel-sku">Channel SKU *</Label>
                  <Input
                    id="channel-sku"
                    value={formData.channel_sku}
                    onChange={(e) => setFormData({ ...formData, channel_sku: e.target.value })}
                    placeholder="e.g., AMZ-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel-name">Channel Name *</Label>
                  <Input
                    id="channel-name"
                    value={formData.channel_name}
                    onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
                    placeholder="e.g., Amazon"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="master-sku">Master SKU *</Label>
                  <Select
                    value={formData.master_sku}
                    onValueChange={(value) => setFormData({ ...formData, master_sku: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select master SKU" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.sku}>
                          {product.sku} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "Active" | "Inactive") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.channel_sku || !formData.channel_name || !formData.master_sku}>
                  Create Mapping
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="shadow-enterprise">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by channel SKU, channel name, or master SKU..." 
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={handleChannelFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {uniqueChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showAllData && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Showing all {mappings.length} filtered records from database
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{showAllData ? mappings.length : totalCount}</div>
                <p className="text-xs text-info">Channel SKU mappings</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {mappings.filter(m => m.status === 'Active').length}
                </div>
                <p className="text-xs text-success">Currently active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{uniqueChannels.length}</div>
                <p className="text-xs text-warning">Different channels</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Master SKUs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {[...new Set(mappings.map(m => m.master_sku))].length}
                </div>
                <p className="text-xs text-success">Master products mapped</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mappings Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Channel SKU Mappings</CardTitle>
          <CardDescription>
            Manage mappings between channel-specific SKUs and master product SKUs
            {!showAllData && totalCount > 0 && (
              <span className="block mt-1">
                Showing {startRecord}-{endRecord} of {totalCount} records
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No mappings found</p>
                <p>Create your first channel SKU mapping to get started</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Channel SKU</TableHead>
                    <TableHead className="w-[120px]">Channel</TableHead>
                    <TableHead className="w-[350px]">Master SKU & Product</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div className="text-sm font-mono text-foreground">
                          {mapping.channel_sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-16 rounded-lg border overflow-hidden bg-white">
                            <img 
                              src={getChannelLogo(mapping.channel_name)} 
                              alt={mapping.channel_name} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-xs font-medium hidden`}>
                              {mapping.channel_name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-4">
                          {/* Product Image */}
                          <div className="relative">
                            <div className="w-16 h-16 rounded-lg border overflow-hidden bg-gray-100">
                              {getProductImage(mapping.master_sku) ? (
                                <img 
                                  src={getProductImage(mapping.master_sku)} 
                                  alt="Product" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center text-sm text-gray-500 ${getProductImage(mapping.master_sku) ? 'hidden' : ''}`}>
                                {mapping.master_sku.charAt(0)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Master SKU */}
                          <div className="flex flex-col">
                            <div className="text-sm font-mono text-foreground">
                              {mapping.master_sku}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {productImages.get(mapping.master_sku)?.name || 'Product'}
                            </span>
                          </div>

                          {/* Brand Logo */}
                          {getBrandLogo(mapping.master_sku) && (
                            <div className="relative">
                              <div className="w-16 h-16 rounded-lg border overflow-hidden bg-white">
                                <img 
                                  src={getBrandLogo(mapping.master_sku)} 
                                  alt="Brand" 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">
                            {mapping.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(mapping.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(mapping)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the mapping for "{mapping.channel_sku}" on {mapping.channel_name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(mapping)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {!showAllData && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {startRecord}-{endRecord} of {totalCount} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (page > totalPages) return null;
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Channel SKU Mapping</DialogTitle>
            <DialogDescription>
              Update the mapping between channel SKU and master SKU
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-channel-sku">Channel SKU *</Label>
              <Input
                id="edit-channel-sku"
                value={formData.channel_sku}
                onChange={(e) => setFormData({ ...formData, channel_sku: e.target.value })}
                placeholder="e.g., AMZ-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-channel-name">Channel Name *</Label>
              <Input
                id="edit-channel-name"
                value={formData.channel_name}
                onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
                placeholder="e.g., Amazon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-master-sku">Master SKU *</Label>
              <Select
                value={formData.master_sku}
                onValueChange={(value) => setFormData({ ...formData, master_sku: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select master SKU" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.sku}>
                      {product.sku} - {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "Active" | "Inactive") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!formData.channel_sku || !formData.channel_name || !formData.master_sku}>
              Update Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <ChannelSkuMappingBulkUploadDialog
        open={isBulkUploadDialogOpen}
        onOpenChange={setIsBulkUploadDialogOpen}
      />
    </div>
  );
};

export default Mapping;
