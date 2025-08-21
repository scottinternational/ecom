import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { 
  TrendingUp, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Users, 
  DollarSign,
  Eye,
  ShoppingCart,
  Star,
  Filter,
  Store,
  Database
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import MCPTest from "@/components/MCPTest";
import { useMarketplaces } from "@/hooks/useMarketplaces";

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState("30d");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const { addNotification } = useNotifications();
  const { marketplaces, integrations } = useMarketplaces();

  // Sample KPI Data
  const kpis = [
    {
      title: "Total Live Listings",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "success"
    },
    {
      title: "Listings Pending",
      value: "156",
      change: "-8%",
      trend: "down",
      icon: Clock,
      color: "warning"
    },
    {
      title: "Products in R&D",
      value: "89",
      change: "+23%",
      trend: "up",
      icon: Eye,
      color: "info"
    },
    {
      title: "Monthly Revenue",
      value: "₹12.4L",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "success"
    }
  ];

  // Sample Chart Data
  const salesData = [
    { month: "Jan", amazon: 45000, flipkart: 32000, myntra: 18000 },
    { month: "Feb", amazon: 52000, flipkart: 38000, myntra: 22000 },
    { month: "Mar", amazon: 48000, flipkart: 35000, myntra: 25000 },
    { month: "Apr", amazon: 58000, flipkart: 42000, myntra: 28000 },
    { month: "May", amazon: 62000, flipkart: 45000, myntra: 32000 },
    { month: "Jun", amazon: 68000, flipkart: 48000, myntra: 35000 }
  ];

  const statusData = [
    { name: "Live", value: 2847, color: "hsl(142 76% 36%)" },
    { name: "Pending Approval", value: 156, color: "hsl(38 92% 50%)" },
    { name: "In Production", value: 89, color: "hsl(199 89% 48%)" },
    { name: "Content Ready", value: 234, color: "hsl(220 85% 35%)" }
  ];

  const productionData = [
    { stage: "Sample Ready", count: 45 },
    { stage: "Photoshoot", count: 23 },
    { stage: "Content Creation", count: 67 },
    { stage: "Quality Check", count: 34 },
    { stage: "Inventory Inward", count: 89 }
  ];

  // New chart data
  const productPerformanceData = [
    { product: "Smart Tracker", amazon: 85, flipkart: 78, myntra: 65 },
    { product: "Earbuds Pro", amazon: 92, flipkart: 88, myntra: 82 },
    { product: "Gaming KB", amazon: 76, flipkart: 71, myntra: 68 },
    { product: "Fitness Band", amazon: 89, flipkart: 85, myntra: 79 },
    { product: "Smart Watch", amazon: 94, flipkart: 91, myntra: 87 }
  ];

  const ratingData = [
    { product: "Smart Tracker", amazon: 4.2, flipkart: 4.0, myntra: 3.8 },
    { product: "Earbuds Pro", amazon: 4.5, flipkart: 4.3, myntra: 4.1 },
    { product: "Gaming KB", amazon: 4.1, flipkart: 3.9, myntra: 3.7 },
    { product: "Fitness Band", amazon: 4.3, flipkart: 4.1, myntra: 3.9 },
    { product: "Smart Watch", amazon: 4.6, flipkart: 4.4, myntra: 4.2 }
  ];

  const trendData = [
    { month: "Jan", revenue: 45000, orders: 120, customers: 89 },
    { month: "Feb", revenue: 52000, orders: 145, customers: 102 },
    { month: "Mar", revenue: 48000, orders: 132, customers: 95 },
    { month: "Apr", revenue: 58000, orders: 168, customers: 118 },
    { month: "May", revenue: 62000, orders: 185, customers: 134 },
    { month: "Jun", revenue: 68000, orders: 201, customers: 156 }
  ];

  const categoryPerformance = [
    { category: "Electronics", value: 85, fullMark: 100 },
    { category: "Fitness", value: 78, fullMark: 100 },
    { category: "Gaming", value: 92, fullMark: 100 },
    { category: "Audio", value: 88, fullMark: 100 },
    { category: "Wearables", value: 76, fullMark: 100 }
  ];

  const getKpiIcon = (IconComponent: any, color: string) => {
    const colorClass = color === "success" ? "text-success" : 
                      color === "warning" ? "text-warning" : 
                      color === "info" ? "text-info" : "text-primary";
    return <IconComponent className={`h-6 w-6 ${colorClass}`} />;
  };

  const handleFilterChange = (type: string, value: string) => {
    if (type === "marketplace") {
      setMarketplaceFilter(value);
    } else if (type === "date") {
      setDateFilter(value);
    }
    
    // Add notification for filter change
    addNotification({
      title: "Filter Applied",
      message: `Dashboard filtered by ${type}: ${value}`,
      type: "info",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your e-commerce operations across all marketplaces
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={marketplaceFilter} onValueChange={(value) => handleFilterChange("marketplace", value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Marketplace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Marketplaces</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
              <SelectItem value="flipkart">Flipkart</SelectItem>
              <SelectItem value="myntra">Myntra</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateFilter} onValueChange={(value) => handleFilterChange("date", value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => addNotification({
              title: "Advanced Filters",
              message: "Advanced filtering options opened",
              type: "info",
            })}
          >
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="animate-fade-in shadow-enterprise">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              {getKpiIcon(kpi.icon, kpi.color)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className={`h-3 w-3 mr-1 ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'}`} />
                <span className={kpi.trend === 'up' ? 'text-success' : 'text-destructive'}>
                  {kpi.change}
                </span>
                <span className="ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Marketplace Status */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Marketplace Integrations
                <Badge variant="secondary" className="ml-2">
                  {integrations.filter(i => i.status === 'connected').length} connected
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your marketplace connections and sync status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketplaces.slice(0, 3).map((marketplace) => {
                  const integration = integrations.find(i => i.marketplace_id === marketplace.id);
                  return (
                    <div key={marketplace.id} className="flex items-center justify-between">
                      <span className="text-sm">{marketplace.display_name}</span>
                      <Badge variant={integration?.status === 'connected' ? 'default' : 'secondary'}>
                        {integration?.status === 'connected' ? 'Connected' : 'Not Configured'}
                      </Badge>
                    </div>
                  );
                })}
                {marketplaces.length > 3 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      +{marketplaces.length - 3} more marketplaces
                    </span>
                  </div>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/marketplaces'}
              >
                Manage Marketplaces
              </Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Test connections and sync data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full">
                Test All Connections
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Sync All Data
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                View Sync Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales by Marketplace */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Sales by Marketplace</CardTitle>
            <CardDescription>Monthly revenue comparison across platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="amazon" fill="hsl(38 92% 50%)" name="Amazon" />
                <Bar dataKey="flipkart" fill="hsl(199 89% 48%)" name="Flipkart" />
                <Bar dataKey="myntra" fill="hsl(220 85% 35%)" name="Myntra" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Status Distribution */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Product Status</CardTitle>
            <CardDescription>Current distribution of product stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Performance Across Channels */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Product Performance Across Channels</CardTitle>
            <CardDescription>Performance scores by marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="product" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="amazon" fill="hsl(38 92% 50%)" name="Amazon" />
                <Bar dataKey="flipkart" fill="hsl(199 89% 48%)" name="Flipkart" />
                <Bar dataKey="myntra" fill="hsl(220 85% 35%)" name="Myntra" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Ratings */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Average Ratings Across Channels</CardTitle>
            <CardDescription>Product ratings by marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="product" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[3, 5]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="amazon" stroke="hsl(38 92% 50%)" strokeWidth={2} name="Amazon" />
                <Line type="monotone" dataKey="flipkart" stroke="hsl(199 89% 48%)" strokeWidth={2} name="Flipkart" />
                <Line type="monotone" dataKey="myntra" stroke="hsl(220 85% 35%)" strokeWidth={2} name="Myntra" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Revenue & Growth Trends</CardTitle>
            <CardDescription>Monthly revenue, orders, and customer growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36%)" fillOpacity={0.6} name="Revenue" />
                <Area type="monotone" dataKey="orders" stackId="2" stroke="hsl(199 89% 48%)" fill="hsl(199 89% 48%)" fillOpacity={0.6} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance Radar */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Performance radar across product categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={categoryPerformance}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Performance" dataKey="value" stroke="hsl(220 85% 35%)" fill="hsl(220 85% 35%)" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Production Pipeline & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Production Pipeline */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Production Pipeline</CardTitle>
            <CardDescription>Current status of products in production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    <span className="text-sm font-medium">{item.stage}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Product XYZ-001 approved</p>
                  <p className="text-xs text-muted-foreground">2 hours ago • Admin</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Inventory low for ABC-123</p>
                  <p className="text-xs text-muted-foreground">4 hours ago • Inventory Team</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-info mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New product suggestion submitted</p>
                  <p className="text-xs text-muted-foreground">6 hours ago • R&D Team</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Product DEF-456 went live</p>
                  <p className="text-xs text-muted-foreground">8 hours ago • Listing Team</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MCP Integration Test */}
      <MCPTest />


    </div>
  );
};

export default Dashboard;