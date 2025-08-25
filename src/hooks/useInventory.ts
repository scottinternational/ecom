import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  sku: string;
  product_name: string;
  brand_name?: string;
  category?: string;
  color?: string;
  size?: string;
  cost_price?: number;
  selling_price?: number;
  image_url?: string;
  // External API inventory data
  available_quantity: number;
  reserved_quantity: number;
  total_quantity: number;
  warehouse_location?: string;
  last_updated?: string;
  reorder_level?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

export interface InventorySummary {
  totalStockValue: number;
  totalProducts: number;
  lowStockAlerts: number;
  outOfStockItems: number;
  overstockItems: number;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface InventoryFilters {
  searchQuery: string;
  status: string;
  category: string;
  brand: string;
  warehouse: string;
  stockLevel: 'all' | 'low' | 'out' | 'overstock';
}

const INVENTORY_API_URL = 'http://64.227.186.227/api/v1/ready_made_products/get_inventory';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<InventorySummary>({
    totalStockValue: 0,
    totalProducts: 0,
    lowStockAlerts: 0,
    outOfStockItems: 0,
    overstockItems: 0,
    totalQuantity: 0,
    reservedQuantity: 0,
    availableQuantity: 0,
  });
  const [filters, setFilters] = useState<InventoryFilters>({
    searchQuery: '',
    status: 'all',
    category: 'all',
    brand: 'all',
    warehouse: 'all',
    stockLevel: 'all',
  });

  // Fetch inventory data from external API
  const fetchInventoryFromAPI = async (): Promise<any[]> => {
    try {
      const response = await fetch(INVENTORY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body as per API specification
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      // Based on Postman response, the structure is: data.data.inventory
      let inventoryArray: any[] = [];
      
      if (data && data.data && Array.isArray(data.data.inventory)) {
        inventoryArray = data.data.inventory;
        console.log('Data found in data.data.inventory property');
      } else if (data && Array.isArray(data.inventory)) {
        inventoryArray = data.inventory;
        console.log('Data found in data.inventory property');
      } else if (data && Array.isArray(data.data)) {
        inventoryArray = data.data;
        console.log('Data found in data.data property');
      } else if (Array.isArray(data)) {
        inventoryArray = data;
        console.log('Data is directly an array');
      } else {
        console.warn('API response does not contain expected array structure:', data);
        return [];
      }

      console.log('Processed inventory array:', inventoryArray);
      return inventoryArray;
    } catch (error) {
      console.error('Error fetching inventory from API:', error);
      throw error;
    }
  };

  // Fetch products from Supabase
  const fetchProductsFromSupabase = async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, brand, logo, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Products fetched from Supabase:', data);
      
      // Log the first product to see the structure
      if (data && data.length > 0) {
        console.log('First product structure:', data[0]);
        console.log('Available fields:', Object.keys(data[0]));
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching products from Supabase:', error);
      throw error;
    }
  };

