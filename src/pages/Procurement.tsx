import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Factory, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductSuggestions } from "@/hooks/useProductSuggestions";
import { useState } from "react";

const Procurement = () => {
  const { suggestions } = useProductSuggestions();
  const [purchaseOrders] = useState<any[]>([]);

  // Calculate stats
  const totalSampleRequests = suggestions.length;
  const pendingSampleRequests = suggestions.filter(s => s.status === "In Research").length;
  const totalPurchaseOrders = purchaseOrders.length;
  const activePurchaseOrders = purchaseOrders.filter(po => po.status === "In Production").length;

  const procurementCards = [
    {
      title: "Product Sample Requests",
      description: "Manage product sample requests from R&D team",
      icon: Package,
      count: totalSampleRequests,
      pending: pendingSampleRequests,
      url: "/procurement/sample-requests",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Purchase Orders",
      description: "Track production status and manage purchase orders",
      icon: ShoppingCart,
      count: totalPurchaseOrders,
      pending: activePurchaseOrders,
      url: "/procurement/purchase-orders",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Procurement</h1>
          <p className="text-muted-foreground mt-1">
            Manage product samples, purchase orders, and production coordination
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sample Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalSampleRequests}</div>
            <p className="text-xs text-warning">{pendingSampleRequests} pending review</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalPurchaseOrders}</div>
            <p className="text-xs text-info">{activePurchaseOrders} in production</p>
          </CardContent>
        </Card>
      </div>

      {/* Procurement Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {procurementCards.map((card) => (
          <Card key={card.title} className="shadow-enterprise hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <Badge variant="outline" className={card.borderColor}>
                  {card.pending} pending
                </Badge>
              </div>
              <CardTitle className="text-xl">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{card.count}</p>
                  <p className="text-sm text-muted-foreground">Total items</p>
                </div>
                <Button asChild variant="outline" className="gap-2">
                  <Link to={card.url}>
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common procurement tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/procurement/sample-requests">
                <Package className="h-6 w-6" />
                <span>Review Sample Requests</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col gap-2">
              <Link to="/procurement/purchase-orders">
                <ShoppingCart className="h-6 w-6" />
                <span>Manage Purchase Orders</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Factory className="h-6 w-6" />
              <span>Production Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Procurement;
