import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useProducts, CreateProductData } from "@/hooks/useProducts";
import { useBrands } from "@/hooks/useBrands";

interface ProductFormData {
  sku: string;
  brand_id: number | null;
  product_name: string;
  description: string;
  cost_price: string;
  selling_price: string;
  color: string;
  size: string;
  category: string;
  image_url: string;
  imageFile: File | null;
}

export function ProductCreateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputType, setImageInputType] = useState<'file' | 'url'>('file');
  
  const { addNotification } = useNotifications();
  const { createProduct } = useProducts();
  const { brands } = useBrands();

  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    brand_id: null,
    product_name: "",
    description: "",
    cost_price: "",
    selling_price: "",
    color: "",
    size: "",
    category: "",
    image_url: "",
    imageFile: null,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file, image_url: "" }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url, imageFile: null }));
    setImagePreview(url);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, image_url: "" }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData: CreateProductData = {
        sku: formData.sku,
        brand_id: formData.brand_id,
        product_name: formData.product_name,
        description: formData.description || undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : undefined,
        color: formData.color || undefined,
        size: formData.size || undefined,
        category: formData.category || undefined,
        image_url: formData.image_url || undefined,
      };

      await createProduct(productData, formData.imageFile || undefined);
      
      addNotification({
        title: "Product Created Successfully",
        message: `${formData.product_name} has been added to the catalog`,
        type: "success",
      });

      // Reset form
      setFormData({
        sku: "",
        brand_id: null,
        product_name: "",
        description: "",
        cost_price: "",
        selling_price: "",
        color: "",
        size: "",
        category: "",
        image_url: "",
        imageFile: null,
      });
      setImagePreview(null);
      setImageInputType('file');
      setOpen(false);
    } catch (error) {
      addNotification({
        title: "Error Creating Product",
        message: error instanceof Error ? error.message : "Failed to create product. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="enterprise">
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your catalog with all required details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter SKU"
                required
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Select
                value={formData.brand_id?.toString() || ""}
                onValueChange={(value) => setFormData(prev => ({ ...prev, brand_id: value ? parseInt(value) : null }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Cost Price */}
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price</Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="Enter color"
              />
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                placeholder="Enter size"
              />
            </div>

            {/* Category */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Enter category"
              />
            </div>
          </div>

          {/* Product Image */}
          <div className="space-y-3">
            <Label>Product Image</Label>
            
            {/* Image Input Type Toggle */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={imageInputType === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageInputType('file')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={imageInputType === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setImageInputType('url')}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Image URL
              </Button>
            </div>

            {imageInputType === 'url' ? (
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                />
              </div>
            ) : null}

            {imagePreview ? (
              <Card className="relative">
                <CardContent className="p-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <div className="mt-4">
                    <Label htmlFor="product_image" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Upload an image
                      </span>
                      <Input
                        id="product_image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}