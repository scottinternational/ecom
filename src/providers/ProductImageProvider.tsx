import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAirtableImages } from '@/hooks/useAirtableImages';

interface ProductImageContextType {
  // State
  productImages: Map<string, any>;
  brandImages: Map<string, any>;
  loading: boolean;
  error: string | null;
  
  // Functions
  getProductImage: (sku: string) => any;
  getProductImageUrl: (sku: string) => string | undefined;
  hasAirtableImage: (sku: string) => boolean;
  getImageSource: (sku: string) => 'airtable' | 'database' | 'none';
  
  // Airtable functions
  initializeAirtable: (config: any) => Promise<void>;
  refreshImages: () => Promise<void>;
  fetchProductImage: (sku: string) => Promise<any>;
  fetchAllProductImages: () => Promise<void>;
  clearError: () => void;
}

const ProductImageContext = createContext<ProductImageContextType | undefined>(undefined);

interface ProductImageProviderProps {
  children: React.ReactNode;
}

export const ProductImageProvider: React.FC<ProductImageProviderProps> = ({ children }) => {
  const {
    productImages,
    brandImages,
    loading,
    error,
    initialize,
    getProductImage,
    refreshImages,
    fetchProductImage,
    fetchAllProductImages,
    clearError,
  } = useAirtableImages();

  // Get the best available image URL for a product
  const getProductImageUrl = useCallback((sku: string): string | undefined => {
    const airtableImage = getProductImage(sku);
    return airtableImage?.imageUrls?.[0];
  }, [getProductImage]);

  // Check if a product has an Airtable image
  const hasAirtableImage = useCallback((sku: string): boolean => {
    const airtableImage = getProductImage(sku);
    return !!(airtableImage && airtableImage.imageUrls && airtableImage.imageUrls.length > 0);
  }, [getProductImage]);

  // Get the source of the image (airtable, database, or none)
  const getImageSource = useCallback((sku: string): 'airtable' | 'database' | 'none' => {
    const airtableImage = getProductImage(sku);
    if (airtableImage && airtableImage.imageUrls && airtableImage.imageUrls.length > 0) {
      return 'airtable';
    }
    return 'none';
  }, [getProductImage]);

  // Initialize Airtable with configuration
  const initializeAirtable = useCallback(async (config: any) => {
    try {
      await initialize(config);
      await fetchAllProductImages();
    } catch (error) {
      console.error('Failed to initialize Airtable:', error);
      throw error;
    }
  }, [initialize, fetchAllProductImages]);

  const contextValue = useMemo(() => ({
    // State
    productImages,
    brandImages,
    loading,
    error,
    
    // Functions
    getProductImage,
    getProductImageUrl,
    hasAirtableImage,
    getImageSource,
    
    // Airtable functions
    initializeAirtable,
    refreshImages,
    fetchProductImage,
    fetchAllProductImages,
    clearError,
  }), [
    productImages,
    brandImages,
    loading,
    error,
    getProductImage,
    getProductImageUrl,
    hasAirtableImage,
    getImageSource,
    initializeAirtable,
    refreshImages,
    fetchProductImage,
    fetchAllProductImages,
    clearError,
  ]);

  return (
    <ProductImageContext.Provider value={contextValue}>
      {children}
    </ProductImageContext.Provider>
  );
};

export const useProductImages = (): ProductImageContextType => {
  const context = useContext(ProductImageContext);
  if (context === undefined) {
    throw new Error('useProductImages must be used within a ProductImageProvider');
  }
  return context;
};