  // Merge inventory data with product data
  const mergeInventoryData = (apiInventory: any[], products: any[]): InventoryItem[] => {
    // Ensure both parameters are arrays
    if (!Array.isArray(apiInventory)) {
      console.warn('apiInventory is not an array:', apiInventory);
      apiInventory = [];
    }
    
    if (!Array.isArray(products)) {
      console.warn('products is not an array:', products);
      products = [];
    }

    console.log('API Inventory items:', apiInventory);
    console.log('Products from Supabase:', products);
    console.log('Number of API inventory items:', apiInventory.length);
    console.log('Number of products from Supabase:', products.length);

    // Check if SKU field is 'uuid' or 'sku'
    const skuField = products.length > 0 && products[0].uuid ? 'uuid' : 'sku';
    console.log('Using SKU field:', skuField);
    
    const productMap = new Map(products.map(p => [p[skuField], p]));
    // Map API inventory by SKU - API returns {sku, stock} structure
    const inventoryMap = new Map(apiInventory.map(i => [i.sku, i]));

    console.log('Available SKUs in API:', Array.from(inventoryMap.keys()));
    console.log('Available SKUs in Products:', Array.from(productMap.keys()));

    const mergedData: InventoryItem[] = [];
    let matchedCount = 0;
    let unmatchedCount = 0;

    // Process only products that exist in Supabase and merge with inventory data
    products.forEach(product => {
      const productSku = product[skuField];
      const inventoryData = inventoryMap.get(productSku);
      
      if (inventoryData) {
        matchedCount++;
        console.log(`✅ Found inventory for SKU: ${productSku}, Stock: ${inventoryData.stock}`);
      } else {
        unmatchedCount++;
        console.log(`❌ No inventory found for SKU: ${productSku}`);
      }
      
      // API returns stock as the available quantity
      const availableQuantity = inventoryData?.stock || 0;
      
      const item: InventoryItem = {
        sku: productSku,
        product_name: product.product_name || product.name || product.description,
        brand_name: product.brand?.brand,
        category: product.category,
        color: product.color,
        size: product.size,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        image_url: product.image_url, // Use the correct field name
        available_quantity: availableQuantity,
        reserved_quantity: 0, // API doesn't provide reserved quantity
        total_quantity: availableQuantity, // Use stock as total quantity
        warehouse_location: 'WH-SCOTT', // Set default warehouse as requested
        last_updated: new Date().toISOString(),
        reorder_level: 10,
        status: determineStockStatus(availableQuantity, 10),
      };

      // Debug image URL
      if (product.image_url) {
        console.log(`🖼️ Image URL for ${productSku}:`, product.image_url);
      } else {
        console.log(`🖼️ No image URL for ${productSku}`);
      }

      mergedData.push(item);
    });

    console.log(`📊 Inventory matching summary:`);
    console.log(`   - Total products: ${products.length}`);
    console.log(`   - Matched with inventory: ${matchedCount}`);
    console.log(`   - No inventory found: ${unmatchedCount}`);
    console.log(`   - API inventory items: ${apiInventory.length}`);

    // Remove the section that adds inventory items not in products table
    // Only show inventory for existing products

    console.log('Merged inventory data (only existing products):', mergedData);
    return mergedData;
  };

  // Determine stock status based on available quantity and reorder level
  const determineStockStatus = (availableQuantity: number, reorderLevel: number): InventoryItem['status'] => {
    if (availableQuantity === 0) return 'out_of_stock';
    if (availableQuantity <= reorderLevel) return 'low_stock';
    if (availableQuantity > reorderLevel * 3) return 'overstock';
    return 'in_stock';
  };

  // Calculate inventory summary
  const calculateSummary = (inventoryData: InventoryItem[]): InventorySummary => {
    const summary: InventorySummary = {
      totalStockValue: 0,
      totalProducts: inventoryData.length,
      lowStockAlerts: 0,
      outOfStockItems: 0,
      overstockItems: 0,
      totalQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
    };

    inventoryData.forEach(item => {
      // Calculate stock value
      if (item.cost_price && item.available_quantity) {
        summary.totalStockValue += item.cost_price * item.available_quantity;
      }

      // Count by status
      switch (item.status) {
        case 'low_stock':
          summary.lowStockAlerts++;
          break;
        case 'out_of_stock':
          summary.outOfStockItems++;
          break;
        case 'overstock':
          summary.overstockItems++;
          break;
      }

      // Sum quantities
      summary.totalQuantity += item.total_quantity;
      summary.reservedQuantity += item.reserved_quantity;
      summary.availableQuantity += item.available_quantity;
    });

    return summary;
  };

