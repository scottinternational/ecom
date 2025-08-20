import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts, Product, CreateProductData } from '@/hooks/useProducts';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/hooks/useNotifications';
import { Upload, Link, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { products, updateProduct, deleteProduct, fetchProducts, fetchProductById } = useProducts();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<CreateProductData>>({});
  const [imageInputType, setImageInputType] = useState<'url' | 'file'>('url');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    let isActive = true;

    const ensureProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      console.log('ProductDetails: Loading product with id:', id);
      console.log('ProductDetails: Available products:', products.length);

      // Try in-memory first
      const existing = products.find(p => p.id === id);
      if (existing) {
        console.log('ProductDetails: Found product in memory:', existing);
        if (!isActive) return;
        setProduct(existing);
        const formData = {
          sku: existing.sku,
          brand_id: existing.brand_id,
          product_name: existing.product_name,
          description: existing.description || undefined,
          cost_price: existing.cost_price || undefined,
          selling_price: existing.selling_price || undefined,
          color: existing.color || undefined,
          size: existing.size || undefined,
          category: existing.category || undefined,
          image_url: existing.image_url || undefined,
        };
        console.log('ProductDetails: Setting form data:', formData);
        setForm(formData);
        setImagePreview(existing.image_url || null);
        setLoading(false);
        return;
      }

      // Fetch by id to avoid reloading entire list
      console.log('ProductDetails: Product not in memory, fetching by id...');
      const fetched = await fetchProductById(id);
      if (!isActive) return;
      if (fetched) {
        console.log('ProductDetails: Fetched product:', fetched);
        setProduct(fetched);
        const formData = {
          sku: fetched.sku,
          brand_id: fetched.brand_id,
          product_name: fetched.product_name,
          description: fetched.description || undefined,
          cost_price: fetched.cost_price || undefined,
          selling_price: fetched.selling_price || undefined,
          color: fetched.color || undefined,
          size: fetched.size || undefined,
          category: fetched.category || undefined,
          image_url: fetched.image_url || undefined,
        };
        console.log('ProductDetails: Setting form data from fetched:', formData);
        setForm(formData);
        setImagePreview(fetched.image_url || null);
      }
      setLoading(false);
    };

    ensureProduct();
    return () => { isActive = false; };
  }, [id, products, fetchProductById]);

  const handleImageFileChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setForm(f => ({ ...f, image_url: undefined }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setForm(f => ({ ...f, image_url: url }));
    setImageFile(null);
    setImagePreview(url || null);
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    try {
      console.log('Starting image upload...', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        bucketName: 'products_images'
      });
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return null;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please use JPG, PNG, GIF, or WebP");
        return null;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading to path:', filePath);

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      if (!user) {
        toast.error("You must be logged in to upload files");
        return null;
      }

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('products_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        
        // If storage upload fails, try base64 conversion as fallback
        if (error.message.includes('row-level security') || error.message.includes('permission')) {
          console.log('Storage upload failed, trying base64 conversion...');
          return await convertFileToBase64(file);
        } else {
          toast.error(`Upload failed: ${error.message}`);
          return null;
        }
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('products_images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Public URL generated:', publicUrl);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };

  // Fallback method: convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        console.log('File converted to base64');
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert file to base64'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      let imageUrl = form.image_url;
      
      // If a file was uploaded, upload it to storage first
      if (imageFile) {
        const uploadedUrl = await uploadImageToStorage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error("Failed to upload image file");
          return;
        }
      }

      await updateProduct(id, { ...form, image_url: imageUrl });
      addNotification({ title: 'Saved', message: 'Product updated', type: 'success' });
      navigate('/products/master');
    } catch (e) {
      addNotification({ title: 'Update failed', message: e instanceof Error ? e.message : 'Unknown error', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const ok = window.confirm('Delete this product? This cannot be undone.');
    if (!ok) return;
    try {
      await deleteProduct(id);
      addNotification({ title: 'Deleted', message: 'Product deleted', type: 'success' });
      navigate('/products/master');
    } catch (e) {
      addNotification({ title: 'Delete failed', message: e instanceof Error ? e.message : 'Unknown error', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Product not found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/products/master')}>Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug logging
  console.log('ProductDetails render:', { 
    loading, 
    product: product?.id, 
    form, 
    imagePreview,
    imageFile: imageFile?.name 
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Details</h1>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input 
              value={form.sku || ''} 
              onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
              placeholder="Enter SKU"
            />
          </div>
          <div className="space-y-2">
            <Label>Product Name</Label>
            <Input 
              value={form.product_name || ''} 
              onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
              placeholder="Enter product name"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea 
              value={form.description || ''} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Enter product description"
            />
          </div>
          <div className="space-y-2">
            <Label>Cost Price</Label>
            <Input 
              type="number" 
              value={form.cost_price ?? ''} 
              onChange={e => setForm(f => ({ ...f, cost_price: Number(e.target.value) }))}
              placeholder="Enter cost price"
            />
          </div>
          <div className="space-y-2">
            <Label>Selling Price</Label>
            <Input 
              type="number" 
              value={form.selling_price ?? ''} 
              onChange={e => setForm(f => ({ ...f, selling_price: Number(e.target.value) }))}
              placeholder="Enter selling price"
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <Input 
              value={form.color || ''} 
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              placeholder="Enter color"
            />
          </div>
          <div className="space-y-2">
            <Label>Size</Label>
            <Input 
              value={form.size || ''} 
              onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
              placeholder="Enter size"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Category</Label>
            <Input 
              value={form.category || ''} 
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="Enter category"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Product Image</Label>
            <div className="space-y-4">
              {/* Image Input Type Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={imageInputType === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageInputType('url')}
                  className="flex items-center gap-2"
                >
                  <Link className="h-4 w-4" />
                  URL
                </Button>
                <Button
                  type="button"
                  variant={imageInputType === 'file' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageInputType('file')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>

              {/* URL Input */}
              {imageInputType === 'url' && (
                <div className="space-y-2">
                  <Input 
                    placeholder="Enter image URL..."
                    value={form.image_url || ''} 
                    onChange={e => handleImageUrlChange(e.target.value)} 
                  />
                </div>
              )}

              {/* File Upload */}
              {imageInputType === 'file' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {imageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleImageFileChange(null)}
                        className="flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">Preview:</Label>
                  <div className="mt-2 relative inline-block">
                    <div className="h-32 w-32 rounded-lg overflow-hidden border border-border bg-muted">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="h-full w-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground hidden">
                        <span>Image not available</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => navigate('/products/master')}>Back to list</Button>
    </div>
  );
};

export default ProductDetails;


