import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, DollarSign, BarChart3 } from "lucide-react";

const AdsMarketing = () => {
  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ads & Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Manage advertising campaigns, track ROI, and optimize marketing spend
          </p>
        </div>
        <Button variant="enterprise">Create Campaign</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-xs text-info">Across all platforms</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Ad Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">₹2.4L</div>
            <p className="text-xs text-warning">85% of budget used</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average ROAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4.2x</div>
            <p className="text-xs text-success">Above target of 3.5x</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.8%</div>
            <p className="text-xs text-success">+0.5% vs last month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Marketing Dashboard</CardTitle>
          <CardDescription>Campaign performance and optimization insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Ads & Marketing Module</h3>
            <p>Advanced campaign management and performance analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsMarketing;