import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Plus, Star, TrendingUp, TrendingDown, ExternalLink, Database, Package, Settings, Globe, ShoppingCart } from "lucide-react";
import { ProductCreateDialog } from "@/components/ProductCreateDialog";
import { useNotifications } from "@/hooks/useNotifications";

const Listing = () => {
  const { addNotification } = useNotifications();

  // Marketplace listing data - this represents products across different channels
  const listings = [
    {
      id: "1",
      channel_sku: "AMZ-SFT-001",
      master_sku: "SFT-001",
      name: "Smart Fitness Tracker",
      channel: "Amazon",
      category: "Wearables",
      listing_url: "https://amazon.in/product/sft-001",
      status: "Live",
      price: "₹2,499",
      selling_price: "₹2,299",
      stock: 45,
      rank: 12,
      avgRating: 4.2,
      totalReviews: 1247,
      monthlyRevenue: "₹1,12,455",
      monthlySales: 49,
      trend: "up",
      lastUpdated: "2024-03-20",
      image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "2",
      channel_sku: "FK-SFT-001",
      master_sku: "SFT-001",
      name: "Smart Fitness Tracker",
      channel: "Flipkart",
      category: "Wearables",
      listing_url: "https://flipkart.com/product/sft-001",
      status: "Live",
      price: "₹2,499",
      selling_price: "₹2,199",
      stock: 23,
      rank: 8,
      avgRating: 4.1,
      totalReviews: 892,
      monthlyRevenue: "₹89,234",
      monthlySales: 41,
      trend: "up",
      lastUpdated: "2024-03-19",
      image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "3",
      channel_sku: "AMZ-WEP-002",
      master_sku: "WEP-002",
      name: "Wireless Earbuds Pro",
      channel: "Amazon",
      category: "Audio",
      listing_url: "https://amazon.in/product/wep-002",
      status: "Live",
      price: "₹1,899",
      selling_price: "₹1,699",
      stock: 67,
      rank: 5,
      avgRating: 4.5,
      totalReviews: 567,
      monthlyRevenue: "₹1,23,456",
      monthlySales: 73,
      trend: "up",
      lastUpdated: "2024-03-18",
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "4",
      channel_sku: "MYN-WEP-002",
      master_sku: "WEP-002",
      name: "Wireless Earbuds Pro",
      channel: "Myntra",
      category: "Audio",
      listing_url: "https://myntra.com/product/wep-002",
      status: "Live",
      price: "₹1,899",
      selling_price: "₹1,799",
      stock: 34,
      rank: 7,
      avgRating: 4.3,
      totalReviews: 234,
      monthlyRevenue: "₹67,890",
      monthlySales: 38,
      trend: "down",
      lastUpdated: "2024-03-17",
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "5",
      channel_sku: "AMZ-GMK-003",
      master_sku: "GMK-003",
      name: "Gaming Mechanical Keyboard",
      channel: "Amazon",
      category: "Accessories",
      listing_url: "https://amazon.in/product/gmk-003",
      status: "Live",
      price: "₹3,299",
      selling_price: "₹2,999",
      stock: 12,
      rank: 18,
      avgRating: 4.1,
      totalReviews: 456,
      monthlyRevenue: "₹45,678",
      monthlySales: 15,
      trend: "down",
      lastUpdated: "2024-03-15",
      image: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "6",
      channel_sku: "FK-GMK-003",
      master_sku: "GMK-003",
      name: "Gaming Mechanical Keyboard",
      channel: "Flipkart",
      category: "Accessories",
      listing_url: "https://flipkart.com/product/gmk-003",
      status: "Live",
      price: "₹3,299",
      selling_price: "₹3,099",
      stock: 8,
      rank: 22,
      avgRating: 4.0,
      totalReviews: 123,
      monthlyRevenue: "₹23,456",
      monthlySales: 8,
      trend: "neutral",
      lastUpdated: "2024-03-14",
      image: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "7",
      channel_sku: "AMZ-SWX-004",
      master_sku: "SWX-004",
      name: "Smart Watch Series X",
      channel: "Amazon",
      category: "Wearables",
      listing_url: "https://amazon.in/product/swx-004",
      status: "Live",
      price: "₹4,999",
      selling_price: "₹4,599",
      stock: 25,
      rank: 3,
      avgRating: 4.6,
      totalReviews: 2134,
      monthlyRevenue: "₹2,45,678",
      monthlySales: 53,
      trend: "up",
      lastUpdated: "2024-03-22",
      image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "8",
      channel_sku: "MYN-SWX-004",
      master_sku: "SWX-004",
      name: "Smart Watch Series X",
      channel: "Myntra",
      category: "Wearables",
      listing_url: "https://myntra.com/product/swx-004",
      status: "Live",
      price: "₹4,999",
      selling_price: "₹4,799",
      stock: 15,
      rank: 4,
      avgRating: 4.5,
      totalReviews: 789,
      monthlyRevenue: "₹1,23,456",
      monthlySales: 26,
      trend: "up",
      lastUpdated: "2024-03-21",
      image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "success";
      case "Draft":
        return "secondary";
      case "Paused":
        return "warning";
      case "Suspended":
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

  const getChannelLogo = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "amazon":
        return "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg";
      case "flipkart":
        return "https://upload.wikimedia.org/wikipedia/commons/2/20/Flipkart_logo.png";
      case "myntra":
        return "https://upload.wikimedia.org/wikipedia/commons/c/c8/Myntra_logo.png";
      case "jiomart":
        return "https://upload.wikimedia.org/wikipedia/commons/8/8a/JioMart_logo.png";
      case "ajio":
        return "https://upload.wikimedia.org/wikipedia/commons/8/8a/Ajio_logo.png";
      case "meesho":
        return "https://upload.wikimedia.org/wikipedia/commons/8/8a/Meesho_logo.png";
      default:
        return "";
    }
  };

  const handleFilterClick = () => {
    addNotification({
      title: "Filters Applied",
      message: "Listing filters have been applied",
      type: "info",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Listing</h1>
          <p className="text-muted-foreground mt-1">
            Manage marketplace listings, pricing, and channel-specific product data
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
          <ProductCreateDialog />
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="shadow-enterprise">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search listings by SKU, product name, or channel..." 
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="flipkart">Flipkart</SelectItem>
                <SelectItem value="myntra">Myntra</SelectItem>
                <SelectItem value="jiomart">Jiomart</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{listings.length}</div>
            <p className="text-xs text-info">Across all channels</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Live Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{listings.filter(l => l.status === 'Live').length}</div>
            <p className="text-xs text-success">Currently active</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹7.2L</div>
            <p className="text-xs text-success">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.2%</div>
            <p className="text-xs text-warning">Click to purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* Listing Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Marketplace Listings</CardTitle>
          <CardDescription>Channel-specific product listings with performance metrics and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>SKU Details</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={listing.image} alt={listing.name} />
                        <AvatarFallback>{listing.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{listing.name}</p>
                        <p className="text-sm text-muted-foreground">{listing.category}</p>
                      </div>
                    </div>
                  </TableCell>
                                     <TableCell>
                     <div className="flex items-center space-x-2">
                       <img 
                         src={getChannelLogo(listing.channel)} 
                         alt={listing.channel}
                         className="w-4 h-4 rounded-sm"
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                         }}
                       />
                       <Badge variant="outline">{listing.channel}</Badge>
                     </div>
                   </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Channel: {listing.channel_sku}</p>
                      <p className="text-xs text-muted-foreground">Master: {listing.master_sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{listing.selling_price}</p>
                      <p className="text-xs text-muted-foreground line-through">{listing.price}</p>
                      <p className="text-xs text-success">
                        {Math.round(((parseInt(listing.price.replace('₹', '').replace(',', '')) - parseInt(listing.selling_price.replace('₹', '').replace(',', ''))) / parseInt(listing.price.replace('₹', '').replace(',', '')) * 100))}% off
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(listing.status) as any}>
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={listing.stock < 20 ? "text-warning font-medium" : "text-foreground"}>
                      {listing.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">#{listing.rank}</Badge>
                  </TableCell>
                  <TableCell>
                    {listing.avgRating > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{listing.avgRating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {listing.totalReviews} reviews
                        </p>
                        <p className="text-xs text-success">
                          {listing.monthlySales} sold this month
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">No reviews</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{listing.monthlyRevenue}</TableCell>
                  <TableCell>{getTrendIcon(listing.trend)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {listing.listing_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(listing.listing_url, '_blank');
                            addNotification({
                              title: "Opening Listing",
                              message: `Opening ${listing.name} on ${listing.channel}`,
                              type: "info",
                            });
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          addNotification({
                            title: "Edit Listing",
                            message: `Opening edit form for ${listing.name} on ${listing.channel}`,
                            type: "info",
                          });
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
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

export default Listing;
