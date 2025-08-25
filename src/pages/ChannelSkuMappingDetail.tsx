import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Calendar,
  Hash,
  Tag,
  Store
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useChannelSkuMappings, ChannelSkuMapping } from "@/hooks/useChannelSkuMappings";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

interface ProductWithImage {
  sku: string;
  name: string;
  product_image?: string | null;
  brand_logo?: string | null;
}

const ChannelSkuMappingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { products } = useProducts();
  const [mapping, setMapping] = useState<ChannelSkuMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState<Map<string, { url: string; name: string }>>(new Map());
  const [brandLogos, setBrandLogos] = useState<Map<string, { url: string; name: string }>>(new Map());

  useEffect(() => {
    if (id) {
      fetchMappingDetail();
    }
  }, [id]);

  const fetchMappingDetail = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('channel_sku_mappings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setMapping(data);
      
      // Fetch product images and brand logos
      if (data?.master_sku) {
        await fetchProductImages(data.master_sku);
        await fetchBrandLogos(data.master_sku);
      }
    } catch (error) {
      console.error('Error fetching mapping detail:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load mapping details'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (masterSku: string) => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('sku, name, product_image')
        .eq('sku', masterSku);

      if (products && products.length > 0) {
        const product = products[0];
        if (product.product_image) {
          const { data: imageData } = await supabase.storage
            .from('product-images')
            .createSignedUrl(product.product_image, 3600);

          if (imageData?.signedUrl) {
            setProductImages(prev => new Map(prev).set(masterSku, {
              url: imageData.signedUrl,
              name: product.name
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product image:', error);
    }
  };

  const fetchBrandLogos = async (masterSku: string) => {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('sku, brand_logo')
        .eq('sku', masterSku);

      if (products && products.length > 0) {
        const product = products[0];
        if (product.brand_logo) {
          const { data: logoData } = await supabase.storage
            .from('brand-logos')
            .createSignedUrl(product.brand_logo, 3600);

          if (logoData?.signedUrl) {
            setBrandLogos(prev => new Map(prev).set(masterSku, {
              url: logoData.signedUrl,
              name: 'Brand Logo'
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching brand logo:', error);
    }
  };

  const getChannelLogo = (channelName: string): string => {
    const channelLogos: { [key: string]: string } = {
      'amazon': '/amazon-logo.png',
      'flipkart': '/flipkart-logo.png',
      'myntra': '/myntra-logo.png',
      'ajio': '/ajio-logo.png',
      'nykaa': '/nykaa-logo.png'
    };
    return channelLogos[channelName.toLowerCase()] || '/default-channel-logo.png';
  };

  const getProductImage = (masterSku: string): string | null => {
    return productImages.get(masterSku)?.url || null;
  };

  const getBrandLogo = (masterSku: string): string | null => {
    return brandLogos.get(masterSku)?.url || null;
  };

  const handleEdit = () => {
    navigate(`/mapping/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!mapping) return;
    
    try {
      const { error } = await supabase
        .from('channel_sku_mappings')
        .delete()
        .eq('id', mapping.id);

      if (error) throw error;

      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Mapping deleted successfully'
      });

      navigate('/mapping');
    } catch (error) {
      console.error('Error deleting mapping:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete mapping'
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-semibold mb-2">Mapping Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The mapping you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/mapping')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mappings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/mapping')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Channel SKU Mapping Details</h1>
            <p className="text-muted-foreground">
              Detailed information about the mapping
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mapping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Hash className="h-5 w-5" />
              <span>Mapping Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Channel SKU</label>
                <p className="text-sm font-mono mt-1">{mapping.channel_sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Master SKU</label>
                <p className="text-sm font-mono mt-1">{mapping.master_sku}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={mapping.status === 'Active' ? 'default' : 'secondary'}>
                    {mapping.status === 'Active' ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {mapping.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm mt-1">
                  {new Date(mapping.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-5 w-5" />
              <span>Channel Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg border overflow-hidden bg-white">
                <img 
                  src={getChannelLogo(mapping.channel_name)} 
                  alt={mapping.channel_name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm font-medium hidden`}>
                  {mapping.channel_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">{mapping.channel_name}</h3>
                <p className="text-sm text-muted-foreground">Sales Channel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="h-5 w-5" />
              <span>Product Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              {/* Product Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-lg border overflow-hidden bg-gray-100">
                  {getProductImage(mapping.master_sku) ? (
                    <img 
                      src={getProductImage(mapping.master_sku)} 
                      alt="Product" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-lg text-gray-500 ${getProductImage(mapping.master_sku) ? 'hidden' : ''}`}>
                    {mapping.master_sku.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {productImages.get(mapping.master_sku)?.name || 'Product Name'}
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    SKU: {mapping.master_sku}
                  </p>
                </div>

                {/* Brand Logo */}
                {getBrandLogo(mapping.master_sku) && (
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-muted-foreground">Brand:</span>
                    <div className="w-12 h-12 rounded border overflow-hidden bg-white">
                      <img 
                        src={getBrandLogo(mapping.master_sku)} 
                        alt="Brand" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Timestamps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm mt-1">
                  {new Date(mapping.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm mt-1">
                  {new Date(mapping.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChannelSkuMappingDetail;
