import { pgTable, text, serial, integer, boolean, decimal, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "manager", "staff"] }).notNull().default("staff"),
  isActive: boolean("is_active").notNull().default(true),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  gst: text("gst"),
  isActive: boolean("is_active").notNull().default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  gst: text("gst"),
  isActive: boolean("is_active").notNull().default(true),
});

// Warehouses/Locations
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode"),
  categoryId: integer("category_id").references(() => categories.id),
  brand: text("brand"),
  unit: text("unit").notNull().default("pcs"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull(),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  currentStock: integer("current_stock").notNull().default(0),
  expiryDate: date("expiry_date"),
  batchNumber: text("batch_number"),
  manufacturingDate: date("manufacturing_date"),
  requiresBatchTracking: boolean("requires_batch_tracking").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
});

// Product Stock by Warehouse
export const productWarehouseStock = pgTable("product_warehouse_stock", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  quantity: integer("quantity").notNull().default(0),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  type: text("type", { enum: ["in", "out", "adjustment", "transfer"] }).notNull(),
  quantity: integer("quantity").notNull(),
  batchNumber: text("batch_number"),
  expiryDate: date("expiry_date"),
  reason: text("reason"),
  reference: text("reference"),
  transferToWarehouseId: integer("transfer_to_warehouse_id").references(() => warehouses.id),
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  orderDate: date("order_date").notNull().defaultNow(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  referenceNumber: text("reference_number"), // Vendor-provided reference/quotation no
  deliveryDate: date("delivery_date"), // Expected delivery date
  deliveryLocation: text("delivery_location"), // Where items are to be received
  paymentTerms: text("payment_terms", { enum: ["advance", "net_15", "net_30", "due_on_receipt"] }).notNull().default("net_30"),
  status: text("status", { enum: ["draft", "pending", "approved", "fulfilled", "cancelled"] }).notNull().default("draft"),
  // Financial totals
  totalBeforeTax: decimal("total_before_tax", { precision: 10, scale: 2 }).notNull().default("0"),
  totalTax: decimal("total_tax", { precision: 10, scale: 2 }).notNull().default("0"),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }).notNull().default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull().default("0"),
  // Legacy field for compatibility
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "overdue", "cancelled"] }).notNull().default("pending"),
  paymentDueDate: date("payment_due_date"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  remarks: text("remarks"), // General notes/comments
  notes: text("notes"),
  attachment: text("attachment"), // File path/URL for attachments
  approvedBy: integer("approved_by").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(), // Price per unit
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("0"), // GST/VAT %
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"), // Optional per item discount
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(), // (Qty × Price) - Discount + Tax
  // Legacy fields for compatibility
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  orderDate: date("order_date").notNull().defaultNow(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  status: text("status", { enum: ["draft", "confirmed", "shipped", "delivered", "cancelled"] }).notNull().default("draft"),
  paymentStatus: text("payment_status", { enum: ["unpaid", "partially_paid", "paid"] }).notNull().default("unpaid"),
  paymentTerms: text("payment_terms", { enum: ["advance", "net_15", "net_30", "due_on_receipt"] }).notNull().default("net_30"),
  dueDate: date("due_date"), // Payment due date
  // Financial totals
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalTax: decimal("total_tax", { precision: 10, scale: 2 }).notNull().default("0"),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }).notNull().default("0"),
  grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  amountDue: decimal("amount_due", { precision: 10, scale: 2 }).notNull().default("0"),
  // Legacy fields for compatibility
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentDueDate: date("payment_due_date"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  invoiceGenerated: boolean("invoice_generated").notNull().default(false),
  invoiceUrl: text("invoice_url"),
  notes: text("notes"),
  remarks: text("remarks"), // Additional comments
  attachment: text("attachment"), // File path/URL for attachments
  approvedBy: integer("approved_by").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const salesOrderItems = pgTable("sales_order_items", {
  id: serial("id").primaryKey(),
  salesOrderId: integer("sales_order_id").references(() => salesOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price per unit (rate)
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }).notNull().default("0"), // Tax %
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"), // Optional per item discount
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(), // (Qty × Price) - Discount + Tax
  batchNumber: text("batch_number"), // For batch tracking
  // Legacy fields for compatibility
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Returns Management
export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  returnNumber: text("return_number").notNull().unique(),
  originalOrderId: integer("original_order_id").references(() => salesOrders.id),
  customerId: integer("customer_id").references(() => customers.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  type: text("type", { enum: ["customer_return", "supplier_return", "internal_adjustment"] }).notNull(),
  status: text("status", { enum: ["pending", "approved", "processed", "rejected"] }).notNull().default("pending"),
  reason: text("reason").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundStatus: text("refund_status", { enum: ["pending", "processed", "failed"] }),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const returnItems = pgTable("return_items", {
  id: serial("id").primaryKey(),
  returnId: integer("return_id").references(() => returns.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  condition: text("condition", { enum: ["good", "damaged", "defective", "expired"] }),
  batchNumber: text("batch_number"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

// Payment Management
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentNumber: text("payment_number").notNull().unique(),
  orderId: integer("order_id"), // Can reference either purchase or sales orders
  orderType: text("order_type", { enum: ["purchase", "sales"] }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "bank_transfer", "check", "online"] }).notNull(),
  transactionId: text("transaction_id"),
  status: text("status", { enum: ["pending", "completed", "failed", "cancelled"] }).notNull().default("pending"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  dueDate: date("due_date"),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications System
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type", { enum: ["info", "warning", "error", "success", "low_stock", "expiry_alert", "order_update", "payment_due"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  actionUrl: text("action_url"),
  metadata: jsonb("metadata"), // For storing additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  entityType: text("entity_type").notNull(), // e.g., 'product', 'order', 'inventory'
  entityId: integer("entity_id").notNull(),
  action: text("action", { enum: ["create", "update", "delete", "view"] }).notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  changedFields: text("changed_fields").array(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Templates
export const orderTemplates = pgTable("order_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type", { enum: ["purchase", "sales"] }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  customerId: integer("customer_id").references(() => customers.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  templateData: jsonb("template_data").notNull(), // Stores template items and configuration
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cycle Counting
export const cycleCounts = pgTable("cycle_counts", {
  id: serial("id").primaryKey(),
  countNumber: text("count_number").notNull().unique(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  status: text("status", { enum: ["planned", "in_progress", "completed", "cancelled"] }).notNull().default("planned"),
  scheduledDate: date("scheduled_date").notNull(),
  completedDate: date("completed_date"),
  totalItems: integer("total_items").notNull().default(0),
  countedItems: integer("counted_items").notNull().default(0),
  discrepancies: integer("discrepancies").notNull().default(0),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cycleCountItems = pgTable("cycle_count_items", {
  id: serial("id").primaryKey(),
  cycleCountId: integer("cycle_count_id").references(() => cycleCounts.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  batchNumber: text("batch_number"),
  expectedQuantity: integer("expected_quantity").notNull(),
  countedQuantity: integer("counted_quantity"),
  discrepancy: integer("discrepancy").notNull().default(0),
  notes: text("notes"),
  countedBy: integer("counted_by").references(() => users.id),
  countedAt: timestamp("counted_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProductWarehouseStockSchema = createInsertSchema(productWarehouseStock).omit({ id: true, lastUpdated: true });
export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({ id: true, createdAt: true });
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true });
export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({ id: true });
export const insertReturnSchema = createInsertSchema(returns).omit({ id: true, createdAt: true, processedAt: true });
export const insertReturnItemSchema = createInsertSchema(returnItems).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, readAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export const insertOrderTemplateSchema = createInsertSchema(orderTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCycleCountSchema = createInsertSchema(cycleCounts).omit({ id: true, createdAt: true });
export const insertCycleCountItemSchema = createInsertSchema(cycleCountItems).omit({ id: true, countedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductWarehouseStock = typeof productWarehouseStock.$inferSelect;
export type InsertProductWarehouseStock = z.infer<typeof insertProductWarehouseStockSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;
export type Return = typeof returns.$inferSelect;
export type InsertReturn = z.infer<typeof insertReturnSchema>;
export type ReturnItem = typeof returnItems.$inferSelect;
export type InsertReturnItem = z.infer<typeof insertReturnItemSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type OrderTemplate = typeof orderTemplates.$inferSelect;
export type InsertOrderTemplate = z.infer<typeof insertOrderTemplateSchema>;
export type CycleCount = typeof cycleCounts.$inferSelect;
export type InsertCycleCount = z.infer<typeof insertCycleCountSchema>;
export type CycleCountItem = typeof cycleCountItems.$inferSelect;
export type InsertCycleCountItem = z.infer<typeof insertCycleCountItemSchema>;
