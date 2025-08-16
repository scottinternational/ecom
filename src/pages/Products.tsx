import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingBag, Filter, Search, Plus, Star, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { BulkUploadDialog } from "@/components/BulkUploadDialog";
import { ProductCreateDialog } from "@/components/ProductCreateDialog";
import { useNotifications } from "@/hooks/useNotifications";

const Products = () => {
  const { addNotification } = useNotifications();

  // Enhanced mock product data with all required fields
  const products = [
    {
      id: "1",
      channel_sku: "AMZ-SFT-001",
      channel_names: ["Amazon", "Flipkart"],
      sku: "SFT-001",
      class: "Electronics",
      color: "Black",
      size: "Medium",
      name: "Smart Fitness Tracker",
      category: "Wearables",
      listing_url: "https://amazon.in/product/sft-001",
      image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Live",
      price: "₹2,499",
      stock: 45,
      amazonRank: 12,
      flipkartRank: 8,
      myntraRank: 15,
      avgRating: 4.2,
      totalReviews: 1247,
      monthlyRevenue: "₹1,12,455",
      trend: "up"
    },
    {
      id: "2",
      channel_sku: "FK-WEP-002",
      channel_names: ["Flipkart", "Myntra"],
      sku: "WEP-002",
      class: "Audio",
      color: "White",
      size: "One Size",
      name: "Wireless Earbuds Pro",
      category: "Electronics",
      listing_url: "https://flipkart.com/product/wep-002",
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Live",
      price: "₹1,899",
      stock: 23,
      amazonRank: 5,
      flipkartRank: 12,
      myntraRank: 7,
      avgRating: 4.5,
      totalReviews: 892,
      monthlyRevenue: "₹89,234",
      trend: "up"
    },
    {
      id: "3",
      channel_sku: "MYN-GMK-003",
      channel_names: ["Myntra", "Ajio"],
      sku: "GMK-003",
      class: "Gaming",
      color: "RGB",
      size: "Full Size",
      name: "Gaming Mechanical Keyboard",
      category: "Accessories",
      listing_url: "https://myntra.com/product/gmk-003",
      image: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Live",
      price: "₹3,299",
      stock: 67,
      amazonRank: 18,
      flipkartRank: 22,
      myntraRank: 25,
      avgRating: 4.1,
      totalReviews: 456,
      monthlyRevenue: "₹67,890",
      trend: "down"
    },
    {
      id: "4",
      channel_sku: "JIO-SWX-004",
      channel_names: ["Jiomart", "Meesho"],
      sku: "SWX-004",
      class: "Wearables",
      color: "Silver",
      size: "42mm",
      name: "Smart Watch Series X",
      category: "Wearables",
      listing_url: "https://jiomart.com/product/swx-004",
      image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Live",
      price: "₹4,999",
      stock: 12,
      amazonRank: 3,
      flipkartRank: 6,
      myntraRank: 4,
      avgRating: 4.6,
      totalReviews: 2134,
      monthlyRevenue: "₹2,45,678",
      trend: "up"
    },
    {
      id: "5",
      channel_sku: "ALL-BSM-005",
      channel_names: ["Amazon", "Flipkart", "Myntra"],
      sku: "BSM-005",
      class: "Audio",
      color: "Blue",
      size: "Compact",
      name: "Bluetooth Speaker Mini",
      category: "Electronics",
      listing_url: "",
      image: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Draft",
      price: "₹999",
      stock: 0,
      amazonRank: null,
      flipkartRank: null,
      myntraRank: null,
      avgRating: 0,
      totalReviews: 0,
      monthlyRevenue: "₹0",
      trend: "neutral"
    },
    {
      id: "6",
      channel_sku: "AMZ-PWB-006",
      channel_names: ["Amazon"],
      sku: "PWB-006",
      class: "Electronics",
      color: "Black",
      size: "10000mAh",
      name: "Power Bank Ultra",
      category: "Accessories",
      listing_url: "https://amazon.in/product/pwb-006",
      image: "https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Live",
      price: "₹1,299",
      stock: 89,
      amazonRank: 15,
      flipkartRank: null,
      myntraRank: null,
      avgRating: 4.3,
      totalReviews: 567,
      monthlyRevenue: "₹45,678",
      trend: "up"
    },
    {
      id: "7",
      channel_sku: "FK-WCH-007",
      channel_names: ["Flipkart", "Ajio"],
      sku: "WCH-007",
      class: "Electronics",
      color: "White",
      size: "Fast Charge",
      name: "Wireless Charger Pad",
      category: "Accessories",
      listing_url: "https://flipkart.com/product/wch-007",
      image: "https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=100",
      status: "Live",
      price: "₹799",
      stock: 34,
      amazonRank: null,
      flipkartRank: 9,
      myntraRank: null,
      avgRating: 4.0,
      totalReviews: 234,
      monthlyRevenue: "₹23,456",
      trend: "up"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "success";
      case "Draft":
        return "secondary";
      case "Out of Stock":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const handleFilterClick = () => {
    addNotification({
      title: "Filters Applied",
      message: "Product filters have been applied",
      type: "info",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all products across their lifecycle and marketplaces
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
          <BulkUploadDialog />
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
            <div className="text-2xl font-bold text-foreground">{products.length}</div>
            <p className="text-xs text-info">In catalog</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{products.filter(p => p.status === 'Live').length}</div>
            <p className="text-xs text-success">Currently selling</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{products.filter(p => p.status === 'Draft').length}</div>
            <p className="text-xs text-warning">Pending launch</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Revenue/Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹8.4K</div>
            <p className="text-xs text-success">Monthly average</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Complete product information with all fields and marketplace performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU Details</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Marketplace Ranks</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={product.image} alt={product.name} />
                        <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Master: {product.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Channel: {product.channel_sku}</p>
                      <p className="text-xs text-muted-foreground">Master: {product.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">Class: {product.class}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.color} • {product.size}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.channel_names.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-xs">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(product.status) as any}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{product.price}</TableCell>
                  <TableCell>
                    <span className={product.stock < 20 ? "text-warning" : "text-foreground"}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {product.amazonRank && (
                        <div className="flex items-center text-xs">
                          <span className="w-12">AMZ:</span>
                          <Badge variant="outline" className="text-xs">#{product.amazonRank}</Badge>
                        </div>
                      )}
                      {product.flipkartRank && (
                        <div className="flex items-center text-xs">
                          <span className="w-12">FK:</span>
                          <Badge variant="outline" className="text-xs">#{product.flipkartRank}</Badge>
                        </div>
                      )}
                      {product.myntraRank && (
                        <div className="flex items-center text-xs">
                          <span className="w-12">MYN:</span>
                          <Badge variant="outline" className="text-xs">#{product.myntraRank}</Badge>
                        </div>
                      )}
                      {!product.amazonRank && !product.flipkartRank && !product.myntraRank && (
                        <span className="text-muted-foreground text-xs">Not listed</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.avgRating > 0 ? (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{product.avgRating}</span>
                        <span className="text-muted-foreground text-xs">
                          ({product.totalReviews})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No reviews</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.monthlyRevenue}</TableCell>
                  <TableCell>{getTrendIcon(product.trend)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {product.listing_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(product.listing_url, '_blank');
                            addNotification({
                              title: "Opening Product Page",
                              message: `Opening ${product.name} listing page`,
                              type: "info",
                            });
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;