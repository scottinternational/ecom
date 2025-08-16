import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, Package, Clock, CheckCircle, Upload } from "lucide-react";

const Production = () => {
  const purchaseOrders = [
    {
      id: "PO-001",
      product: "Smart Fitness Tracker",
      quantity: 500,
      status: "Sample Set Ready",
      progress: 75,
      dueDate: "2024-02-15",
      priority: "High"
    },
    {
      id: "PO-002",
      product: "Wireless Earbuds Pro", 
      quantity: 300,
      status: "In Production",
      progress: 45,
      dueDate: "2024-02-20",
      priority: "Medium"
    },
    {
      id: "PO-003",
      product: "Gaming Keyboard",
      quantity: 200,
      status: "Awaiting Approval",
      progress: 25,
      dueDate: "2024-02-25", 
      priority: "Low"
    }
  ];

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

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Production</h1>
          <p className="text-muted-foreground mt-1">
            Track production status, manage samples, and coordinate with teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Update
          </Button>
          <Button variant="enterprise">Update Status</Button>
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
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-info">3 new this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-warning">Currently manufacturing</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sample Sets Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-success">Ready for photoshoot</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Production Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">18d</div>
            <p className="text-xs text-success">-2d from last month</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;