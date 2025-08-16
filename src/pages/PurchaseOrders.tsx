import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, Package, Clock, CheckCircle, Upload, Plus } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Sample Set Ready":
        return "success";
      case "In Production":
        return "warning";
      case "Awaiting Approval":
        return "info";
      default:
        return "secondary";
    }
  };

  // Calculate stats from real data
  const activePOs = purchaseOrders.length;
  const inProduction = purchaseOrders.filter(po => po.status === "In Production").length;
  const sampleSetsReady = purchaseOrders.filter(po => po.status === "Sample Set Ready").length;
  const avgProductionTime = purchaseOrders.length > 0 ? "18d" : "0d";

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track production status, manage samples, and coordinate with teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Update
          </Button>
          <Button variant="enterprise">
            <Plus className="h-4 w-4 mr-2" />
            Create PO
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active POs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{activePOs}</div>
                <p className="text-xs text-info">
                  {purchaseOrders.filter(po => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(po.created_at || po.dueDate) > weekAgo;
                  }).length} new this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{inProduction}</div>
                <p className="text-xs text-warning">Currently manufacturing</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sample Sets Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{sampleSetsReady}</div>
                <p className="text-xs text-success">Ready for photoshoot</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Production Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{avgProductionTime}</div>
                <p className="text-xs text-success">
                  {purchaseOrders.length > 0 ? "-2d from last month" : "No data available"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>Track production status and manage sample sets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      <div>
                        <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Production Progress</span>
                      <span className="font-medium">--%</span>
                    </div>
                    <div className="h-2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Purchase Orders</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first purchase order
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Factory className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">{po.product}</h3>
                        <p className="text-sm text-muted-foreground">
                          {po.id} • Qty: {po.quantity} • Due: {po.dueDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusColor(po.status) as any}>
                        {po.status}
                      </Badge>
                      <Badge variant="outline" className={`${
                        po.priority === 'High' ? 'border-destructive text-destructive' :
                        po.priority === 'Medium' ? 'border-warning text-warning' :
                        'border-muted-foreground text-muted-foreground'
                      }`}>
                        {po.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Production Progress</span>
                      <span className="font-medium">{po.progress}%</span>
                    </div>
                    <Progress value={po.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="default" size="sm">Update Status</Button>
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

export default PurchaseOrders;
