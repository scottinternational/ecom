import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, AlertTriangle, TrendingDown } from "lucide-react";

const ProductReview = () => {
  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Review & QA</h1>
          <p className="text-muted-foreground mt-1">
            Monitor customer feedback, manage reviews, and track quality metrics
          </p>
        </div>
        <Button variant="enterprise">Review Analysis</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4.2</div>
            <p className="text-xs text-success flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              +0.3 this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Negative Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-warning">7 need attention</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">89%</div>
            <p className="text-xs text-success">Within 24 hours</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Return Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">2.1%</div>
            <p className="text-xs text-success">-0.4% vs target</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Quality Monitoring</CardTitle>
          <CardDescription>Customer feedback analysis and quality improvements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Product Review & QA Module</h3>
            <p>Comprehensive review management and quality assurance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReview;