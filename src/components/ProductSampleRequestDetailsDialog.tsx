import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, ExternalLink, Calendar, DollarSign, Clock, Target, Users, FileText, X, ZoomIn, ChevronLeft, ChevronRight, Upload, Save, Building2, FileText as FileTextIcon } from "lucide-react";
import { ProductSuggestion } from "@/hooks/useProductSuggestions";
import { StorageService } from "@/lib/storage";
import { updateProcurementDetails, UpdateProcurementData } from "@/lib/procurement";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";

interface ProductSampleRequestDetailsDialogProps {
  suggestion: ProductSuggestion;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

interface ProcurementDetails {
  costPrice: string;
  gstRate: string;
  leadTime: string;
  counterSampleImages: string[];
  procurementNotes: string;
  status: string;
}

export function ProductSampleRequestDetailsDialog({ suggestion, trigger, onSuccess }: ProductSampleRequestDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; index: number; type: 'product' | 'counter' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state for editable fields - initialize with existing data
  const [procurementDetails, setProcurementDetails] = useState<ProcurementDetails>({
    costPrice: suggestion.cost_price?.toString() || "",
    gstRate: suggestion.gst_rate?.toString() || "",
    leadTime: suggestion.lead_time_days?.toString() || "",
    counterSampleImages: suggestion.counter_sample_images || [],
    procurementNotes: suggestion.procurement_notes || "",
    status: suggestion.status
  });

  const [newCounterSampleImages, setNewCounterSampleImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Refresh form data when dialog opens or suggestion changes
  useEffect(() => {
    if (open) {
      console.log('Loading suggestion data:', suggestion);
      console.log('Counter sample images from suggestion:', suggestion.counter_sample_images);
      
      // Fix counter sample images - handle JSON strings, objects, and URL formats
      let fixedCounterSampleImages: string[] = [];
      if (suggestion.counter_sample_images && suggestion.counter_sample_images.length > 0) {
        fixedCounterSampleImages = suggestion.counter_sample_images.map((item: any) => {
          // If it's a JSON string, parse it and extract URL
          if (typeof item === 'string') {
            try {
              const parsed = JSON.parse(item);
              if (parsed && typeof parsed === 'object' && parsed.url) {
                return parsed.url;
              }
              // If it's already a URL string, use it as is
              if (item.startsWith('http')) {
                return item;
              }
            } catch (e) {
              // If JSON parsing fails, check if it's already a URL
              if (item.startsWith('http')) {
                return item;
              }
            }
          }
          // If it's an object with url property, extract the URL
          if (typeof item === 'object' && item && item.url) {
            return item.url;
          }
          // If it's neither, skip it
          return null;
        }).filter(Boolean) as string[];
      }
      
      console.log('Fixed counter sample images:', fixedCounterSampleImages);
      
      setProcurementDetails({
        costPrice: suggestion.cost_price?.toString() || "",
        gstRate: suggestion.gst_rate?.toString() || "",
        leadTime: suggestion.lead_time_days?.toString() || "",
        counterSampleImages: fixedCounterSampleImages,
        procurementNotes: suggestion.procurement_notes || "",
        status: suggestion.status
      });

      // Clear any previous uploads
      setNewCounterSampleImages([]);
      setImagePreviews([]);
    }
  }, [open, suggestion]);

  const handleUrlClick = () => {
    if (suggestion.product_url) {
      let url = suggestion.product_url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageClick = (imageUrl: string, index: number, type: 'product' | 'counter') => {
    console.log('Image clicked:', imageUrl, index, type);
    setImagePreview({ url: imageUrl, index, type });
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  const goToPreviousImage = () => {
    if (imagePreview) {
      let images: string[] = [];
      if (imagePreview.type === 'product') {
        images = suggestion.product_images || [];
      } else {
        images = procurementDetails.counterSampleImages;
      }

      if (images.length > 0) {
        const newIndex = imagePreview.index === 0 
          ? images.length - 1 
          : imagePreview.index - 1;
        setImagePreview({ 
          url: images[newIndex], 
          index: newIndex,
          type: imagePreview.type
        });
      }
    }
  };

  const goToNextImage = () => {
    if (imagePreview) {
      let images: string[] = [];
      if (imagePreview.type === 'product') {
        images = suggestion.product_images || [];
      } else {
        images = procurementDetails.counterSampleImages;
      }

      if (images.length > 0) {
        const newIndex = imagePreview.index === images.length - 1 
          ? 0 
          : imagePreview.index + 1;
        setImagePreview({ 
          url: images[newIndex], 
          index: newIndex,
          type: imagePreview.type
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (imagePreview) {
      if (e.key === 'ArrowLeft') {
        goToPreviousImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'Escape') {
        closeImagePreview();
      }
    }
  };

  const handleCounterSampleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewCounterSampleImages(prev => [...prev, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCounterSampleImage = (index: number) => {
    setNewCounterSampleImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Upload counter sample images
      let uploadedImageUrls: string[] = [];
      if (newCounterSampleImages.length > 0) {
        try {
          const uploadResults = await StorageService.uploadMultipleFiles(
            newCounterSampleImages,
            'product_suggestions'
          );
          
          // Extract URLs from upload results
          uploadedImageUrls = uploadResults
            .filter(result => result.url && !result.error)
            .map(result => result.url);
          
          console.log('Upload results:', uploadResults);
          console.log('Extracted URLs:', uploadedImageUrls);
          
          if (uploadedImageUrls.length === 0) {
            toast.error('Failed to upload images. Please try again.');
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          toast.error('Failed to upload images. Please try again.');
          return;
        }
      }

      // Combine existing and new images
      const allCounterSampleImages = [...procurementDetails.counterSampleImages, ...uploadedImageUrls];
      
      console.log('All counter sample images:', allCounterSampleImages);

      // Prepare data for database update
      const updateData: UpdateProcurementData = {
        cost_price: procurementDetails.costPrice ? parseFloat(procurementDetails.costPrice) : null,
        gst_rate: procurementDetails.gstRate ? parseInt(procurementDetails.gstRate) : null,
        lead_time_days: procurementDetails.leadTime ? parseInt(procurementDetails.leadTime) : null,
        counter_sample_images: allCounterSampleImages,
        procurement_notes: procurementDetails.procurementNotes || null,
        status: procurementDetails.status
      };

      console.log('Updating procurement details with data:', updateData);

      // Update the database using the direct function
      await updateProcurementDetails(suggestion.id, updateData);

      // Update local state to reflect the changes
      setProcurementDetails(prev => ({
        ...prev,
        counterSampleImages: allCounterSampleImages
      }));

      // Clear the new images arrays
      setNewCounterSampleImages([]);
      setImagePreviews([]);

      toast.success("Procurement details saved successfully");

      if (onSuccess) {
        onSuccess();
      }
      setOpen(false);
    } catch (error) {
      console.error('Error saving procurement details:', error);
      toast.error("Failed to save procurement details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Research":
        return "warning";
      case "Sample Ready":
        return "success";  
      case "Sent for Approval":
        return "info";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Product Sample Request Details
            </DialogTitle>
            <DialogDescription>
              Review and update procurement details for this product sample request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{suggestion.title}</h2>
                <p className="text-sm text-muted-foreground">Submitted: {formatDate(suggestion.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={procurementDetails.status} 
                  onValueChange={(value) => setProcurementDetails(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Research">In Research</SelectItem>
                    <SelectItem value="Sample Ready">Sample Ready</SelectItem>
                    <SelectItem value="Sent for Approval">Sent for Approval</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant={getStatusColor(procurementDetails.status) as any} className="text-sm">
                  {procurementDetails.status}
                </Badge>
              </div>
            </div>

            {/* Product Information (Read-only) */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge variant="outline" className="mt-1 capitalize">{suggestion.priority}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Target Marketplaces</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {suggestion.target_marketplaces.map((marketplace) => (
                        <Badge key={marketplace} variant="outline" className="text-xs">
                          {marketplace}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {suggestion.competitors && suggestion.competitors.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Competitors</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {suggestion.competitors.map((competitor) => (
                          <Badge key={competitor} variant="secondary" className="text-xs">
                            {competitor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestion.target_price && (
                    <div>
                      <Label className="text-sm font-medium">Target Price</Label>
                      <p className="text-sm text-muted-foreground mt-1">₹{suggestion.target_price.toLocaleString()}</p>
                    </div>
                  )}
                  {suggestion.proposed_selling_price && (
                    <div>
                      <Label className="text-sm font-medium">Proposed Selling Price</Label>
                      <p className="text-sm text-muted-foreground mt-1">₹{suggestion.proposed_selling_price.toLocaleString()}</p>
                    </div>
                  )}
                  {suggestion.expected_timeline && (
                    <div>
                      <Label className="text-sm font-medium">Expected Timeline</Label>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.expected_timeline}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Procurement Details (Editable) */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Procurement Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      value={procurementDetails.costPrice}
                      onChange={(e) => setProcurementDetails(prev => ({ ...prev, costPrice: e.target.value }))}
                      placeholder="0.00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstRate">GST Rate (%) *</Label>
                    <Select 
                      value={procurementDetails.gstRate} 
                      onValueChange={(value) => setProcurementDetails(prev => ({ ...prev, gstRate: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select GST rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leadTime">Lead Time (Days) *</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      value={procurementDetails.leadTime}
                      onChange={(e) => setProcurementDetails(prev => ({ ...prev, leadTime: e.target.value }))}
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Procurement Notes (Rich Text Editor) */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileTextIcon className="h-5 w-5" />
                  <h3 className="font-medium">Procurement Notes</h3>
                </div>
                <Label className="text-sm text-muted-foreground mb-3 block">
                  Add detailed notes, specifications, requirements, and any additional information with rich formatting
                </Label>
                <RichTextEditor
                  value={procurementDetails.procurementNotes}
                  onChange={(value) => setProcurementDetails(prev => ({ ...prev, procurementNotes: value }))}
                  placeholder="Enter detailed procurement notes, specifications, requirements, and any additional information. You can use formatting options like bold, italic, bullet points, colors, and insert images..."
                />
              </CardContent>
            </Card>

            {/* Original Product Images */}
            {suggestion.product_images && suggestion.product_images.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Original Product Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {suggestion.product_images.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer aspect-square"
                        onClick={() => handleImageClick(imageUrl, index, 'product')}
                      >
                        <img
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover rounded-md border transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                          <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click on any image to view it in full size
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Counter Sample Images (Editable) */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Counter Sample Images</h3>
                
                {/* Upload Section */}
                <div className="mb-4">
                  <Label htmlFor="counterSampleImages">Upload Counter Sample Images</Label>
                  <div className="mt-2">
                    <Input
                      id="counterSampleImages"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleCounterSampleImageUpload}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload multiple images of the counter sample
                  </p>
                </div>

                {/* Existing Images */}
                {procurementDetails.counterSampleImages.length > 0 && (
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Existing Counter Sample Images ({procurementDetails.counterSampleImages.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {procurementDetails.counterSampleImages.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className="relative group cursor-pointer aspect-square"
                          onClick={() => handleImageClick(imageUrl, index, 'counter')}
                        >
                          <img
                            src={imageUrl}
                            alt={`Counter sample ${index + 1}`}
                            className="w-full h-full object-cover rounded-md border"
                            onError={(e) => {
                              console.error(`Failed to load image ${index + 1}:`, imageUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              // Show error placeholder
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-red-50 border-2 border-red-200 rounded-md flex items-center justify-center">
                                    <div class="text-center">
                                      <div class="text-red-500 text-xs mb-1">Image Failed to Load</div>
                                      <div class="text-red-400 text-xs">${imageUrl}</div>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image ${index + 1}:`, imageUrl);
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {imagePreviews.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">New Images to Upload ({imagePreviews.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={preview}
                            alt={`New counter sample ${index + 1}`}
                            className="w-full h-full object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCounterSampleImage(index)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 text-white hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Images Message */}
                {procurementDetails.counterSampleImages.length === 0 && imagePreviews.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No counter sample images uploaded yet</p>
                    <p className="text-sm">Upload images using the file input above</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Research Notes */}
            {suggestion.research_notes && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Research Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {suggestion.research_notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={true} onOpenChange={closeImagePreview}>
          <DialogContent 
            className="sm:max-w-4xl max-h-[90vh] p-0 bg-black/95"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-20 h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
                onClick={closeImagePreview}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Previous Arrow */}
              {imagePreview.type === 'product' && suggestion.product_images && suggestion.product_images.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 h-10 w-10 p-0 bg-black/50 text-white hover:bg-black/70"
                  onClick={goToPreviousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}
              {imagePreview.type === 'counter' && procurementDetails.counterSampleImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 h-10 w-10 p-0 bg-black/50 text-white hover:bg-black/70"
                  onClick={goToPreviousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* Next Arrow */}
              {imagePreview.type === 'product' && suggestion.product_images && suggestion.product_images.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 h-10 w-10 p-0 bg-black/50 text-white hover:bg-black/70"
                  onClick={goToNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
              {imagePreview.type === 'counter' && procurementDetails.counterSampleImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 h-10 w-10 p-0 bg-black/50 text-white hover:bg-black/70"
                  onClick={goToNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Clickable Image Area */}
              <div 
                className="flex items-center justify-center p-4 min-h-[60vh] cursor-pointer"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const centerX = rect.width / 2;
                    
                    if (clickX < centerX) {
                      goToPreviousImage();
                    } else {
                      goToNextImage();
                    }
                  }
                }}
              >
                <img
                  src={imagePreview.url}
                  alt={`${imagePreview.type === 'product' ? 'Product' : 'Counter Sample'} image ${imagePreview.index + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                {imagePreview.type === 'product' 
                  ? `Image ${imagePreview.index + 1} of ${suggestion.product_images?.length || 0}` 
                  : `Image ${imagePreview.index + 1} of ${procurementDetails.counterSampleImages.length}`
                }
              </div>

              {/* Navigation Instructions */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-xs">
                Use ← → arrows or click sides
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
