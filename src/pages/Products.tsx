import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, ExternalLink } from "lucide-react";
import { ProductBulkUploadDialog } from "@/components/ProductBulkUploadDialog";
import { ProductCreateDialog } from "@/components/ProductCreateDialog";
import { useNotifications } from "@/hooks/useNotifications";
import { useProducts } from "@/hooks/useProducts";

const Products = () => {
  const { addNotification } = useNotifications();
  const { products, loading, error } = useProducts();

  const handleFilterClick = () => {
    addNotification({
      title: "Filters Applied",
      message: "Product filters have been applied",
      type: "info",
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "₹0";
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateMargin = (costPrice: number | null, sellingPrice: number | null) => {
    if (!costPrice || !sellingPrice || sellingPrice === 0) return "0%";
    const margin = ((sellingPrice - costPrice) / sellingPrice) * 100;
    return `${margin.toFixed(1)}%`;
  };

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Products</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleFilterClick}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <ProductBulkUploadDialog />
          <ProductCreateDialog />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{products.length}</div>
                <p className="text-xs text-info">In catalog</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products with Brand
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {products.filter(p => p.brand).length}
                </div>
                <p className="text-xs text-success">Branded products</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products with Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {products.filter(p => p.category).length}
                </div>
                <p className="text-xs text-warning">Categorized products</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {products.length > 0 
                    ? calculateMargin(
                        products.reduce((sum, p) => sum + (p.cost_price || 0), 0) / products.length,
                        products.reduce((sum, p) => sum + (p.selling_price || 0), 0) / products.length
                      )
                    : "0%"
                  }
                </div>
                <p className="text-xs text-success">Average profit margin</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Complete product information with pricing and specifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[120px]" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">No products found</p>
                        <p>Create your first product to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{product.sku}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.brand ? (
                          <div className="flex items-center space-x-2">
                            {product.brand.logo && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={product.brand.logo} alt={product.brand.brand} />
                                <AvatarFallback className="text-xs">{product.brand.brand.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-sm font-medium">{product.brand.brand}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No brand</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {product.image_url ? (
                              <AvatarImage src={product.image_url} alt={product.product_name} />
                            ) : (
                              <AvatarFallback>{product.product_name.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm text-muted-foreground truncate">
                            {product.description || 'No description'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">Cost: {formatPrice(product.cost_price)}</p>
                          <p className="text-sm font-medium">Selling: {formatPrice(product.selling_price)}</p>
                          <p className="text-xs text-success">
                            Margin: {calculateMargin(product.cost_price, product.selling_price)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.color ? (
                          <Badge variant="secondary">{product.color}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No color</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.size ? (
                          <Badge variant="outline">{product.size}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No size</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.category ? (
                          <Badge variant="secondary">{product.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(product.created_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              addNotification({
                                title: "View Product",
                                message: `Opening details for ${product.product_name}`,
                                type: "info",
                              });
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;