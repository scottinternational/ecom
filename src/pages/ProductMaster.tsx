import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ExternalLink, Loader2, GripVertical, Search, X, Download, ChevronDown, ZoomIn, Image } from "lucide-react";
import { ProductBulkUploadDialog } from "@/components/ProductBulkUploadDialog";
import { ProductCreateDialog } from "@/components/ProductCreateDialog";
import { ProductFilterDialog, FilterOptions } from "@/components/ProductFilterDialog";
import { ComprehensiveSearchDialog } from "@/components/ComprehensiveSearchDialog";
import { AirtableImageManager } from "@/components/AirtableImageManager";
import { useNotifications } from "@/hooks/useNotifications";
import { useProducts, Product } from "@/hooks/useProducts";
import { useProductImages } from '@/providers/ProductImageProvider';
import { ProductImage } from '@/components/ProductImage';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProductMaster = () => {
  const { addNotification } = useNotifications();
  const { products, loading, error, hasMore, totalCount, fetchProducts, loadMoreProducts, searchProducts, searchAllProducts, fetchAllProductsForExport, deleteProduct, bulkDeleteProducts } = useProducts();
  const { getProductImage, productImages, loading: airtableLoading, fetchAllProductImages, initializeAirtable } = useProductImages();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navigate = useNavigate();

  // Column width management
  const [columnWidths, setColumnWidths] = useState({
    select: 48,
    image: 100,
    sku: 120,
    brand: 150,
    product: 200,
    description: 250,
    pricing: 150,
    color: 100,
    size: 80,
    category: 150,
    created: 100,
    actions: 80
  });

  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; alt: string } | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [comprehensiveSearchDialogOpen, setComprehensiveSearchDialogOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    searchQuery: '',
    brands: [],
    categories: [],
    colors: [],
    sizes: [],
    priceRange: [0, 10000],
    hasImage: null,
    hasBrand: null,
  });
  const [showAirtableManager, setShowAirtableManager] = useState(false);

  const isAllSelected = products.length > 0 && selectedSkus.size === products.length;
  const isIndeterminate = selectedSkus.size > 0 && selectedSkus.size < products.length;

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSkus(new Set(products.map(p => p.sku)));
    } else {
      setSelectedSkus(new Set());
    }
  };

  const toggleSelectOne = (sku: string, checked: boolean) => {
    setSelectedSkus(prev => {
      const next = new Set(prev);
      if (checked) next.add(sku); else next.delete(sku);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedSkus.size === 0) return;
    const confirmDelete = window.confirm(`Delete ${selectedSkus.size} selected product(s)? This cannot be undone.`);
    if (!confirmDelete) return;
    try {
      const ok = await bulkDeleteProducts(Array.from(selectedSkus));
      if (ok) {
        addNotification({ title: "Deleted", message: `Deleted ${selectedSkus.size} product(s)`, type: "success" });
        setSelectedSkus(new Set());
        await fetchProducts();
      } else {
        addNotification({ title: "Delete failed", message: "Some products could not be deleted.", type: "error" });
      }
    } catch (e) {
      addNotification({ title: "Delete failed", message: e instanceof Error ? e.message : "Unknown error", type: "error" });
    }
  };

  const handleImageClick = (imageUrl: string, productName: string) => {
    setPreviewImage({ url: imageUrl, alt: productName });
    setImagePreviewOpen(true);
  };

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const handleSearch = useCallback((query: string) => {
    console.log('handleSearch called with:', query);
    setSearchQuery(query);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      console.log('Executing search for:', query);
      searchProducts(query);
    }, 300); // 300ms delay
  }, [searchProducts]);

  // Clear search
  const clearSearch = () => {
    console.log('Clearing search');
    setSearchQuery('');
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchProducts(''); // This will reset to normal pagination
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Initialize Airtable images on component mount
  useEffect(() => {
    const initializeAirtableImages = async () => {
      try {
        const savedConfig = localStorage.getItem('airtable-image-config');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          console.log('🔧 Initializing Airtable images with saved config:', config);
          
          await initializeAirtable({
            apiKey: config.apiKey,
            baseId: config.baseId,
            productsTable: config.productsTable,
            brandsTable: config.brandsTable,
            imageField: config.imageField,
            skuField: config.skuField,
            nameField: config.nameField,
          });
          
          console.log('✅ Airtable images initialized successfully');
          
          // Fetch all product images
          await fetchAllProductImages();
          console.log('✅ All product images fetched from Airtable');
          
          // Log the state after fetching
          setTimeout(() => {
            console.log('🔍 Post-fetch Airtable images state:', {
              totalImages: productImages.size,
              sampleImages: Array.from(productImages.entries()).slice(0, 3)
            });
          }, 1000);
        } else {
          console.log('ℹ️ No Airtable configuration found in localStorage');
        }
      } catch (error) {
        console.error('❌ Failed to initialize Airtable images:', error);
      }
    };

    initializeAirtableImages();
  }, [initializeAirtable, fetchAllProductImages]);

  // Debug: Log products when they change
  useEffect(() => {
    if (products.length > 0) {
      console.log('📦 Products loaded in ProductMaster:', products.length);
      console.log('🖼️ Sample product with image:', products[0]);
      console.log('🖼️ Airtable images loaded:', productImages.size);
      console.log('🖼️ Airtable images state:', Array.from(productImages.entries()).slice(0, 3));
      
      // Log first few products with their image status
      products.slice(0, 5).forEach((product, index) => {
        const airtableImage = getProductImage(product.sku);
        console.log(`🖼️ Product ${index + 1} (${product.sku}):`, {
          databaseImage: product.image_url || 'none',
          airtableImage: airtableImage ? `${airtableImage.imageUrls.length} images` : 'none',
          airtableUrls: airtableImage?.imageUrls || [],
          hasAirtableImage: !!airtableImage
        });
      });
    }
  }, [products, productImages, getProductImage]);

  // Export functionality
  const exportToCSV = async () => {
    try {
      addNotification({
        title: "Preparing Export",
        message: "Fetching all products for export...",
        type: "info",
      });

      // If there's a search query or active filters, use current filtered results
      // If no search query and no filters, fetch all products from database
      const hasActiveFilters = getActiveFilterCount(activeFilters) > 0;
      const productsToExport = (searchQuery || hasActiveFilters) ? filteredProducts : await fetchAllProductsForExport();

      const headers = [
        'SKU', 'Brand', 'Product Name', 'Description', 'Cost Price', 
        'Selling Price', 'Color', 'Size', 'Category', 'Created Date'
      ];

      const csvData = productsToExport.map(product => [
        product.sku,
        product.brand?.brand || 'No Brand',
        product.product_name,
        product.description || '',
        product.cost_price || 0,
        product.selling_price || 0,
        product.color || '',
        product.size || '',
        product.category || '',
        new Date(product.created_at).toLocaleDateString('en-IN')
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => {
          // Handle special characters and commas in data
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_${(searchQuery || hasActiveFilters) ? 'filtered' : 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        title: "Export Successful",
        message: `Exported ${productsToExport.length} products to CSV${(searchQuery || hasActiveFilters) ? ` (filtered data)` : ' (all products from database)'}`,
        type: "success",
      });
    } catch (error) {
      console.error('Export error:', error);
      addNotification({
        title: "Export Failed",
        message: "Failed to export products. Please try again.",
        type: "error",
      });
    }
  };

  const exportToExcel = async () => {
    try {
      addNotification({
        title: "Preparing Export",
        message: "Fetching all products for export...",
        type: "info",
      });

      // If there's a search query or active filters, use current filtered results
      // If no search query and no filters, fetch all products from database
      const hasActiveFilters = getActiveFilterCount(activeFilters) > 0;
      const productsToExport = (searchQuery || hasActiveFilters) ? filteredProducts : await fetchAllProductsForExport();

      // Create Excel-compatible CSV with BOM for proper encoding
      const headers = [
        'SKU', 'Brand', 'Product Name', 'Description', 'Cost Price (₹)', 
        'Selling Price (₹)', 'Margin (%)', 'Color', 'Size', 'Category', 'Created Date'
      ];

      const excelData = productsToExport.map(product => {
        const margin = product.cost_price && product.selling_price 
          ? ((product.selling_price - product.cost_price) / product.selling_price * 100).toFixed(1)
          : '0';
        
        return [
          product.sku,
          product.brand?.brand || 'No Brand',
          product.product_name,
          product.description || '',
          product.cost_price || 0,
          product.selling_price || 0,
          margin,
          product.color || '',
          product.size || '',
          product.category || '',
          new Date(product.created_at).toLocaleDateString('en-IN')
        ];
      });

      // Add BOM for Excel compatibility
      const BOM = '\uFEFF';
      const csvContent = BOM + [
        headers.join(','),
        ...excelData.map(row => row.map(cell => {
          // Handle special characters and commas in data
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_${(searchQuery || hasActiveFilters) ? 'filtered' : 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        title: "Export Successful",
        message: `Exported ${productsToExport.length} products to Excel-compatible CSV${(searchQuery || hasActiveFilters) ? ` (filtered data)` : ' (all products from database)'}`,
        type: "success",
      });
    } catch (error) {
      console.error('Export error:', error);
      addNotification({
        title: "Export Failed",
        message: "Failed to export products. Please try again.",
        type: "error",
      });
    }
  };

  const exportToPDF = async () => {
    try {
      addNotification({
        title: "Preparing Export",
        message: "Fetching all products for export...",
        type: "info",
      });

      // If there's a search query or active filters, use current filtered results
      // If no search query and no filters, fetch all products from database
      const hasActiveFilters = getActiveFilterCount(activeFilters) > 0;
      const productsToExport = (searchQuery || hasActiveFilters) ? filteredProducts : await fetchAllProductsForExport();

      // For PDF export, we'll create a simple HTML table and convert it
      const tableData = productsToExport.map(product => {
        const margin = product.cost_price && product.selling_price 
          ? ((product.selling_price - product.cost_price) / product.selling_price * 100).toFixed(1)
          : '0';
        
        return {
          sku: product.sku,
          brand: product.brand?.brand || 'No Brand',
          product: product.product_name,
          description: product.description || '',
          cost: `₹${product.cost_price || 0}`,
          selling: `₹${product.selling_price || 0}`,
          margin: `${margin}%`,
          color: product.color || '',
          size: product.size || '',
          category: product.category || '',
          created: new Date(product.created_at).toLocaleDateString('en-IN'),
          image_url: product.image_url // Include original image URL
        };
      });

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Products Export</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
                     <div class="header">
             <h1>Product Master Data</h1>
             <p>${(searchQuery || hasActiveFilters) ? `Filtered Data` : 'All Products'}</p>
             <p>Exported on: ${new Date().toLocaleString('en-IN')}</p>
           </div>
          <div class="summary">
            <p><strong>Total Products:</strong> ${productsToExport.length}</p>
            <p><strong>Products with Brand:</strong> ${productsToExport.filter(p => p.brand).length}</p>
            <p><strong>Products with Category:</strong> ${productsToExport.filter(p => p.category).length}</p>
          </div>
          <table>
            <thead>
              <tr>
              <th>Image</th>
                <th>SKU</th>
                <th>Brand</th>
                <th>Product</th>
                <th>Description</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Margin</th>
                <th>Color</th>
                <th>Size</th>
                <th>Category</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${tableData.map(row => {
                // Get image for this specific product
                const airtableImage = getProductImage(row.sku);
                const imageUrl = airtableImage?.imageUrls?.[0] || row.image_url || '';
                
                return `
                <tr>
                  <td>${imageUrl ? `<img src="${imageUrl}" alt="Product Image" style="width: 50px; height: 50px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 4px;">` : '<div style="width: 50px; height: 50px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb; border-radius: 4px;"><span style="font-size: 10px; color: #6b7280; text-align: center;">No<br>Image</span></div>'}</td>
                  <td>${row.sku}</td>
                  <td>${row.brand}</td>
                  <td>${row.product}</td>
                  <td>${row.description}</td>
                  <td>${row.cost}</td>
                  <td>${row.selling}</td>
                  <td>${row.margin}</td>
                  <td>${row.color}</td>
                  <td>${row.size}</td>
                  <td>${row.category}</td>
                  <td>${row.created}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

         const blob = new Blob([htmlContent], { type: 'text/html' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.setAttribute('href', url);
     link.setAttribute('download', `products_${(searchQuery || hasActiveFilters) ? 'filtered' : 'all'}_${new Date().toISOString().split('T')[0]}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

         addNotification({
       title: "Export Successful",
       message: `Exported ${productsToExport.length} products to HTML (can be opened in browser and saved as PDF)${(searchQuery || hasActiveFilters) ? ` (filtered data)` : ' (all products from database)'}`,
       type: "success",
     });
  } catch (error) {
    console.error('Export error:', error);
    addNotification({
      title: "Export Failed",
      message: "Failed to export products. Please try again.",
      type: "error",
    });
  }
};

  // Column resizing handlers
  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column as keyof typeof columnWidths]);
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizingColumn) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + deltaX); // Minimum width of 80px
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  }, [isResizing, resizingColumn, startX, startWidth]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizingColumn(null);
  }, []);

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Infinite scroll logic
  const lastElementRef = useCallback((node: HTMLTableRowElement) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMoreProducts]);

  // Debug logging
  console.log('ProductMaster render:', { 
    productsLength: products.length, 
    totalCount,
    loading, 
    error,
    hasMore,
    searchQuery,
    productsWithBrand: products.filter(p => p.brand).length,
    productsWithCategory: products.filter(p => p.category).length,
    expectedTotal: 2023 // Expected total from database
  });

  // Debug search results
  useEffect(() => {
    if (searchQuery) {
      console.log('Search debug:', {
        searchQuery,
        productsLength: products.length,
        firstFewProducts: products.slice(0, 3).map(p => ({
          sku: p.sku,
          product_name: p.product_name,
          brand: p.brand?.brand,
          color: p.color,
          size: p.size,
          category: p.category
        }))
      });
    }
  }, [searchQuery, products]);

  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  const handleComprehensiveSearchResults = async (results: Product[], searchQuery: string) => {
    // Update the main search query to reflect the comprehensive search
    setSearchQuery(searchQuery);
    console.log('Comprehensive search completed with', results.length, 'results for query:', searchQuery);
  };

  const handleApplyFilters = async (filters: FilterOptions) => {
    setActiveFilters(filters);
    
    // If there's a search query in filters, perform comprehensive search
    if (filters.searchQuery.trim()) {
      setSearchQuery(filters.searchQuery);
      
      try {
        // Use comprehensive search across all database
        const searchResults = await searchAllProducts(filters.searchQuery);
        
        // Update the products state with search results
        // Note: This will override the current products with search results
        // The searchProducts function will handle the state management
        await searchProducts(filters.searchQuery);
        
        addNotification({
          title: "Search Complete",
          message: `Found ${searchResults.length} products matching "${filters.searchQuery}"`,
          type: "success",
        });
      } catch (error) {
        console.error('Search error:', error);
        addNotification({
          title: "Search Error",
          message: "Failed to perform comprehensive search",
          type: "error",
        });
      }
    } else if (searchQuery.trim()) {
      // If filters don't have search but main search does, clear it
      setSearchQuery('');
      searchProducts('');
    }
    
    addNotification({
      title: "Filters Applied",
      message: `Applied ${getActiveFilterCount(filters)} filter(s)`,
      type: "success",
    });
  };

  const getActiveFilterCount = (filters: FilterOptions) => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.brands.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 10000) count++;
    if (filters.hasImage !== null) count++;
    if (filters.hasBrand !== null) count++;
    return count;
  };

  // Apply filters to products
  const filteredProducts = products.filter(product => {
    // Search filter - search across all fields
    if (activeFilters.searchQuery.trim()) {
      const searchTerm = activeFilters.searchQuery.toLowerCase().trim();
      const searchableFields = [
        product.sku,
        product.product_name,
        product.description,
        product.color,
        product.size,
        product.category,
        product.brand?.brand,
        product.cost_price?.toString(),
        product.selling_price?.toString()
      ].filter(Boolean);

      const matchesSearch = searchableFields.some(field => 
        field?.toLowerCase().includes(searchTerm)
      );

      if (!matchesSearch) {
        return false;
      }
    }

    // Brand filter
    if (activeFilters.brands.length > 0 && !activeFilters.brands.includes(product.brand_id?.toString() || '')) {
      return false;
    }

    // Category filter
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(product.category || '')) {
      return false;
    }

    // Color filter
    if (activeFilters.colors.length > 0 && !activeFilters.colors.includes(product.color || '')) {
      return false;
    }

    // Size filter
    if (activeFilters.sizes.length > 0 && !activeFilters.sizes.includes(product.size || '')) {
      return false;
    }

    // Price range filter
    const sellingPrice = product.selling_price || 0;
    if (sellingPrice < activeFilters.priceRange[0] || sellingPrice > activeFilters.priceRange[1]) {
      return false;
    }

    // Image status filter
    if (activeFilters.hasImage !== null) {
      const hasImage = !!product.image_url;
      if (activeFilters.hasImage !== hasImage) {
        return false;
      }
    }

    // Brand status filter
    if (activeFilters.hasBrand !== null) {
      const hasBrand = !!product.brand;
      if (activeFilters.hasBrand !== hasBrand) {
        return false;
      }
    }

    return true;
  });

  const handleRefreshClick = async () => {
    addNotification({
      title: "Refreshing Data",
      message: "Fetching latest product data...",
      type: "info",
    });
    await fetchProducts();
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "₹0";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateMargin = (costPrice: number | null, sellingPrice: number | null) => {
    if (!costPrice || !sellingPrice || sellingPrice === 0) return "0%";
    const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    return `${margin.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Products</h2>
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
          <h1 className="text-3xl font-bold text-foreground">Product Master</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive product management and analytics
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            </div>
            <Input
              placeholder="Search across all product data: SKU, name, brand, color, size, category, description, pricing..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-12 h-11 bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md focus:shadow-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-lg transition-colors duration-200"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </Button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium text-primary">{products.length}</span> of <span className="font-medium">{totalCount}</span> products
              </p>
              <div className="flex items-center space-x-2">
                {loading && (
                  <div className="flex items-center space-x-1">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Searching...</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    console.log('Comprehensive search for:', searchQuery);
                    try {
                      const searchResults = await searchAllProducts(searchQuery);
                      addNotification({
                        title: "Comprehensive Search Complete",
                        message: `Found ${searchResults.length} products across entire database`,
                        type: "success",
                      });
                      // Update the search results
                      await searchProducts(searchQuery);
                    } catch (error) {
                      addNotification({
                        title: "Search Error",
                        message: "Failed to perform comprehensive search",
                        type: "error",
                      });
                    }
                  }}
                  className="text-xs h-6 px-2"
                >
                  Search All Data
                </Button>
              </div>
            </div>
          )}
        </div>
        
                 <div className="flex gap-2">
           <Button 
             variant="outline"
             onClick={() => setComprehensiveSearchDialogOpen(true)}
           >
             <Search className="h-4 w-4 mr-2" />
             Search All Data
           </Button>
           <Button 
             variant="outline"
             onClick={handleFilterClick}
           >
             <Filter className="h-4 w-4 mr-2" />
             Filter
             {getActiveFilterCount(activeFilters) > 0 && (
               <Badge variant="secondary" className="ml-2">
                 {getActiveFilterCount(activeFilters)}
               </Badge>
             )}
           </Button>
          <Button 
            variant="outline"
            onClick={handleRefreshClick}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          {/* Export Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={products.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <span className="flex items-center">
                  📄 Export to CSV
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <span className="flex items-center">
                  📊 Export to Excel (CSV)
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}>
                <span className="flex items-center">
                  📋 Export to PDF (HTML)
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ProductBulkUploadDialog />
          <ProductCreateDialog />
                                 <Button 
              variant="outline"
              onClick={() => setShowAirtableManager(true)}
            >
              <Image className="h-4 w-4 mr-2" />
              Airtable Images
              {productImages.size > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  {productImages.size}
                </span>
              )}
            </Button>
                       <Button 
             variant="outline"
             onClick={async () => {
               try {
                 console.log('🔄 Manually refreshing Airtable images...');
                 await fetchAllProductImages();
                 console.log('✅ Manual refresh completed');
                 
                 // Test a few image URLs after refresh
                 setTimeout(() => {
                   console.log('🔍 Testing image URLs after refresh:');
                   const testSkus = ['SCRN-BU-S', 'SCRN-BU-M', 'SCRN-BU-L'];
                   testSkus.forEach(sku => {
                     const airtableImage = getProductImage(sku);
                     if (airtableImage?.imageUrls?.[0]) {
                       console.log(`Testing ${sku}: ${airtableImage.imageUrls[0]}`);
                       // Test image loading using fetch
                       fetch(airtableImage.imageUrls[0], { method: 'HEAD' })
                         .then(() => console.log(`✅ Image loads successfully for ${sku}`))
                         .catch(() => console.log(`❌ Image fails to load for ${sku}`));
                     } else {
                       console.log(`❌ No image found for ${sku}`);
                     }
                   });
                 }, 1000);
               } catch (error) {
                 console.error('❌ Manual refresh failed:', error);
               }
             }}
             disabled={airtableLoading}
           >
             {airtableLoading ? 'Loading...' : 'Refresh Images'}
           </Button>
                                  <Button 
             variant="outline"
             onClick={() => {
               console.log('🔍 Debug: Current Airtable images state:', {
                 totalImages: productImages.size,
                 sampleImages: Array.from(productImages.entries()).slice(0, 3),
                 loading: airtableLoading,
                 allImageKeys: Array.from(productImages.keys())
               });
               
               // Test all visible products
               console.log('🔍 Testing all visible products:');
               products.forEach((product, index) => {
                 const airtableImage = getProductImage(product.sku);
                 console.log(`${index + 1}. SKU: ${product.sku}`, {
                   hasAirtableImage: !!airtableImage,
                   airtableImageUrls: airtableImage?.imageUrls?.length || 0,
                   firstImageUrl: airtableImage?.imageUrls?.[0] || 'none',
                   databaseImage: product.image_url || 'none',
                   finalImageUrl: airtableImage?.imageUrls?.[0] || product.image_url || 'none'
                 });
                 
                 // Test if the image URL is accessible
                 const testUrl = airtableImage?.imageUrls?.[0] || product.image_url;
                 if (testUrl && testUrl !== 'none') {
                   fetch(testUrl, { method: 'HEAD' })
                     .then(() => console.log(`✅ Image URL accessible for ${product.sku}:`, testUrl))
                     .catch(() => console.log(`❌ Image URL not accessible for ${product.sku}:`, testUrl));
                 }
               });
               
               // Test specific SKUs that should have images
               const testSkus = ['SCRN-BU-S', 'SCRN-BU-M', 'SCRN-BU-L', 'SCRN-BU-XL', 'SCRN-BU-XXL', 'SCRN-BU-XXXL'];
               console.log('🔍 Testing specific SKUs:');
               testSkus.forEach(sku => {
                 const airtableImage = getProductImage(sku);
                 console.log(`SKU ${sku}:`, {
                   found: !!airtableImage,
                   imageUrls: airtableImage?.imageUrls || [],
                   firstUrl: airtableImage?.imageUrls?.[0] || 'none'
                 });
               });
               
               // Test if any of the visible products have Airtable images
               const productsWithAirtableImages = products.filter(product => {
                 const airtableImage = getProductImage(product.sku);
                 return !!airtableImage && airtableImage.imageUrls.length > 0;
               });
               
               console.log(`📊 Summary: ${productsWithAirtableImages.length}/${products.length} visible products have Airtable images`);
               
               if (productsWithAirtableImages.length === 0) {
                 console.log('❌ No visible products have Airtable images. This might indicate:');
                 console.log('1. Images are not being loaded properly');
                 console.log('2. SKU matching is not working');
                 console.log('3. The visible products are not in the Airtable data');
               }
             }}
           >
             Debug Images
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                                 <div className="text-2xl font-bold text-foreground">
                   {searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts.length : totalCount}
                   {!searchQuery && getActiveFilterCount(activeFilters) === 0 && products.length > 0 && products.length < totalCount && (
                     <span className="text-xs text-muted-foreground ml-2">
                       ({products.length} loaded)
                     </span>
                   )}
                 </div>
                                 <p className="text-xs text-info">
                   {searchQuery ? 'Search results' : getActiveFilterCount(activeFilters) > 0 ? 'Filtered results' : (products.length > 0 ? 'In catalog' : 'Loading products...')}
                 </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products with Brand
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                                 <div className="text-2xl font-bold text-foreground">
                   {searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts.filter(p => p.brand).length : (products.length > 0 ? products.filter(p => p.brand).length : '-')}
                 </div>
                                 <p className="text-xs text-success">
                   {searchQuery || getActiveFilterCount(activeFilters) > 0 ? 'Filtered branded products' : (products.length > 0 ? 'Branded products' : 'Loading...')}
                 </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products with Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                                 <div className="text-2xl font-bold text-foreground">
                   {searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts.filter(p => p.category).length : (products.length > 0 ? products.filter(p => p.category).length : '-')}
                 </div>
                                 <p className="text-xs text-warning">
                   {searchQuery || getActiveFilterCount(activeFilters) > 0 ? 'Filtered categorized products' : (products.length > 0 ? 'Categorized products' : 'Loading...')}
                 </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                                 <div className="text-2xl font-bold text-foreground">
                   {(searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).length > 0 
                     ? calculateMargin(
                         (searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).reduce((sum, p) => sum + (p.cost_price || 0), 0) / (searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).length,
                         (searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).reduce((sum, p) => sum + (p.selling_price || 0), 0) / (searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).length
                       )
                     : "-"
                   }
                 </div>
                                 <p className="text-xs text-success">
                   {searchQuery || getActiveFilterCount(activeFilters) > 0 ? 'Filtered average margin' : ((searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).length > 0 ? 'Average profit margin' : 'Loading...')}
                 </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Product Master Data</CardTitle>
          <CardDescription>Complete product information with pricing and specifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              ))}
            </div>
          ) : (
            <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-muted-foreground">
                {selectedSkus.size > 0 ? `${selectedSkus.size} selected` : ''}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedSkus.size === 0}
                  onClick={handleBulkDelete}
                >
                  Delete Selected
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'select' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.select }}
                    onMouseDown={(e) => handleResizeStart(e, 'select')}
                  >
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                        aria-checked={isIndeterminate ? 'mixed' : isAllSelected}
                      />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'image' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.image }}
                    onMouseDown={(e) => handleResizeStart(e, 'image')}
                  >
                    <div className="flex items-center justify-center">
                      <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'sku' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.sku }}
                    onMouseDown={(e) => handleResizeStart(e, 'sku')}
                  >
                    <div className="flex items-center">
                      SKU
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'brand' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.brand }}
                    onMouseDown={(e) => handleResizeStart(e, 'brand')}
                  >
                    <div className="flex items-center">
                      Brand
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'product' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.product }}
                    onMouseDown={(e) => handleResizeStart(e, 'product')}
                  >
                    <div className="flex items-center">
                      Product
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'description' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.description }}
                    onMouseDown={(e) => handleResizeStart(e, 'description')}
                  >
                    <div className="flex items-center">
                      Description
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'pricing' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.pricing }}
                    onMouseDown={(e) => handleResizeStart(e, 'pricing')}
                  >
                    <div className="flex items-center">
                      Pricing
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'color' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.color }}
                    onMouseDown={(e) => handleResizeStart(e, 'color')}
                  >
                    <div className="flex items-center">
                      Color
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'size' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.size }}
                    onMouseDown={(e) => handleResizeStart(e, 'size')}
                  >
                    <div className="flex items-center">
                      Size
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'category' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.category }}
                    onMouseDown={(e) => handleResizeStart(e, 'category')}
                  >
                    <div className="flex items-center">
                      Category
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'created' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.created }}
                    onMouseDown={(e) => handleResizeStart(e, 'created')}
                  >
                    <div className="flex items-center">
                      Created
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className={`relative hover:bg-muted/50 transition-colors ${isResizing && resizingColumn === 'actions' ? 'cursor-col-resize' : ''}`}
                    style={{ width: columnWidths.actions }}
                    onMouseDown={(e) => handleResizeStart(e, 'actions')}
                  >
                    <div className="flex items-center">
                      Actions
                      <GripVertical className="ml-2 h-4 w-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-col-resize" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                                 {(searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">No products found</p>
                        <p>Create your first product to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                                     (searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).map((product, index) => (
                    <TableRow
                      key={product.id}
                                             ref={index === (searchQuery || getActiveFilterCount(activeFilters) > 0 ? filteredProducts : products).length - 1 ? lastElementRef : null}
                      onClick={() => navigate(`/products/master/${product.id}`)}
                      className="cursor-pointer hover:bg-muted/40"
                    >
                      <TableCell style={{ width: columnWidths.select }}>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            onClick={(e) => e.stopPropagation()}
                            checked={selectedSkus.has(product.sku)}
                            onCheckedChange={(v) => toggleSelectOne(product.sku, Boolean(v))}
                          />
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.image }}>
                        <ProductImage
                          sku={product.sku}
                          productName={product.product_name}
                          imageUrl={product.image_url}
                          airtableImageUrl={getProductImage(product.sku)?.imageUrls?.[0]}
                          size="lg"
                          showZoom={true}
                          showAirtableIndicator={true}
                          onClick={handleImageClick}
                          onImageLoad={(sku, source) => {
                            if (index < 3) {
                              console.log(`✅ Product image loaded for ${sku} from ${source}`);
                            }
                          }}
                          onImageError={(sku, imageUrl) => {
                            console.log(`❌ Product image failed to load for ${sku}:`, imageUrl);
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ width: columnWidths.sku }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/products/master/${product.id}`); }}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {product.sku}
                        </button>
                      </TableCell>
                                             <TableCell style={{ width: columnWidths.brand }}>
                         {product.brand ? (
                           <div className="flex items-center space-x-2">
                             {product.brand.logo ? (
                               <div className="h-16 w-16 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                                 <img 
                                   src={product.brand.logo} 
                                   alt={product.brand.brand}
                                   className="h-full w-full object-contain"
                                   onError={(e) => {
                                     console.log(`❌ Brand logo failed to load for ${product.brand.brand}:`, product.brand.logo);
                                     const target = e.target as HTMLImageElement;
                                     target.style.display = 'none';
                                     const fallback = target.parentElement?.querySelector('.brand-logo-fallback');
                                     if (fallback) {
                                       fallback.classList.remove('hidden');
                                       console.log(`✅ Brand logo fallback shown for ${product.brand.brand}`);
                                     } else {
                                       console.log(`❌ Brand logo fallback element not found for ${product.brand.brand}`);
                                     }
                                   }}
                                   onLoad={() => {
                                     console.log(`✅ Brand logo loaded successfully for ${product.brand.brand}`);
                                   }}
                                 />
                                 <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground brand-logo-fallback hidden">
                                   <div className="text-center">
                                     <div className="text-lg font-bold text-muted-foreground">{product.brand.brand.charAt(0).toUpperCase()}</div>
                                   </div>
                                 </div>
                               </div>
                             ) : (
                               <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border border-border">
                                 <div className="text-center">
                                   <div className="text-lg font-bold text-muted-foreground">{product.brand.brand.charAt(0).toUpperCase()}</div>
                                 </div>
                               </div>
                             )}
                             <span className="text-sm font-medium whitespace-normal break-words">{product.brand.brand}</span>
                           </div>
                         ) : (
                           <span className="text-sm text-muted-foreground">No brand</span>
                         )}
                       </TableCell>
                      <TableCell style={{ width: columnWidths.product }}>
                        <div className="flex items-center space-x-3">
                          <div className="whitespace-normal break-words">
                            <p className="text-sm font-medium">{product.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.description }}>
                        <div className="whitespace-normal break-words">
                          <p className="text-sm text-muted-foreground">
                            {product.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.pricing }}>
                        <div className="space-y-1 whitespace-normal">
                          <p className="text-sm">Cost: {formatPrice(product.cost_price)}</p>
                          <p className="text-sm font-medium">Selling: {formatPrice(product.selling_price)}</p>
                          <p className="text-xs text-success">
                            Margin: {calculateMargin(product.cost_price, product.selling_price)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.color }}>
                        <span className="text-sm font-medium">
                          {product.color || 'No color'}
                        </span>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.size }}>
                        <span className="text-sm font-medium">
                          {product.size || 'No size'}
                        </span>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.category }}>
                        <span className="text-sm font-medium">
                          {product.category || 'No category'}
                        </span>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.created }}>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(product.created_at)}
                        </span>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.actions }}>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); navigate(`/products/master/${product.id}`); }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const ok = window.confirm(`Delete ${product.product_name}? This cannot be undone.`);
                              if (!ok) return;
                              try {
                                await deleteProduct(product.id);
                                addNotification({ title: "Deleted", message: `${product.product_name} deleted`, type: "success" });
                              } catch (e) {
                                addNotification({ title: "Delete failed", message: e instanceof Error ? e.message : "Unknown error", type: "error" });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                                 {/* Loading indicator for infinite scroll */}
                 {hasMore && !searchQuery && getActiveFilterCount(activeFilters) === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          Loading more products... ({products.length} of {totalCount})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                                 {/* Load more button */}
                 {hasMore && !loading && !searchQuery && getActiveFilterCount(activeFilters) === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4">
                      <Button
                        variant="outline"
                        onClick={loadMoreProducts}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          `Load More (${products.length} of ${totalCount})`
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </>
          )}
        </CardContent>
      </Card>

             {/* Product Filter Dialog */}
       <ProductFilterDialog
         open={filterDialogOpen}
         onOpenChange={setFilterDialogOpen}
         products={products}
         onApplyFilters={handleApplyFilters}
         currentFilters={activeFilters}
       />

       {/* Comprehensive Search Dialog */}
       <ComprehensiveSearchDialog
         open={comprehensiveSearchDialogOpen}
         onOpenChange={setComprehensiveSearchDialogOpen}
         onSearchResults={handleComprehensiveSearchResults}
       />

       {/* Image Preview Modal */}
       <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>Product Image Preview</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImagePreviewOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            {previewImage && (
              <div className="flex justify-center">
                <div className="relative max-w-full max-h-[70vh] overflow-hidden rounded-lg">
                  <img
                    src={previewImage.url}
                    alt={previewImage.alt}
                    className="max-w-full max-h-[70vh] object-contain"
                    onError={(e) => {
                      console.log(`❌ Preview image failed to load:`, previewImage.url);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                        console.log(`✅ Preview fallback shown`);
                      } else {
                        console.log(`❌ Preview fallback element not found`);
                      }
                    }}
                    onLoad={() => {
                      console.log(`✅ Preview image loaded successfully:`, previewImage.url);
                    }}
                  />
                  <div className="absolute inset-0 bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground hidden">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🖼️</div>
                      <span>Image not available</span>
                      <p className="text-sm mt-1">The image URL is no longer accessible</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Airtable Image Manager Dialog */}
      <Dialog open={showAirtableManager} onOpenChange={setShowAirtableManager}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>Airtable Image Management</span>
            </DialogTitle>
          </DialogHeader>
                     <AirtableImageManager 
             onImagesLoaded={() => {
               // This callback is not needed since ProductMaster uses the same useProductImages hook
               // The state will be automatically updated
             }}
           />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductMaster;
