import { useCallback } from 'react';
import { useProductImages } from '@/providers/ProductImageProvider';
import { getBestImageUrl, getImageSourceType } from '@/utils/imageUtils';

export interface UseProductImageReturn {
  // Image data
  imageUrl: string | undefined;
  airtableImageUrl: string | undefined;
  hasImage: boolean;
  hasAirtableImage: boolean;
  imageSource: 'airtable' | 'database' | 'none';
  imageSourceType: 'airtable' | 'supabase' | 'external' | 'none';
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshImage: () => Promise<void>;
  fetchImage: () => Promise<void>;
}

export const useProductImage = (sku: string, databaseImageUrl?: string): UseProductImageReturn => {
  const {
    getProductImageUrl,
    hasAirtableImage: hasAirtableImageFromContext,
    getImageSource,
    loading,
    error,
    fetchProductImage,
  } = useProductImages();

  // Get image URLs
  const airtableImageUrl = getProductImageUrl(sku);
  const imageUrl = getBestImageUrl(airtableImageUrl, databaseImageUrl);
  
  // Determine image states
  const hasImage = !!imageUrl;
  const hasAirtableImage = hasAirtableImageFromContext(sku);
  const imageSource = getImageSource(sku);
  const imageSourceType = imageUrl ? getImageSourceType(imageUrl) : 'none';

  // Actions
  const refreshImage = useCallback(async () => {
    if (sku) {
      await fetchProductImage(sku);
    }
  }, [sku, fetchProductImage]);

  const fetchImage = useCallback(async () => {
    if (sku && !hasAirtableImage) {
      await fetchProductImage(sku);
    }
  }, [sku, hasAirtableImage, fetchProductImage]);

  return {
    // Image data
    imageUrl,
    airtableImageUrl,
    hasImage,
    hasAirtableImage,
    imageSource,
    imageSourceType,
    
    // Loading state
    loading,
    error,
    
    // Actions
    refreshImage,
    fetchImage,
  };
};
