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
import { Plus, Upload, X, ExternalLink } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useProductSuggestions, CreateProductSuggestionData } from "@/hooks/useProductSuggestions";
import { StorageService } from "@/lib/storage";

interface ProductSuggestionFormData {
  title: string;
  description: string;
  target_marketplaces: string[];
  competitors: string[];
  priority: string;
  target_price: string;
  proposed_selling_price: string;
  expected_timeline: string;
  research_notes: string;
  product_url: string;
  product_images: File[];
}

const MARKETPLACE_OPTIONS = [
  "Amazon",
  "Flipkart", 
  "Myntra",
  "Ajio",
  "Jiomart",
  "Meesho",
  "Snapdeal",
  "Paytm Mall"
];



const PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

interface ProductSuggestionDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ProductSuggestionDialog({ trigger, onSuccess }: ProductSuggestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { addNotification } = useNotifications();
  const { createSuggestion } = useProductSuggestions();

  const [formData, setFormData] = useState<ProductSuggestionFormData>({
    title: "",
    description: "",
    target_marketplaces: [],
    competitors: [],
    priority: "medium",
    target_price: "",
    proposed_selling_price: "",
    expected_timeline: "",
    research_notes: "",
    product_url: "",
    product_images: [],
  });

  const [newCompetitor, setNewCompetitor] = useState("");

  const handleMarketplaceChange = (marketplace: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      target_marketplaces: checked 
        ? [...prev.target_marketplaces, marketplace]
        : prev.target_marketplaces.filter(m => m !== marketplace)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && !formData.competitors.includes(newCompetitor.trim())) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (competitor: string) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter(c => c !== competitor)
    }));
  };

  const handleCompetitorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCompetitor();
    }
  };

  const handleUrlClick = () => {
    if (formData.product_url) {
      // Ensure the URL has a protocol
      let url = formData.product_url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        product_images: [...prev.product_images, ...files]
      }));
      
      // Create previews for new images
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      product_images: prev.product_images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload images to Supabase storage
      let imageUrls: string[] = [];
      if (formData.product_images.length > 0) {
        console.log(`Starting upload of ${formData.product_images.length} images...`);
        
        const uploadResults = await StorageService.uploadMultipleFiles(
          formData.product_images,
          'product-suggestions'
        );
        
        console.log('Upload results:', uploadResults);
        
        // Check for upload errors
        const errors = uploadResults.filter(result => result.error);
        if (errors.length > 0) {
          console.error('Upload errors:', errors);
          throw new Error(`Failed to upload ${errors.length} image(s): ${errors[0].error}`);
        }
        
        // Extract URLs from successful uploads
        imageUrls = uploadResults.map(result => result.url);
        console.log('Successfully uploaded images:', imageUrls);
      }

      // Prepare data for database
      const suggestionData: CreateProductSuggestionData = {
        title: formData.title,
        description: formData.description,
        target_marketplaces: formData.target_marketplaces,
        competitors: formData.competitors,
        priority: formData.priority,
        target_price: formData.target_price ? parseFloat(formData.target_price) : undefined,
        proposed_selling_price: formData.proposed_selling_price ? parseFloat(formData.proposed_selling_price) : undefined,
        expected_timeline: formData.expected_timeline || undefined,
        research_notes: formData.research_notes || undefined,
        product_url: formData.product_url || undefined,
        product_images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      console.log('Saving suggestion data:', suggestionData);

      // Save to database
      const result = await createSuggestion(suggestionData);
      
      if (result) {
        addNotification({
          title: "Product Suggestion Created",
          message: `${formData.title} has been submitted for research`,
          type: "success",
        });

                 // Reset form
         setFormData({
           title: "",
           description: "",
           target_marketplaces: [],
           competitors: [],
           priority: "medium",
           target_price: "",
           proposed_selling_price: "",
           expected_timeline: "",
           research_notes: "",
           product_url: "",
           product_images: [],
         });
                   setNewCompetitor("");
          setImagePreviews([]);
          setOpen(false);
          
          // Call the success callback to refresh the suggestions list
          if (onSuccess) {
            onSuccess();
          }
      } else {
        throw new Error('Failed to create suggestion');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      addNotification({
        title: "Error Creating Suggestion",
        message: error instanceof Error ? error.message : "Failed to create product suggestion. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="enterprise" className="gap-2">
            <Plus className="h-4 w-4" />
            New Product Suggestion
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product Suggestion</DialogTitle>
          <DialogDescription>
            Submit a new product idea for research and development
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Title */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter product title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Product Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the product concept and its features"
                rows={3}
                required
              />
            </div>

            {/* Product URL */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="product_url">Competitor Product URL</Label>
              <div className="flex gap-2">
                <Input
                  id="product_url"
                  type="url"
                  value={formData.product_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_url: e.target.value }))}
                  placeholder="https://amazon.in/dp/B08R41GK95"
                />
                {formData.product_url && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUrlClick}
                    className="flex-shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Link to competitor product for reference (optional). Include https:// for external links.
              </p>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Price */}
            <div className="space-y-2">
              <Label htmlFor="target_price">Target Price</Label>
              <Input
                id="target_price"
                value={formData.target_price}
                onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
                placeholder="e.g., $100,000"
              />
            </div>

            {/* Proposed Selling Price */}
            <div className="space-y-2">
              <Label htmlFor="proposed_selling_price">Proposed Selling Price</Label>
              <Input
                id="proposed_selling_price"
                value={formData.proposed_selling_price}
                onChange={(e) => setFormData(prev => ({ ...prev, proposed_selling_price: e.target.value }))}
                placeholder="e.g., $150,000"
              />
            </div>

            {/* Expected Timeline */}
            <div className="space-y-2">
              <Label htmlFor="expected_timeline">Expected Timeline</Label>
              <Input
                id="expected_timeline"
                value={formData.expected_timeline}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_timeline: e.target.value }))}
                placeholder="e.g., 3-6 months"
              />
            </div>
          </div>

          {/* Target Marketplaces */}
          <div className="space-y-3">
            <Label>Target Marketplaces</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MARKETPLACE_OPTIONS.map((marketplace) => (
                <div key={marketplace} className="flex items-center space-x-2">
                  <Checkbox
                    id={marketplace}
                    checked={formData.target_marketplaces.includes(marketplace)}
                    onCheckedChange={(checked) => handleMarketplaceChange(marketplace, checked as boolean)}
                  />
                  <Label htmlFor={marketplace} className="text-sm font-normal">
                    {marketplace}
                  </Label>
                </div>
              ))}
            </div>
          </div>

                     {/* Competitors */}
           <div className="space-y-3">
             <Label>Competitors</Label>
             <div className="space-y-2">
               {/* Display existing competitors */}
               {formData.competitors.length > 0 && (
                 <div className="flex flex-wrap gap-2">
                   {formData.competitors.map((competitor, index) => (
                     <div key={index} className="flex items-center space-x-2 bg-muted/50 px-3 py-1 rounded-md">
                       <span className="text-sm">{competitor}</span>
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         onClick={() => removeCompetitor(competitor)}
                         className="h-5 w-5 p-0 hover:bg-muted"
                       >
                         <X className="h-3 w-3" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
               
               {/* Add new competitor input */}
               <div className="flex gap-2">
                 <Input
                   type="text"
                   value={newCompetitor}
                   onChange={(e) => setNewCompetitor(e.target.value)}
                   onKeyPress={handleCompetitorKeyPress}
                   placeholder="Enter competitor name (press Enter to add)"
                   className="flex-grow"
                 />
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={addCompetitor}
                   disabled={!newCompetitor.trim()}
                 >
                   Add
                 </Button>
               </div>
               <p className="text-xs text-muted-foreground">
                 Add multiple competitors by pressing Enter or clicking Add
               </p>
             </div>
           </div>

          {/* Product Images */}
          <div className="space-y-3">
            <Label htmlFor="product_images">Product Images</Label>
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreviews.map((preview, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-2">
                      <div className="relative">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Label htmlFor="product_images" className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80">
                      Upload product images
                    </span>
                    <Input
                      id="product_images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 10MB each. Upload multiple images for different angles.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Research Notes */}
          <div className="space-y-2">
            <Label htmlFor="research_notes">Research Notes</Label>
            <Textarea
              id="research_notes"
              value={formData.research_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, research_notes: e.target.value }))}
              placeholder="Additional notes, market research, competitor analysis, etc."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Suggestion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
