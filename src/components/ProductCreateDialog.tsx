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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface ProductFormData {
  channel_sku: string;
  channel_names: string[];
  sku: string;
  class: string;
  color: string;
  size: string;
  product_name: string;
  product_category: string;
  listing_url: string;
  product_image: File | null;
}

const CHANNEL_OPTIONS = [
  "Amazon",
  "Flipkart", 
  "Myntra",
  "Ajio",
  "Jiomart",
  "Meesho"
];

export function ProductCreateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState<ProductFormData>({
    channel_sku: "",
    channel_names: [],
    sku: "",
    class: "",
    color: "",
    size: "",
    product_name: "",
    product_category: "",
    listing_url: "",
    product_image: null,
  });

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      channel_names: checked 
        ? [...prev.channel_names, channel]
        : prev.channel_names.filter(c => c !== channel)
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, product_image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, product_image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addNotification({
        title: "Product Created Successfully",
        message: `${formData.product_name} has been added to the catalog`,
        type: "success",
      });

      // Reset form
      setFormData({
        channel_sku: "",
        channel_names: [],
        sku: "",
        class: "",
        color: "",
        size: "",
        product_name: "",
        product_category: "",
        listing_url: "",
        product_image: null,
      });
      setImagePreview(null);
      setOpen(false);
    } catch (error) {
      addNotification({
        title: "Error Creating Product",
        message: "Failed to create product. Please try again.",
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
            {/* Channel SKU */}
            <div className="space-y-2">
              <Label htmlFor="channel_sku">Channel SKU *</Label>
              <Input
                id="channel_sku"
                value={formData.channel_sku}
                onChange={(e) => setFormData(prev => ({ ...prev, channel_sku: e.target.value }))}
                placeholder="Enter channel SKU"
                required
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">Master SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="Enter master SKU"
                required
              />
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

            {/* Class */}
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
                placeholder="Enter product class"
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

            {/* Product Category */}
            <div className="space-y-2">
              <Label htmlFor="product_category">Product Category</Label>
              <Input
                id="product_category"
                value={formData.product_category}
                onChange={(e) => setFormData(prev => ({ ...prev, product_category: e.target.value }))}
                placeholder="Enter category"
              />
            </div>

            {/* Listing URL */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="listing_url">Listing URL</Label>
              <Input
                id="listing_url"
                type="url"
                value={formData.listing_url}
                onChange={(e) => setFormData(prev => ({ ...prev, listing_url: e.target.value }))}
                placeholder="https://example.com/product"
              />
            </div>
          </div>

          {/* Channel Names */}
          <div className="space-y-3">
            <Label>Channel Names</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CHANNEL_OPTIONS.map((channel) => (
                <div key={channel} className="flex items-center space-x-2">
                  <Checkbox
                    id={channel}
                    checked={formData.channel_names.includes(channel)}
                    onCheckedChange={(checked) => handleChannelChange(channel, checked as boolean)}
                  />
                  <Label htmlFor={channel} className="text-sm font-normal">
                    {channel}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Product Image */}
          <div className="space-y-3">
            <Label htmlFor="product_image">Product Image</Label>
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