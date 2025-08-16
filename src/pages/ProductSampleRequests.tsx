import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Clock, CheckCircle, AlertCircle, RefreshCw, Package } from "lucide-react";
import { ProductSampleRequestDetailsDialog } from "@/components/ProductSampleRequestDetailsDialog";
import { useProductSuggestions } from "@/hooks/useProductSuggestions";
import { Skeleton } from "@/components/ui/skeleton";

const ProductSampleRequests = () => {
  const { suggestions, loading, error, fetchSuggestions } = useProductSuggestions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Research":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Sample Ready":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Sent for Approval":
        return <AlertCircle className="h-4 w-4 text-info" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
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

  // Calculate stats from real data
  const totalRequests = suggestions.length;
  const inResearchCount = suggestions.filter(s => s.status === "In Research").length;
  const sampleReadyCount = suggestions.filter(s => s.status === "Sample Ready").length;
  const approvalPendingCount = suggestions.filter(s => s.status === "Sent for Approval").length;

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Sample Requests</h1>
            <p className="text-muted-foreground mt-1">
              Manage product sample requests from R&D team
            </p>
          </div>
        </div>
        
        <Card className="shadow-enterprise">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading requests: {error}</p>
              <Button onClick={fetchSuggestions} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Sample Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage product sample requests from R&D team
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchSuggestions}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{totalRequests}</div>
                <p className="text-xs text-info">+{suggestions.filter(s => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(s.created_at) > weekAgo;
                }).length} this week</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{inResearchCount}</div>
                <p className="text-xs text-warning">Being researched</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Samples Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{sampleReadyCount}</div>
                <p className="text-xs text-success">Ready for production</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{approvalPendingCount}</div>
                <p className="text-xs text-info">Awaiting review</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Sample Requests List */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Sample Requests</CardTitle>
          <CardDescription>Product suggestions from R&D team awaiting sample production</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <div>
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Sample Requests</h3>
              <p className="text-muted-foreground mb-6">
                No product suggestions have been submitted yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div 
                  key={suggestion.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Product Image Thumbnail */}
                    {suggestion.product_images && suggestion.product_images.length > 0 && (
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-border flex-shrink-0">
                        <img
                          src={suggestion.product_images[0]}
                          alt={suggestion.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(suggestion.status)}
                      <div>
                        <h3 className="font-medium text-foreground">{suggestion.title}</h3>
                        <p className="text-sm text-muted-foreground">Submitted: {new Date(suggestion.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {/* Target Marketplaces Section */}
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Target Marketplaces:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.target_marketplaces.map((marketplace) => (
                          <Badge key={marketplace} variant="outline" className="text-xs">
                            {marketplace}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Competitors Section */}
                    {suggestion.competitors && suggestion.competitors.length > 0 && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Competitors:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.competitors.map((competitor) => (
                            <Badge key={competitor} variant="secondary" className="text-xs">
                              {competitor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant={getStatusColor(suggestion.status) as any}>
                        {suggestion.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Priority: {suggestion.priority}
                      </p>
                      {suggestion.target_price && (
                        <p className="text-xs text-muted-foreground">
                          Target: ₹{suggestion.target_price.toLocaleString()}
                        </p>
                      )}
                      {suggestion.proposed_selling_price && (
                        <p className="text-xs text-muted-foreground">
                          Proposed: ₹{suggestion.proposed_selling_price.toLocaleString()}
                        </p>
                      )}
                    </div>
                    
                    <ProductSampleRequestDetailsDialog 
                      suggestion={suggestion}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Manage Request
                        </Button>
                      }
                      onSuccess={fetchSuggestions}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductSampleRequests;
