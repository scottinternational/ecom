import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Image, FileText, Video } from "lucide-react";

const GraphicContent = () => {
  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Graphic & Content</h1>
          <p className="text-muted-foreground mt-1">
            Manage media creation, product photography, and marketing content
          </p>
        </div>
        <Button variant="enterprise">Assign Task</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">18</div>
            <p className="text-xs text-info">Across all teams</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Photoshoots Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-xs text-warning">Scheduled this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
            <p className="text-xs text-success">Ready for listing</p>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Turnaround
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3.2d</div>
            <p className="text-xs text-success">Improved by 0.8d</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-enterprise">
        <CardHeader>
          <CardTitle>Content Pipeline</CardTitle>
          <CardDescription>Track media creation and approval workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Palette className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Graphic & Content Module</h3>
            <p>Media management and workflow tracking system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphicContent;