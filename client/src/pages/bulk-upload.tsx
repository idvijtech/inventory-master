import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, FileText, Package, ShoppingCart } from "lucide-react";

interface UploadResult {
  success: boolean;
  message: string;
  data?: {
    processed: number;
    errors: Array<{
      row: number;
      field: string;
      message: string;
    }>;
    duplicates: Array<{
      row: number;
      sku: string;
      message: string;
    }>;
  };
}

export default function BulkUpload() {
  const [uploadType, setUploadType] = useState<'products' | 'purchase-orders' | 'inventory'>('products');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await fetch(`/api/bulk-upload/${uploadType}`, {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return await response.json();
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: [`/api/${uploadType}`] });
      if (uploadType === 'products') {
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      }
      toast({
        title: "Upload Complete",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      setUploadResult({
        success: false,
        message: error.message || "Upload failed"
      });
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV or Excel file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', uploadType);
    
    uploadMutation.mutate(formData);
  };

  const downloadTemplate = async (type: string) => {
    try {
      const response = await fetch(`/api/bulk-upload/template/${type}`);
      if (!response.ok) throw new Error('Failed to download template');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Template Downloaded",
        description: `${type} template has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template",
        variant: "destructive",
      });
    }
  };

  const getUploadTypeIcon = (type: string) => {
    switch (type) {
      case 'products': return <Package className="h-5 w-5" />;
      case 'purchase-orders': return <ShoppingCart className="h-5 w-5" />;
      case 'inventory': return <FileSpreadsheet className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getUploadTypeDescription = (type: string) => {
    switch (type) {
      case 'products': 
        return 'Upload product catalog with SKU, name, category, pricing, and stock information';
      case 'purchase-orders': 
        return 'Upload purchase orders with supplier information and line items';
      case 'inventory': 
        return 'Upload stock levels, locations, and inventory adjustments';
      default: 
        return 'Select upload type for more information';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Data Upload</h1>
          <p className="text-muted-foreground">
            Import products, orders, and inventory data from CSV or Excel files
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>File Upload</span>
              </CardTitle>
              <CardDescription>
                Select the type of data you want to upload and choose your file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Type Selection */}
              <div className="space-y-3">
                <Label>Upload Type</Label>
                <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select upload type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="products">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Products</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="purchase-orders">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Purchase Orders</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="inventory">
                      <div className="flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>Inventory Adjustments</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getUploadTypeDescription(uploadType)}
                </p>
              </div>

              {/* Template Download */}
              <div className="space-y-3">
                <Label>Download Template</Label>
                <Button 
                  variant="outline" 
                  onClick={() => downloadTemplate(uploadType)}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download {uploadType.replace('-', ' ')} Template
                </Button>
                <p className="text-xs text-muted-foreground">
                  Download the CSV template with the correct column headers and sample data
                </p>
              </div>

              {/* File Selection */}
              <div className="space-y-3">
                <Label>Select File</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <FileSpreadsheet className="h-3 w-3" />
                      <span>{selectedFile.name}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      />
                    </Badge>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <Label>Upload Progress</Label>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Uploading and processing your file... {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upload Guidelines */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getUploadTypeIcon(uploadType)}
                <span>Upload Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={uploadType} className="w-full">
                <TabsContent value="products" className="mt-0">
                  <div className="space-y-3">
                    <h4 className="font-medium">Required Columns:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• SKU (unique identifier)</li>
                      <li>• Name</li>
                      <li>• Category</li>
                      <li>• Price</li>
                      <li>• Current Stock</li>
                    </ul>
                    <h4 className="font-medium">Optional Columns:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Description</li>
                      <li>• Min Stock Level</li>
                      <li>• Max Stock Level</li>
                      <li>• Unit</li>
                      <li>• Weight</li>
                      <li>• Dimensions</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="purchase-orders" className="mt-0">
                  <div className="space-y-3">
                    <h4 className="font-medium">Required Columns:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Order Number</li>
                      <li>• Supplier Name</li>
                      <li>• Order Date</li>
                      <li>• Product SKU</li>
                      <li>• Quantity</li>
                      <li>• Unit Price</li>
                    </ul>
                    <h4 className="font-medium">Optional Columns:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Delivery Date</li>
                      <li>• Payment Terms</li>
                      <li>• Tax Percentage</li>
                      <li>• Discount</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="inventory" className="mt-0">
                  <div className="space-y-3">
                    <h4 className="font-medium">Required Columns:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Product SKU</li>
                      <li>• Warehouse Code</li>
                      <li>• Adjustment Type</li>
                      <li>• Quantity</li>
                      <li>• Reason</li>
                    </ul>
                    <h4 className="font-medium">Adjustment Types:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• IN (Stock increase)</li>
                      <li>• OUT (Stock decrease)</li>
                      <li>• ADJUSTMENT (Correction)</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notes</AlertTitle>
                <AlertDescription className="text-xs">
                  • File size limit: 10MB
                  • Maximum 1000 rows per upload
                  • Duplicate SKUs will be highlighted
                  • Invalid data will be reported
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <AlertDescription>
                {uploadResult.message}
              </AlertDescription>
            </Alert>

            {uploadResult.data && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResult.data.processed}
                    </div>
                    <div className="text-sm text-green-600">Processed Successfully</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResult.data.errors.length}
                    </div>
                    <div className="text-sm text-red-600">Validation Errors</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {uploadResult.data.duplicates.length}
                    </div>
                    <div className="text-sm text-yellow-600">Duplicate Records</div>
                  </div>
                </div>

                {(uploadResult.data.errors.length > 0 || uploadResult.data.duplicates.length > 0) && (
                  <Tabs defaultValue="errors" className="w-full">
                    <TabsList>
                      <TabsTrigger value="errors">Validation Errors</TabsTrigger>
                      <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="errors">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Field</TableHead>
                            <TableHead>Error Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.data.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.row}</TableCell>
                              <TableCell>{error.field}</TableCell>
                              <TableCell>{error.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    <TabsContent value="duplicates">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Message</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.data.duplicates.map((duplicate, index) => (
                            <TableRow key={index}>
                              <TableCell>{duplicate.row}</TableCell>
                              <TableCell>{duplicate.sku}</TableCell>
                              <TableCell>{duplicate.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}