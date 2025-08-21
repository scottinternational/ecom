import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
import { Badge } from "@/components/ui/badge";
import { X, Filter, RotateCcw, Search } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { Product } from "@/hooks/useProducts";

export interface FilterOptions {
  searchQuery: string;
  brands: string[];
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number];
  hasImage: boolean | null;
  hasBrand: boolean | null;
}

interface ProductFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export const ProductFilterDialog: React.FC<ProductFilterDialogProps> = ({
  open,
  onOpenChange,
  products,
  onApplyFilters,
  currentFilters,
}) => {
  const { brands } = useBrands();
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  // Extract unique values from products
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueColors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const uniqueSizes = [...new Set(products.map(p => p.size).filter(Boolean))];
  
  // Price range
  const minPrice = Math.min(...products.map(p => p.selling_price || 0));
  const maxPrice = Math.max(...products.map(p => p.selling_price || 0));

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchChange = (searchQuery: string) => {
    setFilters(prev => ({
      ...prev,
      searchQuery
    }));
  };

  const handleBrandToggle = (brandId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      brands: checked 
        ? [...prev.brands, brandId]
        : prev.brands.filter(id => id !== brandId)
    }));
  };

  const handleCategoryToggle = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleColorToggle = (color: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      colors: checked 
        ? [...prev.colors, color]
        : prev.colors.filter(c => c !== color)
    }));
  };

  const handleSizeToggle = (size: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      sizes: checked 
        ? [...prev.sizes, size]
        : prev.sizes.filter(s => s !== size)
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      searchQuery: '',
      brands: [],
      categories: [],
      colors: [],
      sizes: [],
      priceRange: [minPrice, maxPrice],
      hasImage: null,
      hasBrand: null,
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.brands.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) count++;
    if (filters.hasImage !== null) count++;
    if (filters.hasBrand !== null) count++;
    return count;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Products
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Global Search */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Search All Fields</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, name, brand, color, size, category, description, pricing..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Search across all product data including SKU, product name, brand, color, size, category, description, and pricing information.
            </p>
          </div>

          {/* Brands Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Brands</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={filters.brands.includes(brand.id.toString())}
                    onCheckedChange={(checked) => handleBrandToggle(brand.id.toString(), checked as boolean)}
                  />
                  <Label htmlFor={`brand-${brand.id}`} className="text-sm">
                    {brand.brand}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categories</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {uniqueCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={filters.categories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                  />
                  <Label htmlFor={`category-${category}`} className="text-sm">
                    {category}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Colors</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {uniqueColors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox
                    id={`color-${color}`}
                    checked={filters.colors.includes(color)}
                    onCheckedChange={(checked) => handleColorToggle(color, checked as boolean)}
                  />
                  <Label htmlFor={`color-${color}`} className="text-sm">
                    {color}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sizes</Label>
            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {uniqueSizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={`size-${size}`}
                    checked={filters.sizes.includes(size)}
                    onCheckedChange={(checked) => handleSizeToggle(size, checked as boolean)}
                  />
                  <Label htmlFor={`size-${size}`} className="text-sm">
                    {size}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Price Range: ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange('priceRange', value)}
              min={minPrice}
              max={maxPrice}
              step={100}
              className="w-full"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || minPrice, filters.priceRange[1]])}
                className="w-24"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || maxPrice])}
                className="w-24"
              />
            </div>
          </div>

          {/* Image and Brand Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Image Status</Label>
              <Select
                value={filters.hasImage === null ? "all" : filters.hasImage ? "yes" : "no"}
                onValueChange={(value) => {
                  const hasImage = value === "all" ? null : value === "yes";
                  handleFilterChange('hasImage', hasImage);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="yes">With Image</SelectItem>
                  <SelectItem value="no">Without Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Brand Status</Label>
              <Select
                value={filters.hasBrand === null ? "all" : filters.hasBrand ? "yes" : "no"}
                onValueChange={(value) => {
                  const hasBrand = value === "all" ? null : value === "yes";
                  handleFilterChange('hasBrand', hasBrand);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="yes">With Brand</SelectItem>
                  <SelectItem value="no">Without Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Clear All
          </Button>
          <Button onClick={handleApplyFilters} className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
