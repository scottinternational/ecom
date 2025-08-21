import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, X, Database, Filter } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useNotifications } from "@/hooks/useNotifications";

interface ComprehensiveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearchResults: (results: any[], searchQuery: string) => void;
}

export const ComprehensiveSearchDialog: React.FC<ComprehensiveSearchDialogProps> = ({
  open,
  onOpenChange,
  onSearchResults,
}) => {
  const { searchAllProducts, searchProducts } = useProducts();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFields, setSearchFields] = useState({
    sku: true,
    productName: true,
    description: true,
    brand: true,
    color: true,
    size: true,
    category: true,
    pricing: true,
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      addNotification({
        title: "Search Error",
        message: "Please enter a search term",
        type: "error",
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchAllProducts(searchQuery);
      onSearchResults(results, searchQuery);
      
      // Also update the main search to reflect the results
      await searchProducts(searchQuery);
      
      addNotification({
        title: "Search Complete",
        message: `Found ${results.length} products matching "${searchQuery}"`,
        type: "success",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Search error:', error);
      addNotification({
        title: "Search Error",
        message: "Failed to perform comprehensive search",
        type: "error",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchFields({
      sku: true,
      productName: true,
      description: true,
      brand: true,
      color: true,
      size: true,
      category: true,
      pricing: true,
    });
  };

  const toggleSearchField = (field: keyof typeof searchFields) => {
    setSearchFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getActiveFieldCount = () => {
    return Object.values(searchFields).filter(Boolean).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Comprehensive Database Search
            <Badge variant="secondary" className="ml-2">
              All Data
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Query */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Search Term</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter search term to find across all product data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This search will look through all products in the database, not just the currently loaded ones.
            </p>
          </div>

          {/* Search Fields Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Search Fields ({getActiveFieldCount()} selected)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-sku"
                  checked={searchFields.sku}
                  onCheckedChange={() => toggleSearchField('sku')}
                />
                <Label htmlFor="search-sku" className="text-sm">SKU</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-productName"
                  checked={searchFields.productName}
                  onCheckedChange={() => toggleSearchField('productName')}
                />
                <Label htmlFor="search-productName" className="text-sm">Product Name</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-description"
                  checked={searchFields.description}
                  onCheckedChange={() => toggleSearchField('description')}
                />
                <Label htmlFor="search-description" className="text-sm">Description</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-brand"
                  checked={searchFields.brand}
                  onCheckedChange={() => toggleSearchField('brand')}
                />
                <Label htmlFor="search-brand" className="text-sm">Brand</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-color"
                  checked={searchFields.color}
                  onCheckedChange={() => toggleSearchField('color')}
                />
                <Label htmlFor="search-color" className="text-sm">Color</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-size"
                  checked={searchFields.size}
                  onCheckedChange={() => toggleSearchField('size')}
                />
                <Label htmlFor="search-size" className="text-sm">Size</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-category"
                  checked={searchFields.category}
                  onCheckedChange={() => toggleSearchField('category')}
                />
                <Label htmlFor="search-category" className="text-sm">Category</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="search-pricing"
                  checked={searchFields.pricing}
                  onCheckedChange={() => toggleSearchField('pricing')}
                />
                <Label htmlFor="search-pricing" className="text-sm">Pricing</Label>
              </div>
            </div>
          </div>

          {/* Search Tips */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium">Search Tips:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Search is case-insensitive and matches partial text</li>
              <li>• You can search for SKU numbers, product names, brand names, etc.</li>
              <li>• Search across pricing information (cost price, selling price)</li>
              <li>• Results will show products from the entire database</li>
              <li>• Use specific terms for better results (e.g., "Nike" instead of "brand")</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearSearch}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !searchQuery.trim()}
            className="flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search Database
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
