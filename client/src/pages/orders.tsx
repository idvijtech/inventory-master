import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Eye, ShoppingCart, Truck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseOrderSchema, insertSalesOrderSchema, type PurchaseOrder, type SalesOrder, type Supplier, type Customer } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDateTime, generateOrderNumber } from "@/lib/utils";
import type { z } from "zod";

type PurchaseOrderFormData = z.infer<typeof insertPurchaseOrderSchema>;
type SalesOrderFormData = z.infer<typeof insertSalesOrderSchema>;

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isSalesDialogOpen, setIsSalesDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: purchaseOrders = [], isLoading: isPurchaseLoading } = useQuery({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: salesOrders = [], isLoading: isSalesLoading } = useQuery({
    queryKey: ["/api/sales-orders"],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      const response = await apiRequest("POST", "/api/purchase-orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      setIsPurchaseDialogOpen(false);
      toast({ title: "Purchase order created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create purchase order", variant: "destructive" });
    },
  });

  const createSalesOrderMutation = useMutation({
    mutationFn: async (data: SalesOrderFormData) => {
      const response = await apiRequest("POST", "/api/sales-orders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-orders"] });
      setIsSalesDialogOpen(false);
      toast({ title: "Sales order created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create sales order", variant: "destructive" });
    },
  });

  const purchaseForm = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(insertPurchaseOrderSchema),
    defaultValues: {
      orderNumber: "",
      supplierId: undefined,
      status: "draft",
      totalAmount: "0",
      createdBy: 1, // Default to admin user
    },
  });

  const salesForm = useForm<SalesOrderFormData>({
    resolver: zodResolver(insertSalesOrderSchema),
    defaultValues: {
      orderNumber: "",
      customerId: undefined,
      status: "draft",
      totalAmount: "0",
      createdBy: 1, // Default to admin user
    },
  });

  const onPurchaseSubmit = (data: PurchaseOrderFormData) => {
    createPurchaseOrderMutation.mutate(data);
  };

  const onSalesSubmit = (data: SalesOrderFormData) => {
    createSalesOrderMutation.mutate(data);
  };

  const openPurchaseDialog = () => {
    purchaseForm.reset({
      orderNumber: generateOrderNumber("PO"),
      supplierId: undefined,
      status: "draft",
      totalAmount: "0",
      createdBy: 1,
    });
    setIsPurchaseDialogOpen(true);
  };

  const openSalesDialog = () => {
    salesForm.reset({
      orderNumber: generateOrderNumber("SO"),
      customerId: undefined,
      status: "draft",
      totalAmount: "0",
      createdBy: 1,
    });
    setIsSalesDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: "bg-gray-600",
      pending: "bg-orange-600",
      received: "bg-green-600",
      completed: "bg-green-600",
      cancelled: "bg-red-600",
    };
    
    return (
      <Badge variant="secondary" className={statusColors[status] || "bg-gray-600"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredPurchaseOrders = purchaseOrders.filter((order: PurchaseOrder) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalesOrders = salesOrders.filter((order: SalesOrder) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Orders" subtitle="Manage purchase and sales orders">
      <div className="space-y-6">
        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="purchase" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Purchase Orders
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Sales Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Purchase Orders
                  </CardTitle>
                  <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openPurchaseDialog} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Purchase Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Create Purchase Order</DialogTitle>
                      </DialogHeader>
                      <Form {...purchaseForm}>
                        <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-4">
                          <FormField
                            control={purchaseForm.control}
                            name="orderNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order Number</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-700 border-gray-600" readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={purchaseForm.control}
                            name="supplierId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Supplier</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-700 border-gray-600">
                                      <SelectValue placeholder="Select supplier" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-700 border-gray-600">
                                    {suppliers.map((supplier: Supplier) => (
                                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                        {supplier.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={purchaseForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="draft">Draft</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="received">Received</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={purchaseForm.control}
                              name="totalAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Amount</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} className="bg-gray-700 border-gray-600" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              Create Order
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search purchase orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {isPurchaseLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading purchase orders...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Order Number</TableHead>
                        <TableHead className="text-gray-300">Supplier</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Total Amount</TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchaseOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                            No purchase orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPurchaseOrders.map((order: PurchaseOrder) => {
                          const supplier = suppliers.find((s: Supplier) => s.id === order.supplierId);
                          return (
                            <TableRow key={order.id} className="border-gray-700">
                              <TableCell className="text-white font-medium">{order.orderNumber}</TableCell>
                              <TableCell className="text-gray-300">{supplier?.name || "—"}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-green-400">{formatCurrency(order.totalAmount)}</TableCell>
                              <TableCell className="text-gray-300">{formatDateTime(order.createdAt)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Sales Orders
                  </CardTitle>
                  <Dialog open={isSalesDialogOpen} onOpenChange={setIsSalesDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openSalesDialog} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Sales Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white">
                      <DialogHeader>
                        <DialogTitle>Create Sales Order</DialogTitle>
                      </DialogHeader>
                      <Form {...salesForm}>
                        <form onSubmit={salesForm.handleSubmit(onSalesSubmit)} className="space-y-4">
                          <FormField
                            control={salesForm.control}
                            name="orderNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Order Number</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-gray-700 border-gray-600" readOnly />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={salesForm.control}
                            name="customerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="bg-gray-700 border-gray-600">
                                      <SelectValue placeholder="Select customer" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-700 border-gray-600">
                                    {customers.map((customer: Customer) => (
                                      <SelectItem key={customer.id} value={customer.id.toString()}>
                                        {customer.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={salesForm.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-700 border-gray-600">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="draft">Draft</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={salesForm.control}
                              name="totalAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Total Amount</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} className="bg-gray-700 border-gray-600" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsSalesDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                              Create Order
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search sales orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {isSalesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading sales orders...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Order Number</TableHead>
                        <TableHead className="text-gray-300">Customer</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Total Amount</TableHead>
                        <TableHead className="text-gray-300">Created</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalesOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                            No sales orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSalesOrders.map((order: SalesOrder) => {
                          const customer = customers.find((c: Customer) => c.id === order.customerId);
                          return (
                            <TableRow key={order.id} className="border-gray-700">
                              <TableCell className="text-white font-medium">{order.orderNumber}</TableCell>
                              <TableCell className="text-gray-300">{customer?.name || "Walk-in Customer"}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-green-400">{formatCurrency(order.totalAmount)}</TableCell>
                              <TableCell className="text-gray-300">{formatDateTime(order.createdAt)}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
