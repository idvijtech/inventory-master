import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Printer, TrendingUp, Package, DollarSign, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, PurchaseOrder, SalesOrder } from "@shared/schema";

export default function Reports() {
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: salesOrders = [] } = useQuery({
    queryKey: ["/api/sales-orders"],
  });

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ["/api/products/low-stock"],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const totalInventoryValue = products.reduce((sum: number, product: Product) => {
    return sum + (product.currentStock * parseFloat(product.purchasePrice));
  }, 0);

  const totalSalesValue = salesOrders
    .filter((order: SalesOrder) => order.status === 'completed')
    .reduce((sum: number, order: SalesOrder) => sum + parseFloat(order.totalAmount), 0);

  const totalPurchaseValue = purchaseOrders
    .filter((order: PurchaseOrder) => order.status === 'received')
    .reduce((sum: number, order: PurchaseOrder) => sum + parseFloat(order.totalAmount), 0);

  const reportCards = [
    {
      title: "Total Inventory Value",
      value: formatCurrency(totalInventoryValue),
      icon: Package,
      color: "text-blue-400"
    },
    {
      title: "Total Sales Value",
      value: formatCurrency(totalSalesValue),
      icon: TrendingUp,
      color: "text-green-400"
    },
    {
      title: "Total Purchase Value",
      value: formatCurrency(totalPurchaseValue),
      icon: DollarSign,
      color: "text-purple-400"
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: "text-orange-400"
    }
  ];

  return (
    <MainLayout title="Reports & Analytics" subtitle="Comprehensive business insights">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                      <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${card.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Inventory Report
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Sales Report
            </TabsTrigger>
            <TabsTrigger value="purchase" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Purchase Report
            </TabsTrigger>
            <TabsTrigger value="low-stock" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Low Stock Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Inventory Valuation Report
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Product Name</TableHead>
                      <TableHead className="text-gray-300">SKU</TableHead>
                      <TableHead className="text-gray-300">Current Stock</TableHead>
                      <TableHead className="text-gray-300">Unit Price</TableHead>
                      <TableHead className="text-gray-300">Total Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: Product) => (
                      <TableRow key={product.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-300">{product.sku}</TableCell>
                        <TableCell className="text-white">{product.currentStock}</TableCell>
                        <TableCell className="text-green-400">{formatCurrency(product.purchasePrice)}</TableCell>
                        <TableCell className="text-green-400">
                          {formatCurrency(product.currentStock * parseFloat(product.purchasePrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Sales Report
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Order Number</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesOrders.map((order: SalesOrder) => (
                      <TableRow key={order.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="text-gray-300">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={order.status === 'completed' ? 'bg-green-600' : 'bg-orange-600'}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-400">{formatCurrency(order.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchase" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Purchase Report
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Order Number</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((order: PurchaseOrder) => (
                      <TableRow key={order.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="text-gray-300">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={order.status === 'received' ? 'bg-green-600' : 'bg-orange-600'}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-400">{formatCurrency(order.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Low Stock Report
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No low stock items found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Product Name</TableHead>
                        <TableHead className="text-gray-300">SKU</TableHead>
                        <TableHead className="text-gray-300">Current Stock</TableHead>
                        <TableHead className="text-gray-300">Min Stock Level</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((product: Product) => (
                        <TableRow key={product.id} className="border-gray-700">
                          <TableCell className="text-white font-medium">{product.name}</TableCell>
                          <TableCell className="text-gray-300">{product.sku}</TableCell>
                          <TableCell className="text-white">{product.currentStock}</TableCell>
                          <TableCell className="text-gray-300">{product.minStockLevel}</TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={product.currentStock === 0 ? 'bg-red-600' : 'bg-orange-600'}
                            >
                              {product.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
