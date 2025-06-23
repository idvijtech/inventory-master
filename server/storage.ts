import {
  users, categories, suppliers, customers, warehouses, products, productWarehouseStock, inventoryTransactions,
  purchaseOrders, purchaseOrderItems, salesOrders, salesOrderItems, returns, returnItems,
  payments, notifications, auditLogs, orderTemplates, cycleCounts, cycleCountItems,
  type User, type InsertUser, type Category, type InsertCategory,
  type Supplier, type InsertSupplier, type Customer, type InsertCustomer,
  type Warehouse, type InsertWarehouse, type Product, type InsertProduct,
  type ProductWarehouseStock, type InsertProductWarehouseStock,
  type InventoryTransaction, type InsertInventoryTransaction,
  type PurchaseOrder, type InsertPurchaseOrder, type PurchaseOrderItem, type InsertPurchaseOrderItem,
  type SalesOrder, type InsertSalesOrder, type SalesOrderItem, type InsertSalesOrderItem,
  type Return, type InsertReturn, type ReturnItem, type InsertReturnItem,
  type Payment, type InsertPayment, type Notification, type InsertNotification,
  type AuditLog, type InsertAuditLog, type OrderTemplate, type InsertOrderTemplate,
  type CycleCount, type InsertCycleCount, type CycleCountItem, type InsertCycleCountItem
} from "@shared/schema";
import { db } from './db';
import { eq, lte } from 'drizzle-orm';
import { count, sum } from 'drizzle-orm/sql';

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Warehouses
  getAllWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: number): Promise<boolean>;

  // Suppliers
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Products
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getLowStockProducts(): Promise<Product[]>;

  // Inventory Transactions
  getAllInventoryTransactions(): Promise<InventoryTransaction[]>;
  getInventoryTransactionsByProduct(productId: number): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;

  // Purchase Orders
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;

  // Sales Orders
  getAllSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: number): Promise<SalesOrder | undefined>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: number, order: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined>;
  getSalesOrderItems(orderId: number): Promise<SalesOrderItem[]>;
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;

  // Product Warehouse Stock
  getProductWarehouseStock(productId: number, warehouseId?: number): Promise<ProductWarehouseStock[]>;
  updateProductWarehouseStock(stock: InsertProductWarehouseStock): Promise<ProductWarehouseStock>;

  // Returns
  getAllReturns(): Promise<Return[]>;
  getReturn(id: number): Promise<Return | undefined>;
  createReturn(returnData: InsertReturn): Promise<Return>;
  updateReturn(id: number, returnData: Partial<InsertReturn>): Promise<Return | undefined>;
  getReturnItems(returnId: number): Promise<ReturnItem[]>;
  createReturnItem(item: InsertReturnItem): Promise<ReturnItem>;

  // Payments
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  getPaymentsByOrder(orderId: number, orderType: 'purchase' | 'sales'): Promise<Payment[]>;

  // Notifications
  getAllNotifications(userId?: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, updates: Partial<InsertNotification>): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]>;

  // Order Templates
  getAllOrderTemplates(type?: 'purchase' | 'sales'): Promise<OrderTemplate[]>;
  getOrderTemplate(id: number): Promise<OrderTemplate | undefined>;
  createOrderTemplate(template: InsertOrderTemplate): Promise<OrderTemplate>;
  updateOrderTemplate(id: number, template: Partial<InsertOrderTemplate>): Promise<OrderTemplate | undefined>;
  deleteOrderTemplate(id: number): Promise<boolean>;

  // Cycle Counts
  getAllCycleCounts(): Promise<CycleCount[]>;
  getCycleCount(id: number): Promise<CycleCount | undefined>;
  createCycleCount(cycleCount: InsertCycleCount): Promise<CycleCount>;
  updateCycleCount(id: number, cycleCount: Partial<InsertCycleCount>): Promise<CycleCount | undefined>;
  getCycleCountItems(cycleCountId: number): Promise<CycleCountItem[]>;
  createCycleCountItem(item: InsertCycleCountItem): Promise<CycleCountItem>;
  updateCycleCountItem(id: number, item: Partial<InsertCycleCountItem>): Promise<CycleCountItem | undefined>;

  // Enhanced Dashboard Stats
  getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    todaySales: number;
    expiringSoon: number;
    totalWarehouses: number;
    pendingReturns: number;
    overduePayments: number;
    unreadNotifications: number;
  }>;

  // Advanced Analytics
  getTopSellingProducts(limit?: number, dateRange?: { from: Date; to: Date }): Promise<Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>>;
  
  getSlowMovingInventory(daysThreshold?: number): Promise<Product[]>;
  
  getCustomerAnalytics(): Promise<Array<{
    customer: Customer;
    totalOrders: number;
    totalValue: number;
    lastOrderDate: Date | null;
  }>>;
  
  getSupplierPerformance(): Promise<Array<{
    supplier: Supplier;
    totalOrders: number;
    totalValue: number;
    averageDeliveryTime: number | null;
  }>>;

  // Reporting
  getProfitLossReport(dateRange: { from: Date; to: Date }): Promise<{
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    netProfit: number;
  }>;
}

