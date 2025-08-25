import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Archive, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Hash
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useInventory, InventoryItem } from "@/hooks/useInventory";
import { InventoryFilterDialog } from "@/components/InventoryFilterDialog";

const Inventory = () => {
  const { addNotification } = useNotifications();
  const {
    inventory,
    loading,
    error,
    summary,
    filters,
    filterOptions,
    refreshInventory,
    updateFilters,
    exportInventory,
  } = useInventory();

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.status !== 'all') count++;
    if (filters.category !== 'all') count++;
    if (filters.brand !== 'all') count++;
    if (filters.stockLevel !== 'all') count++;
    return count;
  };

  // Handle card click to apply filter
  const handleCardClick = (filterType: string) => {
    switch (filterType) {
      case 'low_stock':
        updateFilters({ status: 'low_stock', stockLevel: 'low' });
        break;
      case 'out_of_stock':
        updateFilters({ status: 'out_of_stock', stockLevel: 'out' });
        break;
      case 'overstock':
        updateFilters({ status: 'overstock', stockLevel: 'overstock' });
        break;
      case 'in_stock':
        updateFilters({ status: 'in_stock' });
        break;
      default:
        break;
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ searchQuery: query });
  };

  // Handle export
  const handleExport = () => {
    try {
      const csvData = exportInventory();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Inventory data exported successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export inventory data'
      });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshInventory();
    addNotification({
      type: 'success',
      title: 'Refreshed',
      message: 'Inventory data refreshed successfully'
    });
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'default';
      case 'low_stock':
        return 'secondary';
      case 'out_of_stock':
        return 'destructive';
      case 'overstock':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      case 'overstock':
        return 'Overstock';
      default:
        return status;
    }
  };

  // Format price
  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format stock value
  const formatStockValue = (costPrice: number | null | undefined, quantity: number): string => {
    if (!costPrice) return '₹0';
    return formatPrice(costPrice * quantity);
  };

  // Get product image
  const getProductImage = (item: InventoryItem) => {
    console.log(`🖼️ UI: Checking image for ${item.sku}:`, {
      hasImageUrl: !!item.image_url,
      imageUrl: item.image_url,
      trimmed: item.image_url?.trim(),
      isEmpty: item.image_url?.trim() === ''
    });
    
    if (item.image_url && item.image_url.trim() !== '') {
      console.log(`🖼️ UI: Image URL for ${item.sku}:`, item.image_url);
      return item.image_url;
    }
    console.log(`🖼️ UI: No image URL for ${item.sku}`);
    return null;
  };



  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="text-center py-12">
          <div className="text-destructive">
            <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Error loading inventory</p>
            <p>{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Track stock levels, monitor inventory status, and manage warehouse operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getActiveFilterCount() > 0 && (
            <Button 
              variant="outline" 
              onClick={() => updateFilters({
                searchQuery: '',
                status: 'all',
                category: 'all',
                brand: 'all',
                stockLevel: 'all'
              })}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
          <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="enterprise">Inward Stock</Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory by SKU, product name, brand, or category..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => handleSearch('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(summary.totalStockValue)}
            </div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {summary.totalProducts} products
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-enterprise cursor-pointer transition-all hover:shadow-lg ${
            filters.status === 'in_stock' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleCardClick('in_stock')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Products in Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.totalProducts - summary.outOfStockItems}</div>
            <p className="text-xs text-info">
              {summary.availableQuantity} available units
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-enterprise cursor-pointer transition-all hover:shadow-lg ${
            filters.status === 'low_stock' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleCardClick('low_stock')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.lowStockAlerts}</div>
            <p className="text-xs text-warning flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`shadow-enterprise cursor-pointer transition-all hover:shadow-lg ${
            filters.status === 'out_of_stock' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleCardClick('out_of_stock')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{summary.outOfStockItems}</div>
            <p className="text-xs text-destructive">
              Items need restocking
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            {loading ? 'Loading inventory data...' : 
             `${inventory.length} items found${getActiveFilterCount() > 0 ? ' (filtered)' : ''}`}
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
          ) : inventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No inventory items found</p>
                <p>
                  {getActiveFilterCount() > 0 
                    ? 'Try adjusting your filters to see more results'
                    : 'No inventory data available'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Product</TableHead>
                    <TableHead className="w-[120px]">SKU</TableHead>
                    <TableHead className="w-[150px]">Brand</TableHead>
                    <TableHead className="w-[120px]">Category</TableHead>
                    <TableHead className="w-[120px]">WH-SCOTT</TableHead>
                    <TableHead className="w-[120px]">Stock Value</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.sku}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
                            {getProductImage(item) ? (
                              <img 
                                src={getProductImage(item)!} 
                                alt={item.product_name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  console.log(`❌ Image failed to load for ${item.sku}, showing fallback`);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  // Show fallback content
                                  const fallback = target.parentElement?.querySelector('.image-fallback');
                                  if (fallback) {
                                    fallback.classList.remove('hidden');
                                  }
                                }}
                                onLoad={() => {
                                  console.log(`✅ Image loaded successfully for ${item.sku}`);
                                }}
                              />
                            ) : null}
                            <div className={`h-full w-full flex items-center justify-center text-sm font-medium text-muted-foreground image-fallback ${getProductImage(item) ? 'hidden' : ''}`}>
                              {item.product_name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.color && `${item.color}`}
                              {item.size && item.color && ' • '}
                              {item.size && `${item.size}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono text-foreground">
                          {item.sku}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.brand_name || 'No brand'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.category || 'No category'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {item.available_quantity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatStockValue(item.cost_price, item.available_quantity)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status === 'in_stock' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {item.status === 'low_stock' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.status === 'out_of_stock' && <XCircle className="h-3 w-3 mr-1" />}
                          {item.status === 'overstock' && <Package className="h-3 w-3 mr-1" />}
                          {getStatusLabel(item.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <InventoryFilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        onFiltersChange={updateFilters}
        filterOptions={filterOptions}
        activeFilterCount={getActiveFilterCount()}
      />
    </div>
  );
};

export default Inventory;