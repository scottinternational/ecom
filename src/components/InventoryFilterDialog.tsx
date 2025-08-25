import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search } from "lucide-react";
import { InventoryFilters } from "@/hooks/useInventory";

interface InventoryFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  filterOptions: {
    categories: string[];
    brands: string[];
    warehouses: string[];
    statuses: string[];
    stockLevels: string[];
  };
  activeFilterCount: number;
}

export const InventoryFilterDialog: React.FC<InventoryFilterDialogProps> = ({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  filterOptions,
  activeFilterCount,
}) => {
  const [localFilters, setLocalFilters] = useState<InventoryFilters>(filters);

  const handleFilterChange = (key: keyof InventoryFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleResetFilters = () => {
    const resetFilters: InventoryFilters = {
      searchQuery: '',
      status: 'all',
      category: 'all',
      brand: 'all',
      warehouse: 'all',
      stockLevel: 'all',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleClearSearch = () => {
    setLocalFilters(prev => ({ ...prev, searchQuery: '' }));
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Inventory</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Filter inventory items by various criteria to find what you're looking for
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search-query">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                placeholder="Search by SKU, product name, brand, or category..."
                value={localFilters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10 pr-10"
              />
              {localFilters.searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Stock Status</Label>
              <Select
                value={localFilters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Level Filter */}
            <div className="space-y-2">
              <Label htmlFor="stock-level-filter">Stock Level</Label>
              <Select
                value={localFilters.stockLevel}
                onValueChange={(value) => handleFilterChange('stockLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stock level" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.stockLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === 'all' ? 'All Levels' : 
                       level === 'low' ? 'Low Stock' :
                       level === 'out' ? 'Out of Stock' :
                       level === 'overstock' ? 'Overstock' : level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                value={localFilters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <Label htmlFor="brand-filter">Brand</Label>
              <Select
                value={localFilters.brand}
                onValueChange={(value) => handleFilterChange('brand', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="space-y-2">
              <Label>Active Filters</Label>
              <div className="flex flex-wrap gap-2">
                {filters.searchQuery && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>Search: {filters.searchQuery}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange('searchQuery', '')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.status !== 'all' && (
                  <Badge variant={getStatusBadgeVariant(filters.status)} className="flex items-center space-x-1">
                    <span>Status: {getStatusLabel(filters.status)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange('status', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.category !== 'all' && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>Category: {filters.category}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange('category', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                {filters.brand !== 'all' && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>Brand: {filters.brand}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange('brand', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
                
                {filters.stockLevel !== 'all' && (
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span>Stock Level: {filters.stockLevel}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange('stockLevel', 'all')}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset All Filters
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