export class PgStorage implements IStorage {
  // Users
  async getUser(id: number) {
    const result = await db.query.users.findFirst({ where: (u) => eq(u.id, id) });
    return result ?? undefined;
  }
  async getUserByUsername(username: string) {
    const result = await db.query.users.findFirst({ where: (u) => eq(u.username, username) });
    return result ?? undefined;
  }
  async createUser(user: InsertUser) {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  async updateUser(id: number, user: Partial<InsertUser>) {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated ?? undefined;
  }
  async getAllUsers() {
    return db.select().from(users);
  }

  // Categories
  async getAllCategories() {
    return db.select().from(categories);
  }
  async createCategory(category: InsertCategory) {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }
  async updateCategory(id: number, category: Partial<InsertCategory>) {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated ?? undefined;
  }
  async deleteCategory(id: number) {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Warehouses
  async getAllWarehouses(): Promise<Warehouse[]> { throw new Error('Not implemented'); }
  async getWarehouse(id: number): Promise<Warehouse | undefined> { throw new Error('Not implemented'); }
  async createWarehouse(warehouse: InsertWarehouse): Promise<Warehouse> { throw new Error('Not implemented'); }
  async updateWarehouse(id: number, warehouse: Partial<InsertWarehouse>): Promise<Warehouse | undefined> { throw new Error('Not implemented'); }
  async deleteWarehouse(id: number): Promise<boolean> { throw new Error('Not implemented'); }

  // Suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers);
  }
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const result = await db.query.suppliers.findFirst({ where: (s) => eq(s.id, id) });
    return result ?? undefined;
  }
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updated ?? undefined;
  }
  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers);
  }
  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await db.query.customers.findFirst({ where: (c) => eq(c.id, id) });
    return result ?? undefined;
  }
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updated ?? undefined;
  }
  async deleteCustomer(id: number): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Products
  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products);
  }
  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.query.products.findFirst({ where: (p) => eq(p.id, id) });
    return result ?? undefined;
  }
  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updated ?? undefined;
  }
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getLowStockProducts(): Promise<Product[]> {
    return db.select().from(products).where(lte(products.currentStock, products.minStockLevel));
  }

  // Inventory Transactions
  async getAllInventoryTransactions(): Promise<InventoryTransaction[]> {
    return db.select().from(inventoryTransactions);
  }
  async getInventoryTransactionsByProduct(productId: number): Promise<InventoryTransaction[]> {
    return db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId));
  }
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [created] = await db.insert(inventoryTransactions).values(transaction).returning();
    return created;
  }

  // Purchase Orders
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return db.select().from(purchaseOrders);
  }
  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> { throw new Error('Not implemented'); }
  async createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder> { throw new Error('Not implemented'); }
  async updatePurchaseOrder(id: number, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> { throw new Error('Not implemented'); }
  async getPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]> { throw new Error('Not implemented'); }
  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> { throw new Error('Not implemented'); }

  // Sales Orders
  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return db.select().from(salesOrders);
  }
  async getSalesOrder(id: number): Promise<SalesOrder | undefined> { throw new Error('Not implemented'); }
  async createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder> { throw new Error('Not implemented'); }
  async updateSalesOrder(id: number, order: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> { throw new Error('Not implemented'); }
  async getSalesOrderItems(orderId: number): Promise<SalesOrderItem[]> { throw new Error('Not implemented'); }
  async createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem> { throw new Error('Not implemented'); }

  // Product Warehouse Stock
  async getProductWarehouseStock(productId: number, warehouseId?: number): Promise<ProductWarehouseStock[]> { throw new Error('Not implemented'); }
  async updateProductWarehouseStock(stock: InsertProductWarehouseStock): Promise<ProductWarehouseStock> { throw new Error('Not implemented'); }

  // Returns
  async getAllReturns(): Promise<Return[]> {
    return db.select().from(returns);
  }
  async getReturn(id: number): Promise<Return | undefined> { throw new Error('Not implemented'); }
  async createReturn(returnData: InsertReturn): Promise<Return> { throw new Error('Not implemented'); }
  async updateReturn(id: number, returnData: Partial<InsertReturn>): Promise<Return | undefined> { throw new Error('Not implemented'); }
  async getReturnItems(returnId: number): Promise<ReturnItem[]> { throw new Error('Not implemented'); }
  async createReturnItem(item: InsertReturnItem): Promise<ReturnItem> { throw new Error('Not implemented'); }

  // Payments
  async getAllPayments(): Promise<Payment[]> {
    return db.select().from(payments);
  }
  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.query.payments.findFirst({ where: (p) => eq(p.id, id) });
    return result ?? undefined;
  }
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }
  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set(payment).where(eq(payments.id, id)).returning();
    return updated ?? undefined;
  }
  async getPaymentsByOrder(orderId: number, orderType: 'purchase' | 'sales'): Promise<Payment[]> { throw new Error('Not implemented'); }

  // Notifications
  async getAllNotifications(userId?: number): Promise<Notification[]> {
    // If userId is provided, filter by userId if your schema supports it, else return all
    return db.select().from(notifications);
  }
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    // If your schema supports userId, filter by userId and isRead = false
    return db.select().from(notifications).where(eq(notifications.isRead, false));
  }
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }
  async updateNotification(id: number, updates: Partial<InsertNotification>): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications).set(updates).where(eq(notifications.id, id)).returning();
    return updated ?? undefined;
  }
  async markNotificationAsRead(id: number): Promise<boolean> {
    const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
    return !!updated;
  }
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    // If your schema supports userId, filter by userId
    const result = await db.update(notifications).set({ isRead: true });
    return (result.rowCount ?? 0) > 0;
  }

  // Audit Logs
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> { throw new Error('Not implemented'); }
  async getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]> { throw new Error('Not implemented'); }

  // Order Templates
  async getAllOrderTemplates(type?: 'purchase' | 'sales'): Promise<OrderTemplate[]> { throw new Error('Not implemented'); }
  async getOrderTemplate(id: number): Promise<OrderTemplate | undefined> { throw new Error('Not implemented'); }
  async createOrderTemplate(template: InsertOrderTemplate): Promise<OrderTemplate> { throw new Error('Not implemented'); }
  async updateOrderTemplate(id: number, template: Partial<InsertOrderTemplate>): Promise<OrderTemplate | undefined> { throw new Error('Not implemented'); }
  async deleteOrderTemplate(id: number): Promise<boolean> { throw new Error('Not implemented'); }

  // Cycle Counts
  async getAllCycleCounts(): Promise<CycleCount[]> { throw new Error('Not implemented'); }
  async getCycleCount(id: number): Promise<CycleCount | undefined> { throw new Error('Not implemented'); }
  async createCycleCount(cycleCount: InsertCycleCount): Promise<CycleCount> { throw new Error('Not implemented'); }
  async updateCycleCount(id: number, cycleCount: Partial<InsertCycleCount>): Promise<CycleCount | undefined> { throw new Error('Not implemented'); }
  async getCycleCountItems(cycleCountId: number): Promise<CycleCountItem[]> { throw new Error('Not implemented'); }
  async createCycleCountItem(item: InsertCycleCountItem): Promise<CycleCountItem> { throw new Error('Not implemented'); }
  async updateCycleCountItem(id: number, item: Partial<InsertCycleCountItem>): Promise<CycleCountItem | undefined> { throw new Error('Not implemented'); }

  // Enhanced Dashboard Stats
  async getDashboardStats(): Promise<{
    totalProducts: number;
    lowStockItems: number;
    todaySales: number;
    expiringSoon: number;
    totalWarehouses: number;
    pendingReturns: number;
    overduePayments: number;
    unreadNotifications: number;
  }> {
    const [totalProducts] = await db.select({ count: count() }).from(products);
    const [lowStockItems] = await db.select({ count: count() }).from(products).where(lte(products.currentStock, products.minStockLevel));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const [todaySales] = await db.select({ sum: sum(salesOrders.totalAmount) }).from(salesOrders).where(eq(salesOrders.orderDate, todayStr));
    const [totalWarehouses] = await db.select({ count: count() }).from(warehouses);
    const [pendingReturns] = await db.select({ count: count() }).from(returns).where(eq(returns.status, 'pending'));
    const [overduePayments] = await db.select({ count: count() }).from(payments).where(lte(payments.dueDate, todayStr));
    // unreadNotifications: not implemented, set to 0
    return {
      totalProducts: Number(totalProducts?.count ?? 0),
      lowStockItems: Number(lowStockItems?.count ?? 0),
      todaySales: Number(todaySales?.sum ?? 0),
      expiringSoon: 0, // Not implemented
      totalWarehouses: Number(totalWarehouses?.count ?? 0),
      pendingReturns: Number(pendingReturns?.count ?? 0),
      overduePayments: Number(overduePayments?.count ?? 0),
      unreadNotifications: 0,
    };
  }

  // Advanced Analytics
  async getTopSellingProducts(limit?: number, dateRange?: { from: Date; to: Date }): Promise<Array<{ product: Product; totalSold: number; revenue: number; }>> { throw new Error('Not implemented'); }
  async getSlowMovingInventory(daysThreshold?: number): Promise<Product[]> { throw new Error('Not implemented'); }
  async getCustomerAnalytics(): Promise<Array<{ customer: Customer; totalOrders: number; totalValue: number; lastOrderDate: Date | null; }>> { throw new Error('Not implemented'); }
  async getSupplierPerformance(): Promise<Array<{ supplier: Supplier; totalOrders: number; totalValue: number; averageDeliveryTime: number | null; }>> { throw new Error('Not implemented'); }
  async getProfitLossReport(dateRange: { from: Date; to: Date }): Promise<{ totalRevenue: number; totalCost: number; grossProfit: number; netProfit: number; }> { throw new Error('Not implemented'); }
}

export const storage = new PgStorage();
