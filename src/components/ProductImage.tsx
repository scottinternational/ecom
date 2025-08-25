import React, { useState, useCallback } from 'react';
import { ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductImageProps {
  sku: string;
  productName: string;
  imageUrl?: string;
  airtableImageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showZoom?: boolean;
  showAirtableIndicator?: boolean;
  className?: string;
  onClick?: (imageUrl: string, productName: string) => void;
  onImageLoad?: (sku: string, source: 'airtable' | 'database') => void;
  onImageError?: (sku: string, imageUrl: string) => void;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-32 w-32'
};

const fallbackSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl'
};

export const ProductImage: React.FC<ProductImageProps> = ({
  sku,
  productName,
  imageUrl,
  airtableImageUrl,
  size = 'md',
  showZoom = false,
  showAirtableIndicator = false,
  className,
  onClick,
  onImageLoad,
  onImageError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();

  // Determine which image URL to use (Airtable takes priority)
  const finalImageUrl = airtableImageUrl || imageUrl;
  const imageSource = airtableImageUrl ? 'airtable' : 'database';

  // Handle image click
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick && finalImageUrl) {
      onClick(finalImageUrl, productName);
    }
  }, [onClick, finalImageUrl, productName]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
    onImageLoad?.(sku, imageSource);
  }, [sku, imageSource, onImageLoad]);

  // Handle image error
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
    onImageError?.(sku, finalImageUrl || '');
  }, [sku, finalImageUrl, onImageError]);

  // Update current image URL when props change
  React.useEffect(() => {
    if (finalImageUrl !== currentImageUrl) {
      setCurrentImageUrl(finalImageUrl);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [finalImageUrl, currentImageUrl]);

  const hasImage = finalImageUrl && !imageError;
  const showFallback = !hasImage || imageError;

  return (
    <div 
      className={cn(
        'relative rounded-lg overflow-hidden border border-border bg-muted',
        sizeClasses[size],
        showZoom && 'cursor-pointer hover:opacity-80 transition-opacity group',
        className
      )}
      onClick={showZoom ? handleClick : undefined}
    >
      {/* Main Image */}
      {hasImage && (
        <img 
          src={finalImageUrl}
          alt={productName}
          className="h-full w-full object-contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Fallback Content */}
      {showFallback && (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className={cn('font-bold text-muted-foreground', fallbackSizeClasses[size])}>
              {productName.charAt(0).toUpperCase()}
            </div>
            {size === 'lg' || size === 'xl' ? (
              <div className="text-xs opacity-75 text-muted-foreground mt-1">
                No Image
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Zoom Overlay */}
      {showZoom && hasImage && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Airtable Indicator */}
      {showAirtableIndicator && airtableImageUrl && hasImage && (
        <div className="absolute top-1 right-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
        </div>
      )}
    </div>
  );
};
