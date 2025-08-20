import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, Plus, Star, TrendingUp, TrendingDown, ExternalLink, Database, Package, Settings, Globe, ShoppingCart, Link, Unlink, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { ProductCreateDialog } from "@/components/ProductCreateDialog";
import { useNotifications } from "@/hooks/useNotifications";

const Mapping = () => {
  const { addNotification } = useNotifications();

  // Product mapping data - this represents relationships between master products and channel listings
  const mappings = [
    {
      id: "1",
      master_sku: "SFT-001",
      master_name: "Smart Fitness Tracker",
      master_category: "Wearables",
      master_status: "Active",
      variants: [
        {
          variant_id: "SFT-001-BLK",
          variant_name: "Smart Fitness Tracker - Black",
          color: "Black",
          size: "Medium",
          master_price: "₹2,499",
          channel_mappings: [
            {
              channel: "Amazon",
              channel_sku: "AMZ-SFT-001-BLK",
              listing_url: "https://amazon.in/product/sft-001-black",
              status: "Mapped",
              price: "₹2,299",
              stock: 45,
              last_sync: "2024-03-20 14:30"
            },
            {
              channel: "Flipkart",
              channel_sku: "FK-SFT-001-BLK",
              listing_url: "https://flipkart.com/product/sft-001-black",
              status: "Mapped",
              price: "₹2,199",
              stock: 23,
              last_sync: "2024-03-19 16:45"
            }
          ]
        },
        {
          variant_id: "SFT-001-WHT",
          variant_name: "Smart Fitness Tracker - White",
          color: "White",
          size: "Medium",
          master_price: "₹2,499",
          channel_mappings: [
            {
              channel: "Amazon",
              channel_sku: "AMZ-SFT-001-WHT",
              listing_url: "https://amazon.in/product/sft-001-white",
              status: "Mapped",
              price: "₹2,299",
              stock: 32,
              last_sync: "2024-03-20 14:30"
            }
          ]
        }
      ],
      total_channels: 3,
      mapped_channels: 3,
      sync_status: "Synced",
      last_updated: "2024-03-20",
      image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "2",
      master_sku: "WEP-002",
      master_name: "Wireless Earbuds Pro",
      master_category: "Audio",
      master_status: "Active",
      variants: [
        {
          variant_id: "WEP-002-BLK",
          variant_name: "Wireless Earbuds Pro - Black",
          color: "Black",
          size: "One Size",
          master_price: "₹1,899",
          channel_mappings: [
            {
              channel: "Amazon",
              channel_sku: "AMZ-WEP-002-BLK",
              listing_url: "https://amazon.in/product/wep-002-black",
              status: "Mapped",
              price: "₹1,699",
              stock: 67,
              last_sync: "2024-03-18 12:15"
            },
            {
              channel: "Myntra",
              channel_sku: "MYN-WEP-002-BLK",
              listing_url: "https://myntra.com/product/wep-002-black",
              status: "Mapped",
              price: "₹1,799",
              stock: 34,
              last_sync: "2024-03-17 09:30"
            }
          ]
        }
      ],
      total_channels: 2,
      mapped_channels: 2,
      sync_status: "Synced",
      last_updated: "2024-03-18",
      image: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "3",
      master_sku: "GMK-003",
      master_name: "Gaming Mechanical Keyboard",
      master_category: "Accessories",
      master_status: "Active",
      variants: [
        {
          variant_id: "GMK-003-RGB",
          variant_name: "Gaming Mechanical Keyboard - RGB",
          color: "RGB",
          size: "Full Size",
          master_price: "₹3,299",
          channel_mappings: [
            {
              channel: "Amazon",
              channel_sku: "AMZ-GMK-003-RGB",
              listing_url: "https://amazon.in/product/gmk-003-rgb",
              status: "Mapped",
              price: "₹2,999",
              stock: 12,
              last_sync: "2024-03-15 11:20"
            },
            {
              channel: "Flipkart",
              channel_sku: "FK-GMK-003-RGB",
              listing_url: "https://flipkart.com/product/gmk-003-rgb",
              status: "Unmapped",
              price: "₹3,099",
              stock: 8,
              last_sync: "Never"
            }
          ]
        }
      ],
      total_channels: 2,
      mapped_channels: 1,
      sync_status: "Partial",
      last_updated: "2024-03-15",
      image: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "4",
      master_sku: "SWX-004",
      master_name: "Smart Watch Series X",
      master_category: "Wearables",
      master_status: "Active",
      variants: [
        {
          variant_id: "SWX-004-SLV",
          variant_name: "Smart Watch Series X - Silver",
          color: "Silver",
          size: "42mm",
          master_price: "₹4,999",
          channel_mappings: [
            {
              channel: "Amazon",
              channel_sku: "AMZ-SWX-004-SLV",
              listing_url: "https://amazon.in/product/swx-004-silver",
              status: "Mapped",
              price: "₹4,599",
              stock: 25,
              last_sync: "2024-03-22 15:45"
            },
            {
              channel: "Myntra",
              channel_sku: "MYN-SWX-004-SLV",
              listing_url: "https://myntra.com/product/swx-004-silver",
              status: "Mapped",
              price: "₹4,799",
              stock: 15,
              last_sync: "2024-03-21 13:20"
            }
          ]
        },
        {
          variant_id: "SWX-004-BLK",
          variant_name: "Smart Watch Series X - Black",
          color: "Black",
          size: "42mm",
          master_price: "₹4,999",
          channel_mappings: [
            {
              channel: "Amazon",
              channel_sku: "AMZ-SWX-004-BLK",
              listing_url: "https://amazon.in/product/swx-004-black",
              status: "Pending",
              price: "₹4,599",
              stock: 18,
              last_sync: "Never"
            }
          ]
        }
      ],
      total_channels: 3,
      mapped_channels: 2,
      sync_status: "Partial",
      last_updated: "2024-03-22",
      image: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=100"
    },
    {
      id: "5",
      master_sku: "BSM-005",
      master_name: "Bluetooth Speaker Mini",
      master_category: "Audio",
      master_status: "Draft",
      variants: [
        {
          variant_id: "BSM-005-BLU",
          variant_name: "Bluetooth Speaker Mini - Blue",
          color: "Blue",
          size: "Compact",
          master_price: "₹999",
          channel_mappings: []
        }
      ],
      total_channels: 0,
      mapped_channels: 0,
      sync_status: "Not Started",
      last_updated: "2024-03-20",
      image: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=100"
    }
  ];

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "Synced":
        return "success";
      case "Partial":
        return "warning";
      case "Not Started":
        return "secondary";
      case "Error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getMappingStatusIcon = (status: string) => {
    switch (status) {
      case "Mapped":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Unmapped":
        return <Unlink className="h-4 w-4 text-destructive" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
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
      message: "Mapping filters have been applied",
      type: "info",
    });
  };

  const handleSyncClick = (masterSku: string) => {
    addNotification({
      title: "Sync Initiated",
      message: `Starting sync for ${masterSku}`,
      type: "info",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Manage product mappings between master SKUs and channel-specific listings
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
                placeholder="Search mappings by master SKU, product name, or channel..." 
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sync Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="synced">Synced</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="wearables">Wearables</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mappings.length}</div>
            <p className="text-xs text-info">Master products</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fully Synced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mappings.filter(m => m.sync_status === 'Synced').length}</div>
            <p className="text-xs text-success">Complete mappings</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mappings.reduce((sum, m) => sum + m.variants.length, 0)}</div>
            <p className="text-xs text-warning">Across all products</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Channel Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round((mappings.reduce((sum, m) => sum + m.mapped_channels, 0) / mappings.reduce((sum, m) => sum + m.total_channels, 0)) * 100)}%
            </div>
            <p className="text-xs text-success">Mapped channels</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Table */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Product Mappings</CardTitle>
          <CardDescription>Master product to channel listing mappings with sync status and variant details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Master Product</TableHead>
                <TableHead>Master SKU</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Channel Mappings</TableHead>
                <TableHead>Sync Status</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={mapping.image} alt={mapping.master_name} />
                        <AvatarFallback>{mapping.master_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{mapping.master_name}</p>
                        <p className="text-sm text-muted-foreground">{mapping.master_category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{mapping.master_sku}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {mapping.variants.map((variant) => (
                        <div key={variant.variant_id} className="text-xs">
                          <p className="font-medium">{variant.variant_name}</p>
                          <p className="text-muted-foreground">
                            {variant.color} • {variant.size} • {variant.master_price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                                     <TableCell>
                     <div className="space-y-2">
                       {mapping.variants.map((variant) => (
                         <div key={variant.variant_id} className="space-y-1">
                           {variant.channel_mappings.map((channelMapping) => (
                             <div key={channelMapping.channel} className="flex items-center space-x-2 text-xs">
                               {getMappingStatusIcon(channelMapping.status)}
                               <div className="flex items-center space-x-2">
                                 <img 
                                   src={getChannelLogo(channelMapping.channel)} 
                                   alt={channelMapping.channel}
                                   className="w-4 h-4 rounded-sm"
                                   onError={(e) => {
                                     e.currentTarget.style.display = 'none';
                                   }}
                                 />
                                 <span className="text-muted-foreground">{channelMapping.channel_sku}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                       ))}
                     </div>
                   </TableCell>
                  <TableCell>
                    <Badge variant={getSyncStatusColor(mapping.sync_status) as any}>
                      {mapping.sync_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{mapping.mapped_channels}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{mapping.total_channels}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(mapping.mapped_channels / mapping.total_channels) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {mapping.last_updated}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSyncClick(mapping.master_sku)}
                      >
                        <Link className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          addNotification({
                            title: "Edit Mapping",
                            message: `Opening edit form for ${mapping.master_name}`,
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

export default Mapping;