  // Apply filters to inventory data
  const applyFilters = (data: InventoryItem[], filters: InventoryFilters): InventoryItem[] => {
    return data.filter(item => {
      // Search query filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          item.sku.toLowerCase().includes(searchLower) ||
          item.product_name.toLowerCase().includes(searchLower) ||
          (item.brand_name && item.brand_name.toLowerCase().includes(searchLower)) ||
          (item.category && item.category.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Brand filter
      if (filters.brand !== 'all' && item.brand_name !== filters.brand) {
        return false;
      }

      // Warehouse filter - only show WH-SCOTT items
      if (item.warehouse_location !== 'WH-SCOTT') {
        return false;
      }

      // Stock level filter
      if (filters.stockLevel !== 'all') {
        switch (filters.stockLevel) {
          case 'low':
            if (item.status !== 'low_stock') return false;
            break;
          case 'out':
            if (item.status !== 'out_of_stock') return false;
            break;
          case 'overstock':
            if (item.status !== 'overstock') return false;
            break;
        }
      }

      return true;
    });
  };

  // Generate mock inventory data for testing
  const generateMockInventoryData = (products: any[]): any[] => {
    const skuField = products.length > 0 && products[0].uuid ? 'uuid' : 'sku';
    return products.map(product => ({
      sku: product[skuField],
      product_name: product.product_name || product.name || product.description,
      available_quantity: Math.floor(Math.random() * 100) + 1,
      reserved_quantity: Math.floor(Math.random() * 20),
      total_quantity: Math.floor(Math.random() * 120) + 1,
      warehouse_location: ['Warehouse A', 'Warehouse B', 'Warehouse C'][Math.floor(Math.random() * 3)],
      last_updated: new Date().toISOString(),
      reorder_level: 10,
    }));
  };

  // Generate fallback inventory data for SKUs not found in API
  const generateFallbackInventoryData = (products: any[], apiInventory: any[]): any[] => {
    const apiSkuSet = new Set(apiInventory.map(item => item.sku));
    const skuField = products.length > 0 && products[0].uuid ? 'uuid' : 'sku';
    const missingSkus = products.filter(product => !apiSkuSet.has(product[skuField]));
    
    console.log(`🔧 Generating fallback inventory for ${missingSkus.length} missing SKUs`);
    
    return missingSkus.map(product => ({
      sku: product[skuField],
      stock: 0, // Default to 0 stock for missing SKUs
      product_name: product.product_name || product.name || product.description,
    }));
  };

  // Fetch all inventory data
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products from Supabase first
      const products = await fetchProductsFromSupabase();
      
      // Try to fetch from API, fallback to mock data if it fails
      let apiInventory: any[] = [];
      try {
        apiInventory = await fetchInventoryFromAPI();
        console.log('Successfully fetched inventory from API');
        
        // Generate fallback data for SKUs not found in API
        const fallbackInventory = generateFallbackInventoryData(products, apiInventory);
        apiInventory = [...apiInventory, ...fallbackInventory];
        console.log(`📦 Combined API inventory (${apiInventory.length} total items)`);
        
      } catch (apiError) {
        console.warn('API fetch failed, using mock data:', apiError);
        apiInventory = generateMockInventoryData(products);
      }

      // Merge the data
      const mergedData = mergeInventoryData(apiInventory, products);
      setInventory(mergedData);

      // Calculate summary
      const summaryData = calculateSummary(mergedData);
      setSummary(summaryData);

    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  // Get filtered inventory
  const getFilteredInventory = (): InventoryItem[] => {
    return applyFilters(inventory, filters);
  };

  // Update filters
  const updateFilters = (newFilters: Partial<InventoryFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Refresh inventory data
  const refreshInventory = () => {
    fetchInventory();
  };

  // Get unique values for filter options
  const getFilterOptions = () => {
    const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];
    const brands = [...new Set(inventory.map(item => item.brand_name).filter(Boolean))];

    return {
      categories: ['all', ...categories],
      brands: ['all', ...brands],
      warehouses: ['all', 'WH-SCOTT'], // Only WH-SCOTT warehouse
      statuses: ['all', 'in_stock', 'low_stock', 'out_of_stock', 'overstock'],
      stockLevels: ['all', 'low', 'out', 'overstock'],
    };
  };

  // Export inventory data
  const exportInventory = (): string => {
    const filteredData = getFilteredInventory();
    const csvHeader = 'SKU,Product Name,Brand,Category,Color,Size,WH-SCOTT,Cost Price,Selling Price,Stock Value,Status,Last Updated\n';
    
    const csvData = filteredData.map(item => 
      `"${item.sku}","${item.product_name}","${item.brand_name || ''}","${item.category || ''}","${item.color || ''}","${item.size || ''}",${item.available_quantity},${item.cost_price || 0},${item.selling_price || 0},${(item.cost_price || 0) * item.available_quantity},"${item.status}","${item.last_updated || ''}"`
    ).join('\n');
    
    return csvHeader + csvData;
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory: getFilteredInventory(),
    allInventory: inventory,
    loading,
    error,
    summary,
    filters,
    filterOptions: getFilterOptions(),
    fetchInventory,
    refreshInventory,
    updateFilters,
    exportInventory,
  };
};
