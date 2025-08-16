import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Database, Globe, Users, Zap } from "lucide-react";

const Settings = () => {
  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system settings, marketplace integrations, and platform preferences
          </p>
        </div>
        <Button variant="enterprise">Save Changes</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Marketplace Settings
            </CardTitle>
            <CardDescription>Configure marketplace integrations and API settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Amazon</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Flipkart</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Myntra</span>
                <Badge variant="warning">Pending</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Manage Integrations
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User & Permissions
            </CardTitle>
            <CardDescription>Manage user roles and access permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin Users</span>
                <Badge variant="info">5 active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Members</span>
                <Badge variant="info">43 active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Role Templates</span>
                <Badge variant="secondary">12 defined</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Configure Roles
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data & Backup
            </CardTitle>
            <CardDescription>Database settings and backup configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Backup</span>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Backup</span>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage Used</span>
                <span className="text-xs text-muted-foreground">2.4 GB</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Backup Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alerts and notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Alerts</span>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS Notifications</span>
                <Badge variant="warning">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push Notifications</span>
                <Badge variant="success">Enabled</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Notification Settings
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-enterprise md:col-span-2">
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Platform-wide settings and configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <SettingsIcon className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Settings Module</h3>
              <p>Comprehensive system configuration and management tools</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;