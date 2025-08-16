import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

const RnD = () => {
  const suggestions = [
    {
      id: "PD-001",
      title: "Smart Fitness Tracker",
      marketplace: ["Amazon", "Flipkart"],
      status: "In Research",
      submittedBy: "Channel Director A",
      date: "2024-01-15",
      priority: "High"
    },
    {
      id: "PD-002", 
      title: "Wireless Earbuds Pro",
      marketplace: ["Myntra", "Amazon"],
      status: "Sample Ready",
      submittedBy: "Channel Director B",
      date: "2024-01-12",
      priority: "Medium"
    },
    {
      id: "PD-003",
      title: "Gaming Mechanical Keyboard",
      marketplace: ["Amazon"],
      status: "Sent for Approval",
      submittedBy: "Channel Director C", 
      date: "2024-01-10",
      priority: "Low"
    }
  ];

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

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Research & Development</h1>
          <p className="text-muted-foreground mt-1">
            Manage product suggestions, research, and sample development
          </p>
        </div>
        <Button variant="enterprise" className="gap-2">
          <Plus className="h-4 w-4" />
          New Product Suggestion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-xs text-success">+3 this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-warning">Active projects</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Samples Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-xs text-success">Ready for approval</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approval Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-info">Awaiting admin review</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Suggestions List */}
      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Product Suggestions</CardTitle>
          <CardDescription>Recent product suggestions and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(suggestion.status)}
                    <div>
                      <h3 className="font-medium text-foreground">{suggestion.title}</h3>
                      <p className="text-sm text-muted-foreground">ID: {suggestion.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {suggestion.marketplace.map((marketplace) => (
                      <Badge key={marketplace} variant="outline" className="text-xs">
                        {marketplace}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant={getStatusColor(suggestion.status) as any}>
                      {suggestion.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Priority: {suggestion.priority}
                    </p>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RnD;