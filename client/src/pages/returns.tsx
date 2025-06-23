import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReturnSchema } from "@shared/schema";
import type { Return, Customer, SalesOrder, Product, ReturnItem } from "@shared/schema";
import { formatCurrency, formatDate, generateOrderNumber } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, FileText, Package, RefreshCw } from "lucide-react";
import { z } from "zod";

type ReturnFormData = z.infer<typeof insertReturnSchema>;

export default function Returns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ReturnFormData>({
    resolver: zodResolver(insertReturnSchema),
    defaultValues: {
      returnNumber: generateOrderNumber('RET'),
      type: 'customer_return',
      status: 'pending',
      totalAmount: '0',
    },
  });

  const { data: returns, isLoading: returnsLoading } = useQuery({
    queryKey: ['/api/returns'],
  });

  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
  });

  const { data: salesOrders } = useQuery({
    queryKey: ['/api/sales-orders'],
  });

  const { data: products } = useQuery({
    queryKey: ['/api/products'],
  });

  const createReturnMutation = useMutation({
    mutationFn: async (data: ReturnFormData) => {
      return apiRequest('/api/returns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Return created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create return",
        variant: "destructive",
      });
    },
  });

  const updateReturnStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/returns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/returns'] });
      toast({
        title: "Success",
        description: "Return status updated successfully",
      });
    },
  });

  const onSubmit = (data: ReturnFormData) => {
    createReturnMutation.mutate(data);
  };

  const filteredReturns = returns?.filter((returnItem: Return) => {
    const matchesSearch = returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         returnItem.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    return matchesSearch && returnItem.status === selectedTab;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Returns & Adjustments</h1>
          <p className="text-muted-foreground">
            Manage product returns, exchanges, and inventory adjustments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Return
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Return</DialogTitle>
              <DialogDescription>
                Create a new return for customer returns, supplier returns, or internal adjustments
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="returnNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Number</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select return type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="customer_return">Customer Return</SelectItem>
                            <SelectItem value="supplier_return">Supplier Return</SelectItem>
                            <SelectItem value="internal_adjustment">Internal Adjustment</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers?.map((customer: Customer) => (
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
                  <FormField
                    control={form.control}
                    name="originalOrderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Order</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select original order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {salesOrders?.map((order: SalesOrder) => (
                              <SelectItem key={order.id} value={order.id.toString()}>
                                {order.orderNumber} - {formatCurrency(order.totalAmount)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Return Reason</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe the reason for return..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="refundAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refund Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createReturnMutation.isPending}>
                    {createReturnMutation.isPending ? "Creating..." : "Create Return"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Returns Overview</CardTitle>
              <CardDescription>
                Track and manage all return requests and adjustments
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search returns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Returns</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab} className="mt-4">
              {returnsLoading ? (
                <div className="text-center py-8">Loading returns...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return #</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((returnItem: Return) => {
                      const customer = customers?.find((c: Customer) => c.id === returnItem.customerId);
                      return (
                        <TableRow key={returnItem.id}>
                          <TableCell className="font-medium">{returnItem.returnNumber}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {returnItem.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer?.name || 'N/A'}</TableCell>
                          <TableCell className="max-w-48 truncate">{returnItem.reason}</TableCell>
                          <TableCell>{formatCurrency(returnItem.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(returnItem.status)}>
                              {returnItem.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(returnItem.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4" />
                              </Button>
                              {returnItem.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateReturnStatusMutation.mutate({
                                    id: returnItem.id, 
                                    status: 'approved'
                                  })}
                                >
                                  Approve
                                </Button>
                              )}
                              {returnItem.status === 'approved' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => updateReturnStatusMutation.mutate({
                                    id: returnItem.id, 
                                    status: 'processed'
                                  })}
                                >
                                  Process
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}