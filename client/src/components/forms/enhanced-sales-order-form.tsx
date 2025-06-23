import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calculator } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency, generateOrderNumber } from "@/lib/utils";
import type { Customer, Product } from "@shared/schema";

const enhancedSalesOrderSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  orderDate: z.string().min(1, "Order date is required"),
  customerId: z.number().min(1, "Customer is required"),
  status: z.enum(["draft", "confirmed", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["unpaid", "partially_paid", "paid"]),
  paymentTerms: z.enum(["advance", "net_15", "net_30", "due_on_receipt"]),
  dueDate: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(z.object({
    productId: z.number().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().min(0, "Price must be non-negative"),
    taxPercent: z.number().min(0).max(100),
    discountPercent: z.number().min(0).max(100),
    batchNumber: z.string().optional(),
  })).min(1, "At least one item is required"),
});

type EnhancedSalesOrderFormData = z.infer<typeof enhancedSalesOrderSchema>;

interface EnhancedSalesOrderFormProps {
  customers: Customer[];
  products: Product[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function EnhancedSalesOrderForm({
  customers,
  products,
  onSubmit,
  isLoading = false,
}: EnhancedSalesOrderFormProps) {
  const form = useForm<EnhancedSalesOrderFormData>({
    resolver: zodResolver(enhancedSalesOrderSchema),
    defaultValues: {
      orderNumber: generateOrderNumber("SO"),
      orderDate: new Date().toISOString().split('T')[0],
      status: "draft",
      paymentStatus: "unpaid",
      paymentTerms: "net_30",
      items: [{ productId: 0, quantity: 1, price: 0, taxPercent: 0, discountPercent: 0, batchNumber: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  const calculateTotals = () => {
    const items = watchedItems || [];
    let subtotalAmount = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    items.forEach((item) => {
      const lineSubtotal = item.quantity * item.price;
      const lineDiscount = (lineSubtotal * item.discountPercent) / 100;
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const lineTax = (lineAfterDiscount * item.taxPercent) / 100;

      subtotalAmount += lineSubtotal;
      totalDiscount += lineDiscount;
      totalTax += lineTax;
    });

    const grandTotal = subtotalAmount - totalDiscount + totalTax;

    return {
      subtotalAmount,
      totalDiscount,
      totalTax,
      grandTotal,
    };
  };

  const totals = calculateTotals();

  const handleSubmit = (data: EnhancedSalesOrderFormData) => {
    const enhancedData = {
      ...data,
      ...totals,
      totalAmount: totals.grandTotal.toString(),
      grandTotal: totals.grandTotal.toString(),
    };
    onSubmit(enhancedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sales Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Order Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-gray-700 border-gray-600 text-white"
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Order Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
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
                    <FormLabel className="text-gray-300">Customer *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {customers.map((customer) => (
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
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
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="partially_paid">Partially Paid</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Payment Terms</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="advance">Advance</SelectItem>
                        <SelectItem value="net_15">Net 15</SelectItem>
                        <SelectItem value="net_30">Net 30</SelectItem>
                        <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Payment Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Additional notes or comments"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Product Line Items */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Add Items</CardTitle>
            <Button
              type="button"
              onClick={() => append({ productId: 0, quantity: 1, price: 0, taxPercent: 0, discountPercent: 0, batchNumber: "" })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Product</TableHead>
                    <TableHead className="text-gray-300">Quantity</TableHead>
                    <TableHead className="text-gray-300">Price/Rate</TableHead>
                    <TableHead className="text-gray-300">Tax %</TableHead>
                    <TableHead className="text-gray-300">Discount %</TableHead>
                    <TableHead className="text-gray-300">Batch No.</TableHead>
                    <TableHead className="text-gray-300">Line Total</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = watchedItems[index] || field;
                    const lineSubtotal = item.quantity * item.price;
                    const lineDiscount = (lineSubtotal * item.discountPercent) / 100;
                    const lineAfterDiscount = lineSubtotal - lineDiscount;
                    const lineTax = (lineAfterDiscount * item.taxPercent) / 100;
                    const lineTotal = lineAfterDiscount + lineTax;

                    return (
                      <TableRow key={field.id} className="border-gray-700">
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(parseInt(value));
                                  // Auto-populate price when product is selected
                                  const selectedProduct = products.find(p => p.id === parseInt(value));
                                  if (selectedProduct) {
                                    form.setValue(`items.${index}.price`, parseFloat(selectedProduct.sellingPrice));
                                  }
                                }} 
                                value={field.value?.toString()}
                              >
                                <SelectTrigger className="bg-gray-700 border-gray-600 text-white min-w-40">
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 border-gray-600">
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name} - {product.sku}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                min="1"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white w-20"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.price`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white w-24"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.taxPercent`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white w-20"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.discountPercent`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white w-20"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.batchNumber`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white w-24"
                                placeholder="Optional"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatCurrency(lineTotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-400 hover:text-red-300"
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totals.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(totals.totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(totals.totalTax)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-gray-600 pt-2">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Creating..." : "Create Sales Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}