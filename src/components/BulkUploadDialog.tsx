import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function BulkUploadDialog() {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addNotification } = useNotifications();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          addNotification({
            title: "Bulk Upload Complete",
            message: `Successfully uploaded ${file.name} with 25 products`,
            type: "success",
          });
          setOpen(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    // Create a comprehensive CSV template with all required fields
    const csvContent = `Channel_Sku,Channel_Names,SKU,Class,Color,Size,Product_Name,Product_Category,Listing_Url,Product_Image_URL
AMZ-SFT-001,"Amazon,Flipkart",SFT-001,Electronics,Black,Medium,Smart Fitness Tracker,Wearables,https://amazon.in/product/sft-001,https://example.com/images/sft-001.jpg
FK-WEP-002,"Flipkart,Myntra",WEP-002,Audio,White,One Size,Wireless Earbuds Pro,Electronics,https://flipkart.com/product/wep-002,https://example.com/images/wep-002.jpg
MYN-GMK-003,"Myntra,Ajio",GMK-003,Gaming,RGB,Full Size,Gaming Mechanical Keyboard,Accessories,https://myntra.com/product/gmk-003,https://example.com/images/gmk-003.jpg
JIO-SWX-004,"Jiomart,Meesho",SWX-004,Wearables,Silver,42mm,Smart Watch Series X,Wearables,https://jiomart.com/product/swx-004,https://example.com/images/swx-004.jpg`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    addNotification({
      title: "Template Downloaded",
      message: "Product upload template has been downloaded successfully",
      type: "success",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
          <DialogDescription>
            Upload multiple products at once using a CSV file with all required fields
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Download Template</p>
                <p className="text-sm text-muted-foreground">
                  Get the CSV template with all product fields
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-2">Required Fields:</p>
            <ul className="space-y-1">
              <li>• <strong>Channel_Sku:</strong> Unique SKU for each channel</li>
              <li>• <strong>Channel_Names:</strong> Comma-separated (Amazon,Flipkart,etc.)</li>
              <li>• <strong>SKU:</strong> Master SKU mapped to Channel_Sku</li>
              <li>• <strong>Class, Color, Size:</strong> Product specifications</li>
              <li>• <strong>Product_Name:</strong> Display name</li>
              <li>• <strong>Product_Category:</strong> Category classification</li>
              <li>• <strong>Listing_Url:</strong> Product page URL</li>
              <li>• <strong>Product_Image_URL:</strong> Image URL (will be displayed)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading products...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Supported formats: CSV, Excel (.xlsx, .xls)</p>
            <p>Maximum file size: 10MB</p>
            <p>Channel Names: Amazon, Flipkart, Myntra, Ajio, Jiomart, Meesho</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}