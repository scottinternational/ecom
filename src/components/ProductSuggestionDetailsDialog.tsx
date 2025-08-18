import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, ExternalLink, Calendar, DollarSign, Clock, Target, Users, FileText, X, ZoomIn, ChevronLeft, ChevronRight, Building2, Percent, Package } from "lucide-react";
import { ProductSuggestion } from "@/hooks/useProductSuggestions";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProductSuggestionDetailsDialogProps {
  suggestion: ProductSuggestion;
  trigger?: React.ReactNode;
}

export function ProductSuggestionDetailsDialog({ suggestion, trigger }: ProductSuggestionDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; index: number; type: 'product' | 'counter' } | null>(null);

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
        images = suggestion.counter_sample_images || [];
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
        images = suggestion.counter_sample_images || [];
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
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Product Suggestion Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the product suggestion
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{suggestion.title}</h2>
              </div>
              <Badge variant={getStatusColor(suggestion.status) as any} className="text-sm">
                {suggestion.status}
              </Badge>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </CardContent>
            </Card>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Priority</h3>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {suggestion.priority}
                  </Badge>
                </CardContent>
              </Card>

              {/* Target Price */}
              {suggestion.target_price && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">Target Price</h3>
                    </div>
                    <p className="text-sm">₹{suggestion.target_price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              )}

              {/* Proposed Selling Price */}
              {suggestion.proposed_selling_price && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">Proposed Selling Price</h3>
                    </div>
                    <p className="text-sm">₹{suggestion.proposed_selling_price.toLocaleString()}</p>
                  </CardContent>
                </Card>
              )}

              {/* Expected Timeline */}
              {suggestion.expected_timeline && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">Expected Timeline</h3>
                    </div>
                    <p className="text-sm">{suggestion.expected_timeline}</p>
                  </CardContent>
                </Card>
              )}

              {/* Submitted Date */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Submitted</h3>
                  </div>
                  <p className="text-sm">{formatDate(suggestion.created_at)}</p>
                </CardContent>
              </Card>

              {/* Last Updated */}
              {suggestion.updated_at !== suggestion.created_at && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-medium">Last Updated</h3>
                    </div>
                    <p className="text-sm">{formatDate(suggestion.updated_at)}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Target Marketplaces */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">Target Marketplaces</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestion.target_marketplaces.map((marketplace) => (
                    <Badge key={marketplace} variant="outline" className="text-sm">
                      {marketplace}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competitors */}
            {suggestion.competitors && suggestion.competitors.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Competitors</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.competitors.map((competitor) => (
                      <Badge key={competitor} variant="secondary" className="text-sm">
                        {competitor}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product URL */}
            {suggestion.product_url && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium mb-1">Competitor Product URL</h3>
                      <p className="text-sm text-muted-foreground break-all">
                        {suggestion.product_url}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUrlClick}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Product Images */}
            {suggestion.product_images && suggestion.product_images.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">Product Images</h3>
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

            {/* Price Comparison Chart */}
            {(suggestion.target_price || suggestion.cost_price) && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5" />
                    <h3 className="font-medium">Target vs Cost Price Comparison</h3>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          {
                            name: 'Target Price',
                            value: suggestion.target_price || 0,
                            color: '#3b82f6',
                            label: 'R&D Target'
                          },
                          {
                            name: 'Cost Price',
                            value: suggestion.cost_price || 0,
                            color: '#f59e0b',
                            label: 'Procurement Cost'
                          }
                        ].filter(item => item.value > 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tickFormatter={(value) => `₹${value.toLocaleString()}`}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Price']}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            {
                              name: 'Target Price',
                              value: suggestion.target_price || 0,
                              color: '#3b82f6',
                              label: 'R&D Target'
                            },
                            {
                              name: 'Cost Price',
                              value: suggestion.cost_price || 0,
                              color: '#f59e0b',
                              label: 'Procurement Cost'
                            }
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Price Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {suggestion.target_price && (
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-700">Target Price</div>
                        <div className="text-lg font-bold text-blue-900">₹{suggestion.target_price.toLocaleString()}</div>
                        <div className="text-xs text-blue-600">R&D Target</div>
                      </div>
                    )}
                    
                    {suggestion.cost_price && (
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-sm font-medium text-amber-700">Cost Price</div>
                        <div className="text-lg font-bold text-amber-900">₹{suggestion.cost_price.toLocaleString()}</div>
                        <div className="text-xs text-amber-600">Procurement Cost</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Target vs Cost Analysis */}
                  {suggestion.target_price && suggestion.cost_price && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Target vs Cost Analysis</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Price Difference:</span>
                          <span className={`font-medium ml-2 ${suggestion.target_price >= suggestion.cost_price ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{(suggestion.target_price - suggestion.cost_price).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Variance:</span>
                          <span className={`font-medium ml-2 ${suggestion.target_price >= suggestion.cost_price ? 'text-green-600' : 'text-red-600'}`}>
                            {((suggestion.target_price - suggestion.cost_price) / suggestion.target_price * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profitability Analysis */}
            {suggestion.cost_price && suggestion.proposed_selling_price && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5" />
                    <h3 className="font-medium">Profitability Analysis</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {suggestion.proposed_selling_price && (
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-700">Proposed Selling Price</div>
                        <div className="text-lg font-bold text-green-900">₹{suggestion.proposed_selling_price.toLocaleString()}</div>
                        <div className="text-xs text-green-600">R&D Proposed</div>
                      </div>
                    )}
                    
                    {suggestion.cost_price && (
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-sm font-medium text-amber-700">Cost Price</div>
                        <div className="text-lg font-bold text-amber-900">₹{suggestion.cost_price.toLocaleString()}</div>
                        <div className="text-xs text-amber-600">Procurement Cost</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Margin Analysis */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Margin Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Gross Profit:</span>
                        <span className="font-medium ml-2 text-green-600">
                          ₹{(suggestion.proposed_selling_price - suggestion.cost_price).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Profit Margin:</span>
                        <span className="font-medium ml-2 text-green-600">
                          {((suggestion.proposed_selling_price - suggestion.cost_price) / suggestion.proposed_selling_price * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Procurement Information */}
            {(suggestion.cost_price || suggestion.gst_rate || suggestion.lead_time_days || 
              (suggestion.counter_sample_images && suggestion.counter_sample_images.length > 0) || 
              suggestion.procurement_notes) && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5" />
                    <h3 className="font-medium">Procurement Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {suggestion.cost_price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium">Cost Price</Label>
                          <p className="text-sm text-muted-foreground">₹{suggestion.cost_price.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {suggestion.gst_rate !== undefined && (
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium">GST Rate</Label>
                          <p className="text-sm text-muted-foreground">{suggestion.gst_rate}%</p>
                        </div>
                      </div>
                    )}
                    
                    {suggestion.lead_time_days && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <Label className="text-sm font-medium">Lead Time</Label>
                          <p className="text-sm text-muted-foreground">{suggestion.lead_time_days} days</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Counter Sample Images */}
                  {suggestion.counter_sample_images && suggestion.counter_sample_images.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Counter Sample Images ({suggestion.counter_sample_images.length})</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {suggestion.counter_sample_images.map((imageUrl, index) => (
                          <div 
                            key={index} 
                            className="relative group cursor-pointer aspect-square"
                            onClick={() => handleImageClick(imageUrl, index, 'counter')}
                          >
                            <img
                              src={imageUrl}
                              alt={`Counter sample ${index + 1}`}
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
                    </div>
                  )}

                  {/* Procurement Notes */}
                  {suggestion.procurement_notes && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Procurement Notes</Label>
                      <div 
                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: suggestion.procurement_notes }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setOpen(false)}>
              Close
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
              {imagePreview.type === 'counter' && suggestion.counter_sample_images && suggestion.counter_sample_images.length > 1 && (
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
              {imagePreview.type === 'counter' && suggestion.counter_sample_images && suggestion.counter_sample_images.length > 1 && (
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
                  // Only handle clicks on the image area, not on buttons
                  if (e.target === e.currentTarget) {
                    // Click on left side = previous, right side = next
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
                  onClick={(e) => e.stopPropagation()} // Prevent click on image itself
                />
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm">
                {imagePreview.type === 'product' 
                  ? `Image ${imagePreview.index + 1} of ${suggestion.product_images?.length || 0}` 
                  : `Image ${imagePreview.index + 1} of ${suggestion.counter_sample_images?.length || 0}`
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
