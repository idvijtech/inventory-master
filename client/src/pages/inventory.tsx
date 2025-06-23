import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, ArrowUpCircle, ArrowDownCircle, Settings } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventoryTransactionSchema, type InventoryTransaction, type Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import type { z } from "zod";

type InventoryTransactionFormData = z.infer<typeof insertInventoryTransactionSchema>;

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/inventory-transactions"],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: InventoryTransactionFormData) => {
      const response = await apiRequest("POST", "/api/inventory-transactions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Inventory transaction recorded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to record transaction", variant: "destructive" });
    },
  });

  const form = useForm<InventoryTransactionFormData>({
    resolver: zodResolver(insertInventoryTransactionSchema),
    defaultValues: {
      productId: undefined,
      type: "in",
      quantity: 0,
      reason: "",
      reference: "",
      performedBy: 1, // Default to admin user
    },
  });

  const onSubmit = (data: InventoryTransactionFormData) => {
    createTransactionMutation.mutate(data);
  };

  const filteredTransactions = transactions.filter((transaction: InventoryTransaction) => {
    const product = products.find((p: Product) => p.id === transaction.productId);
    return product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
           transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowUpCircle className="w-5 h-5 text-green-400" />;
      case 'out':
        return <ArrowDownCircle className="w-5 h-5 text-red-400" />;
      case 'adjustment':
        return <Settings className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'in':
        return 'Stock In';
      case 'out':
        return 'Stock Out';
      case 'adjustment':
        return 'Adjustment';
      default:
        return type;
    }
  };

  return (
    <MainLayout title="Inventory Control" subtitle="Track stock movements and adjustments">
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Inventory Transactions</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Record Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Record Inventory Transaction</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-gray-700 border-gray-600">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-700 border-gray-600">
                                {products.map((product: Product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.name} ({product.sku})
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
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transaction Type</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-700 border-gray-600">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                  <SelectItem value="in">Stock In</SelectItem>
                                  <SelectItem value="out">Stock Out</SelectItem>
                                  <SelectItem value="adjustment">Adjustment</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  className="bg-gray-700 border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="PO number, invoice, etc." className="bg-gray-700 border-gray-600" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Reason for this transaction..." className="bg-gray-700 border-gray-600" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                          Record Transaction
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
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading transactions...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Product</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Quantity</TableHead>
                    <TableHead className="text-gray-300">Reference</TableHead>
                    <TableHead className="text-gray-300">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction: InventoryTransaction) => {
                      const product = products.find((p: Product) => p.id === transaction.productId);
                      return (
                        <TableRow key={transaction.id} className="border-gray-700">
                          <TableCell className="text-gray-300">{formatDateTime(transaction.createdAt)}</TableCell>
                          <TableCell className="text-white">
                            <div>
                              <p className="font-medium">{product?.name}</p>
                              <p className="text-sm text-gray-400">{product?.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getTransactionIcon(transaction.type)}
                              <span className="text-white">{getTransactionTypeLabel(transaction.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-white font-medium">{transaction.quantity}</TableCell>
                          <TableCell className="text-gray-300">{transaction.reference || "—"}</TableCell>
                          <TableCell className="text-gray-300">{transaction.reason || "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
