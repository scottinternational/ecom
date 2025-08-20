import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  sku: string;
  brand_id: number | null;
  product_name: string;
  description: string | null;
  cost_price: number | null;
  selling_price: number | null;
  color: string | null;
  size: string | null;
  category: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  brand?: {
    id: number;
    brand: string;
    logo: string | null;
    created_at: string;
  };
}

export interface CreateProductData {
  sku: string;
  brand_id: number | null;
  product_name: string;
  description?: string;
  cost_price?: number;
  selling_price?: number;
  color?: string;
  size?: string;
  category?: string;
  image_url?: string;
}

export interface CSVProduct {
  action: 'add' | 'update' | 'remove';
  sku: string;
  brand: string;
  product_name: string;
  description?: string;
  cost_price?: number;
  selling_price?: number;
  color?: string;
  size?: string;
  category?: string;
  image_url?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 100; // Load 100 products at a time for table display

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products_images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products_images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error in uploadProductImage:', err);
      throw err;
    }
  };

  // Fetch a single product by id (used by details page to avoid reloading full list)
  const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, brand, logo, created_at)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product by id:', error);
        return null;
      }

      return data as Product;
    } catch (err) {
      console.error('Exception in fetchProductById:', err);
      return null;
    }
  };

  const loadMoreProducts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      
      const from = currentPage * pageSize;
      console.log(`Loading more products: page ${currentPage + 1}, from ${from} to ${from + pageSize - 1}`);

      const { data: pageData, error: pageError } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, brand, logo, created_at)
        `)
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (pageError) {
        console.error('Error loading more products:', pageError);
        setError(pageError.message);
        return;
      }

      if (pageData && pageData.length > 0) {
        setProducts(prev => [...prev, ...pageData]);
        setCurrentPage(prev => prev + 1);
        setHasMore(pageData.length === pageSize);
        console.log(`Loaded ${pageData.length} more products. Total loaded: ${products.length + pageData.length}`);
      } else {
        setHasMore(false);
        console.log('No more products to load');
      }
    } catch (err) {
      console.error('Error in loadMoreProducts:', err);
      setError('Failed to load more products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (reset = true) => {
    try {
      setLoading(true);
      setError(null);

      if (reset) {
        setProducts([]);
        setCurrentPage(0);
        setHasMore(true);
      }

      console.log('Fetching products...');

      // First, get the total count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting product count:', countError);
        setError(countError.message);
        return;
      }

      setTotalCount(count || 0);
      console.log('Total products in database:', count);

      // Load first page immediately
      const from = 0;
      console.log(`Loading first page: from ${from} to ${from + pageSize - 1}`);

      const { data: pageData, error: pageError } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, brand, logo, created_at)
        `)
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (pageError) {
        console.error('Error loading first page:', pageError);
        setError(pageError.message);
        return;
      }

      if (pageData && pageData.length > 0) {
        setProducts(pageData);
        setCurrentPage(1);
        setHasMore(pageData.length === pageSize);
        console.log(`Loaded first page: ${pageData.length} products. Total: ${pageData.length}`);
      } else {
        setHasMore(false);
        console.log('No products found in first page');
      }
    } catch (err) {
      console.error('Error in fetchProducts:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductData, imageFile?: File) => {
    try {
      let imageUrl = productData.image_url;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const { data, error: createError } = await supabase
        .from('products')
        .insert([{ ...productData, image_url: imageUrl }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating product:', createError);
        throw new Error(createError.message);
      }

      // Refresh the products list
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Error in createProduct:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<CreateProductData>, imageFile?: File) => {
    try {
      let imageUrl = updates.image_url;

      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      const { data, error: updateError } = await supabase
        .from('products')
        .update({ ...updates, image_url: imageUrl })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating product:', updateError);
        throw new Error(updateError.message);
      }

      // Refresh the products list
      await fetchProducts();
      return data;
    } catch (err) {
      console.error('Error in updateProduct:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting product:', deleteError);
        throw new Error(deleteError.message);
      }

      // Refresh the products list
      await fetchProducts();
    } catch (err) {
      console.error('Error in deleteProduct:', err);
      throw err;
    }
  };

  const bulkCreateProducts = async (products: CreateProductData[]): Promise<boolean> => {
    try {
      console.log('Bulk creating products:', products);
      
      const { data, error } = await supabase
        .from('products')
        .insert(products)
        .select();

      if (error) {
        console.error('Bulk create error:', error);
        return false;
      }

      console.log('Bulk create success:', data);
      return true;
    } catch (error) {
      console.error('Bulk create exception:', error);
      return false;
    }
  };

  const bulkUpdateProducts = async (products: CreateProductData[]): Promise<boolean> => {
    try {
      console.log('Bulk updating products:', products);
      
      const results = await Promise.all(
        products.map(async (product) => {
          const { data, error } = await supabase
            .from('products')
            .update({
              brand_id: product.brand_id,
              product_name: product.product_name,
              description: product.description,
              cost_price: product.cost_price,
              selling_price: product.selling_price,
              color: product.color,
              size: product.size,
              category: product.category,
              image_url: product.image_url,
              updated_at: new Date().toISOString()
            })
            .eq('sku', product.sku)
            .select();

          if (error) {
            console.error(`Update error for SKU ${product.sku}:`, error);
            return false;
          }

          console.log(`Update success for SKU ${product.sku}:`, data);
          return true;
        })
      );

      return results.every(result => result);
    } catch (error) {
      console.error('Bulk update exception:', error);
      return false;
    }
  };

  const bulkDeleteProducts = async (skus: string[]): Promise<boolean> => {
    try {
      console.log('Bulk deleting products with SKUs:', skus);
      
      const { data, error } = await supabase
        .from('products')
        .delete()
        .in('sku', skus)
        .select();

      if (error) {
        console.error('Bulk delete error:', error);
        return false;
      }

      console.log('Bulk delete success:', data);
      return true;
    } catch (error) {
      console.error('Bulk delete exception:', error);
      return false;
    }
  };

  const searchProducts = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!searchTerm.trim()) {
        // If search is empty, load first page normally
        await fetchProducts();
        return;
      }

      console.log('Searching products with term:', searchTerm);

      // Simple and reliable search approach
      const { data, error: searchError } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, brand, logo, created_at)
        `)
        .or(`sku.ilike.%${searchTerm}%,product_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%,size.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (searchError) {
        console.error('Error in search:', searchError);
        // Fallback to client-side search
        const searchTermLower = searchTerm.toLowerCase().trim();
        const filtered = products.filter(product => {
          return (
            product.sku.toLowerCase().includes(searchTermLower) ||
            product.product_name.toLowerCase().includes(searchTermLower) ||
            (product.description && product.description.toLowerCase().includes(searchTermLower)) ||
            (product.color && product.color.toLowerCase().includes(searchTermLower)) ||
            (product.size && product.size.toLowerCase().includes(searchTermLower)) ||
            (product.category && product.category.toLowerCase().includes(searchTermLower)) ||
            (product.brand && product.brand.brand.toLowerCase().includes(searchTermLower)) ||
            (product.cost_price && product.cost_price.toString().includes(searchTerm)) ||
            (product.selling_price && product.selling_price.toString().includes(searchTerm))
          );
        });

        console.log('Client-side search results:', { 
          count: filtered.length, 
          searchTerm,
          results: filtered.slice(0, 3)
        });

        setProducts(filtered);
        setTotalCount(filtered.length);
        setCurrentPage(1);
        setHasMore(false);
        return;
      }

      // Also search for brand names
      const { data: brandData, error: brandError } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(id, brand, logo, created_at)
        `)
        .not('brand_id', 'is', null)
        .order('created_at', { ascending: false });

      let brandFilteredData: any[] = [];
      if (!brandError && brandData) {
        brandFilteredData = brandData.filter(product => 
          product.brand?.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Combine and deduplicate results
      const allResults = [...(data || []), ...brandFilteredData];
      const uniqueResults = allResults.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );

      console.log('Search results:', { 
        count: uniqueResults.length, 
        searchTerm,
        results: uniqueResults.slice(0, 3),
        searchTermUsed: searchTerm
      });

      setProducts(uniqueResults);
      setTotalCount(uniqueResults.length);
      setCurrentPage(1);
      setHasMore(false); // Disable pagination for search results

    } catch (err) {
      console.error('Error in searchProducts:', err);
      setError('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all products for export (not paginated)
  const fetchAllProductsForExport = async (): Promise<Product[]> => {
    try {
      console.log('Fetching all products for export...');
      
      // First, get the total count to know how many products we need to fetch
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting product count for export:', countError);
        throw new Error(countError.message);
      }

      console.log(`Total products in database for export: ${count}`);

      // If count is less than 1000, we can fetch all at once
      if (count && count <= 1000) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            brand:brands(id, brand, logo, created_at)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching all products for export:', error);
          throw new Error(error.message);
        }

        console.log(`Fetched ${data?.length || 0} products for export in single query`);
        return data || [];
      }

      // If count is more than 1000, fetch in batches
      console.log('Large dataset detected, fetching in batches...');
      const allProducts: Product[] = [];
      const batchSize = 1000;
      let offset = 0;

      while (offset < (count || 0)) {
        console.log(`Fetching batch: offset ${offset}, limit ${batchSize}`);
        
        const { data: batchData, error: batchError } = await supabase
          .from('products')
          .select(`
            *,
            brand:brands(id, brand, logo, created_at)
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + batchSize - 1);

        if (batchError) {
          console.error(`Error fetching batch at offset ${offset}:`, batchError);
          throw new Error(batchError.message);
        }

        if (batchData && batchData.length > 0) {
          allProducts.push(...batchData);
          console.log(`Fetched batch: ${batchData.length} products. Total so far: ${allProducts.length}`);
        }

        offset += batchSize;
      }

      console.log(`Successfully fetched all ${allProducts.length} products for export`);
      return allProducts;
    } catch (err) {
      console.error('Error in fetchAllProductsForExport:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    fetchProducts,
    loadMoreProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts,
    bulkUpdateProducts,
    bulkDeleteProducts,
    uploadProductImage,
    searchProducts,
    fetchAllProductsForExport,
    fetchProductById,
  };
};
