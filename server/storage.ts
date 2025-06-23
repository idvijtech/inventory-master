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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private suppliers: Map<number, Supplier> = new Map();
  private customers: Map<number, Customer> = new Map();
  private warehouses: Map<number, Warehouse> = new Map();
  private products: Map<number, Product> = new Map();
  private productWarehouseStock: Map<number, ProductWarehouseStock> = new Map();
  private inventoryTransactions: Map<number, InventoryTransaction> = new Map();
  private purchaseOrders: Map<number, PurchaseOrder> = new Map();
  private purchaseOrderItems: Map<number, PurchaseOrderItem> = new Map();
  private salesOrders: Map<number, SalesOrder> = new Map();
  private salesOrderItems: Map<number, SalesOrderItem> = new Map();
  private returns: Map<number, Return> = new Map();
  private returnItems: Map<number, ReturnItem> = new Map();
  private payments: Map<number, Payment> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private auditLogs: Map<number, AuditLog> = new Map();
  private orderTemplates: Map<number, OrderTemplate> = new Map();
  private cycleCounts: Map<number, CycleCount> = new Map();
  private cycleCountItems: Map<number, CycleCountItem> = new Map();

  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentSupplierId = 1;
  private currentCustomerId = 1;
  private currentWarehouseId = 1;
  private currentProductId = 1;
  private currentProductWarehouseStockId = 1;
  private currentInventoryTransactionId = 1;
  private currentPurchaseOrderId = 1;
  private currentPurchaseOrderItemId = 1;
  private currentSalesOrderId = 1;
  private currentSalesOrderItemId = 1;
  private currentReturnId = 1;
  private currentReturnItemId = 1;
  private currentPaymentId = 1;
  private currentNotificationId = 1;
  private currentAuditLogId = 1;
  private currentOrderTemplateId = 1;
  private currentCycleCountId = 1;
  private currentCycleCountItemId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      password: "admin123", // In real app, this would be hashed
      name: "John Admin",
      role: "admin",
      isActive: true
    };
    this.users.set(adminUser.id, adminUser);

    // Seed categories
    const categories = [
      { name: "Electronics", description: "Electronic devices and components" },
      { name: "Accessories", description: "Device accessories and peripherals" },
      { name: "Computers", description: "Desktop and laptop computers" },
      { name: "Mobile", description: "Mobile phones and tablets" }
    ];

    categories.forEach(cat => {
      const category: Category = { id: this.currentCategoryId++, ...cat };
      this.categories.set(category.id, category);
    });

    // Seed suppliers
    const suppliers = [
      {
        name: "Tech Supplies Co.",
        contactPerson: "John Smith",
        email: "john@techsupplies.com",
        phone: "+1-555-0123",
        address: "123 Tech Street, Silicon Valley, CA",
        gst: "GST123456789",
        isActive: true
      }
    ];

    suppliers.forEach(sup => {
      const supplier: Supplier = { id: this.currentSupplierId++, ...sup };
      this.suppliers.set(supplier.id, supplier);
    });

    // Seed customers
    const customers = [
      {
        name: "ABC Electronics Store",
        email: "orders@abcelectronics.com",
        phone: "+1-555-0456",
        address: "456 Retail Ave, Commerce City, CA",
        gst: "GST987654321",
        isActive: true
      }
    ];

    customers.forEach(cust => {
      const customer: Customer = { id: this.currentCustomerId++, ...cust };
      this.customers.set(customer.id, customer);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = { 
      ...insertUser, 
      id: this.currentUserId++,
      role: insertUser.role || 'staff',
      isActive: insertUser.isActive ?? true
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = { 
      ...insertCategory, 
      id: this.currentCategoryId++,
      description: insertCategory.description ?? null
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Supplier methods
  async getAllSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const supplier: Supplier = { 
      ...insertSupplier, 
      id: this.currentSupplierId++,
      isActive: insertSupplier.isActive ?? true,
      contactPerson: insertSupplier.contactPerson ?? null,
      email: insertSupplier.email ?? null,
      phone: insertSupplier.phone ?? null,
      address: insertSupplier.address ?? null,
      gst: insertSupplier.gst ?? null
    };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  async updateSupplier(id: number, updateData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    const updatedSupplier = { ...supplier, ...updateData };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Customer methods
  async getAllCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = { 
      ...insertCustomer, 
      id: this.currentCustomerId++,
      isActive: insertCustomer.isActive ?? true,
      email: insertCustomer.email ?? null,
      phone: insertCustomer.phone ?? null,
      address: insertCustomer.address ?? null,
      gst: insertCustomer.gst ?? null
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: number, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    const updatedCustomer = { ...customer, ...updateData };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Warehouse methods
  async getAllWarehouses(): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values());
  }

  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    return this.warehouses.get(id);
  }

  async createWarehouse(insertWarehouse: InsertWarehouse): Promise<Warehouse> {
    const warehouse: Warehouse = { 
      ...insertWarehouse, 
      id: this.currentWarehouseId++,
      address: insertWarehouse.address ?? null,
      contactPerson: insertWarehouse.contactPerson ?? null,
      phone: insertWarehouse.phone ?? null,
      isActive: insertWarehouse.isActive ?? true
    };
    this.warehouses.set(warehouse.id, warehouse);
    return warehouse;
  }

  async updateWarehouse(id: number, updateData: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const warehouse = this.warehouses.get(id);
    if (!warehouse) return undefined;
    const updatedWarehouse = { ...warehouse, ...updateData };
    this.warehouses.set(id, updatedWarehouse);
    return updatedWarehouse;
  }

  async deleteWarehouse(id: number): Promise<boolean> {
    return this.warehouses.delete(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = { 
      ...insertProduct, 
      id: this.currentProductId++,
      brand: insertProduct.brand ?? null,
      isActive: insertProduct.isActive ?? true,
      barcode: insertProduct.barcode ?? null,
      categoryId: insertProduct.categoryId ?? null,
      unit: insertProduct.unit || 'pcs',
      taxPercent: insertProduct.taxPercent || '0',
      minStockLevel: insertProduct.minStockLevel ?? 0,
      currentStock: insertProduct.currentStock ?? 0,
      expiryDate: insertProduct.expiryDate ?? null,
      batchNumber: insertProduct.batchNumber ?? null,
      manufacturingDate: insertProduct.manufacturingDate ?? null,
      requiresBatchTracking: insertProduct.requiresBatchTracking ?? false
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { ...product, ...updateData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getLowStockProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.currentStock <= product.minStockLevel
    );
  }

  // Inventory Transaction methods
  async getAllInventoryTransactions(): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values());
  }

  async getInventoryTransactionsByProduct(productId: number): Promise<InventoryTransaction[]> {
    return Array.from(this.inventoryTransactions.values()).filter(
      transaction => transaction.productId === productId
    );
  }

  async createInventoryTransaction(insertTransaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const transaction: InventoryTransaction = {
      id: this.currentInventoryTransactionId++,
      productId: insertTransaction.productId,
      warehouseId: insertTransaction.warehouseId ?? null,
      type: insertTransaction.type,
      quantity: insertTransaction.quantity,
      batchNumber: insertTransaction.batchNumber ?? null,
      expiryDate: insertTransaction.expiryDate ?? null,
      reason: insertTransaction.reason ?? null,
      reference: insertTransaction.reference ?? null,
      transferToWarehouseId: insertTransaction.transferToWarehouseId ?? null,
      performedBy: insertTransaction.performedBy ?? null,
      createdAt: new Date()
    };
    this.inventoryTransactions.set(transaction.id, transaction);

    // Update product stock
    const product = this.products.get(transaction.productId);
    if (product) {
      let newStock = product.currentStock;
      if (transaction.type === 'in') {
        newStock += transaction.quantity;
      } else if (transaction.type === 'out') {
        newStock -= transaction.quantity;
      } else if (transaction.type === 'adjustment') {
        newStock = transaction.quantity;
      }
      product.currentStock = Math.max(0, newStock);
      this.products.set(product.id, product);
    }

    return transaction;
  }

  // Purchase Order methods
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return Array.from(this.purchaseOrders.values());
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const order: PurchaseOrder = {
      id: this.currentPurchaseOrderId++,
      orderNumber: insertOrder.orderNumber,
      supplierId: insertOrder.supplierId,
      warehouseId: insertOrder.warehouseId ?? null,
      status: insertOrder.status || 'draft',
      totalAmount: insertOrder.totalAmount,
      taxAmount: insertOrder.taxAmount ?? '0',
      paymentStatus: insertOrder.paymentStatus || 'pending',
      paymentDueDate: insertOrder.paymentDueDate ?? null,
      paymentMethod: insertOrder.paymentMethod ?? null,
      transactionId: insertOrder.transactionId ?? null,
      notes: insertOrder.notes ?? null,
      createdBy: insertOrder.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.purchaseOrders.set(order.id, order);
    return order;
  }

  async updatePurchaseOrder(id: number, updateData: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const order = this.purchaseOrders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...updateData };
    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getPurchaseOrderItems(orderId: number): Promise<PurchaseOrderItem[]> {
    return Array.from(this.purchaseOrderItems.values()).filter(
      item => item.purchaseOrderId === orderId
    );
  }

  async createPurchaseOrderItem(insertItem: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const item: PurchaseOrderItem = { ...insertItem, id: this.currentPurchaseOrderItemId++ };
    this.purchaseOrderItems.set(item.id, item);
    return item;
  }

  // Sales Order methods
  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return Array.from(this.salesOrders.values());
  }

  async getSalesOrder(id: number): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const order: SalesOrder = {
      id: this.currentSalesOrderId++,
      orderNumber: insertOrder.orderNumber,
      customerId: insertOrder.customerId ?? null,
      warehouseId: insertOrder.warehouseId ?? null,
      status: insertOrder.status || 'draft',
      totalAmount: insertOrder.totalAmount,
      taxAmount: insertOrder.taxAmount ?? '0',
      paymentStatus: insertOrder.paymentStatus || 'pending',
      paymentDueDate: insertOrder.paymentDueDate ?? null,
      paymentMethod: insertOrder.paymentMethod ?? null,
      transactionId: insertOrder.transactionId ?? null,
      invoiceGenerated: insertOrder.invoiceGenerated ?? false,
      invoiceUrl: insertOrder.invoiceUrl ?? null,
      notes: insertOrder.notes ?? null,
      createdBy: insertOrder.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.salesOrders.set(order.id, order);
    return order;
  }

  async updateSalesOrder(id: number, updateData: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const order = this.salesOrders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...updateData, updatedAt: new Date() };
    this.salesOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getSalesOrderItems(orderId: number): Promise<SalesOrderItem[]> {
    return Array.from(this.salesOrderItems.values()).filter(
      item => item.salesOrderId === orderId
    );
  }

  async createSalesOrderItem(insertItem: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const item: SalesOrderItem = { 
      id: this.currentSalesOrderItemId++,
      salesOrderId: insertItem.salesOrderId,
      productId: insertItem.productId,
      quantity: insertItem.quantity,
      unitPrice: insertItem.unitPrice,
      totalPrice: insertItem.totalPrice,
      batchNumber: insertItem.batchNumber ?? null
    };
    this.salesOrderItems.set(item.id, item);
    return item;
  }

  // Product Warehouse Stock methods
  async getProductWarehouseStock(productId: number, warehouseId?: number): Promise<ProductWarehouseStock[]> {
    const allStock = Array.from(this.productWarehouseStock.values());
    if (warehouseId) {
      return allStock.filter(stock => stock.productId === productId && stock.warehouseId === warehouseId);
    }
    return allStock.filter(stock => stock.productId === productId);
  }

  async updateProductWarehouseStock(stock: InsertProductWarehouseStock): Promise<ProductWarehouseStock> {
    const newStock: ProductWarehouseStock = {
      id: this.currentProductWarehouseStockId++,
      productId: stock.productId,
      warehouseId: stock.warehouseId,
      quantity: stock.quantity,
      batchNumber: stock.batchNumber ?? null,
      expiryDate: stock.expiryDate ?? null,
      lastUpdated: new Date()
    };
    this.productWarehouseStock.set(newStock.id, newStock);
    return newStock;
  }

  // Returns methods
  async getAllReturns(): Promise<Return[]> {
    return Array.from(this.returns.values());
  }

  async getReturn(id: number): Promise<Return | undefined> {
    return this.returns.get(id);
  }

  async createReturn(returnData: InsertReturn): Promise<Return> {
    const newReturn: Return = {
      id: this.currentReturnId++,
      returnNumber: returnData.returnNumber,
      originalOrderId: returnData.originalOrderId ?? null,
      customerId: returnData.customerId ?? null,
      warehouseId: returnData.warehouseId ?? null,
      type: returnData.type,
      status: returnData.status || 'pending',
      reason: returnData.reason,
      totalAmount: returnData.totalAmount,
      refundAmount: returnData.refundAmount ?? null,
      refundStatus: returnData.refundStatus ?? null,
      notes: returnData.notes ?? null,
      createdBy: returnData.createdBy ?? null,
      createdAt: new Date(),
      processedAt: null
    };
    this.returns.set(newReturn.id, newReturn);
    return newReturn;
  }

  async updateReturn(id: number, returnData: Partial<InsertReturn>): Promise<Return | undefined> {
    const existingReturn = this.returns.get(id);
    if (!existingReturn) return undefined;
    const updatedReturn = { ...existingReturn, ...returnData };
    this.returns.set(id, updatedReturn);
    return updatedReturn;
  }

  async getReturnItems(returnId: number): Promise<ReturnItem[]> {
    return Array.from(this.returnItems.values()).filter(
      item => item.returnId === returnId
    );
  }

  async createReturnItem(item: InsertReturnItem): Promise<ReturnItem> {
    const newItem: ReturnItem = {
      id: this.currentReturnItemId++,
      returnId: item.returnId,
      productId: item.productId,
      quantity: item.quantity,
      reason: item.reason ?? null,
      condition: item.condition ?? null,
      batchNumber: item.batchNumber ?? null,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    };
    this.returnItems.set(newItem.id, newItem);
    return newItem;
  }

  // Payment methods
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const newPayment: Payment = {
      id: this.currentPaymentId++,
      paymentNumber: payment.paymentNumber,
      orderId: payment.orderId ?? null,
      orderType: payment.orderType ?? null,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId ?? null,
      status: payment.status || 'pending',
      paymentDate: payment.paymentDate ?? new Date(),
      dueDate: payment.dueDate ?? null,
      notes: payment.notes ?? null,
      createdBy: payment.createdBy ?? null,
      createdAt: new Date()
    };
    this.payments.set(newPayment.id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    const updatedPayment = { ...existingPayment, ...payment };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getPaymentsByOrder(orderId: number, orderType: 'purchase' | 'sales'): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.orderId === orderId && payment.orderType === orderType
    );
  }

  // Notification methods
  async getAllNotifications(userId?: number): Promise<Notification[]> {
    const allNotifications = Array.from(this.notifications.values());
    if (userId) {
      return allNotifications.filter(n => n.userId === userId);
    }
    return allNotifications;
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      n => n.userId === userId && !n.isRead
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const newNotification: Notification = {
      id: this.currentNotificationId++,
      userId: notification.userId ?? null,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead ?? false,
      actionUrl: notification.actionUrl ?? null,
      metadata: notification.metadata ?? null,
      createdAt: new Date(),
      readAt: null
    };
    this.notifications.set(newNotification.id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    notification.isRead = true;
    notification.readAt = new Date();
    this.notifications.set(id, notification);
    return true;
  }

  async updateNotification(id: number, updates: Partial<InsertNotification>): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updated = { ...notification, ...updates };
    if (updates.isRead && !notification.isRead) {
      updated.readAt = new Date();
    }
    
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values()).filter(
      n => n.userId === userId && !n.isRead
    );
    userNotifications.forEach(n => {
      n.isRead = true;
      n.readAt = new Date();
      this.notifications.set(n.id, n);
    });
    return true;
  }

  // Audit Log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: this.currentAuditLogId++,
      userId: log.userId ?? null,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      oldValues: log.oldValues ?? null,
      newValues: log.newValues ?? null,
      changedFields: log.changedFields ?? null,
      ipAddress: log.ipAddress ?? null,
      userAgent: log.userAgent ?? null,
      createdAt: new Date()
    };
    this.auditLogs.set(newLog.id, newLog);
    return newLog;
  }

  async getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]> {
    const allLogs = Array.from(this.auditLogs.values());
    if (entityType && entityId) {
      return allLogs.filter(log => log.entityType === entityType && log.entityId === entityId);
    }
    if (entityType) {
      return allLogs.filter(log => log.entityType === entityType);
    }
    return allLogs;
  }

  // Order Template methods
  async getAllOrderTemplates(type?: 'purchase' | 'sales'): Promise<OrderTemplate[]> {
    const allTemplates = Array.from(this.orderTemplates.values());
    if (type) {
      return allTemplates.filter(template => template.type === type);
    }
    return allTemplates;
  }

  async getOrderTemplate(id: number): Promise<OrderTemplate | undefined> {
    return this.orderTemplates.get(id);
  }

  async createOrderTemplate(template: InsertOrderTemplate): Promise<OrderTemplate> {
    const newTemplate: OrderTemplate = {
      id: this.currentOrderTemplateId++,
      name: template.name,
      description: template.description ?? null,
      type: template.type,
      supplierId: template.supplierId ?? null,
      customerId: template.customerId ?? null,
      warehouseId: template.warehouseId ?? null,
      templateData: template.templateData,
      isActive: template.isActive ?? true,
      createdBy: template.createdBy ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orderTemplates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async updateOrderTemplate(id: number, template: Partial<InsertOrderTemplate>): Promise<OrderTemplate | undefined> {
    const existingTemplate = this.orderTemplates.get(id);
    if (!existingTemplate) return undefined;
    const updatedTemplate = { ...existingTemplate, ...template, updatedAt: new Date() };
    this.orderTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteOrderTemplate(id: number): Promise<boolean> {
    return this.orderTemplates.delete(id);
  }

  // Cycle Count methods
  async getAllCycleCounts(): Promise<CycleCount[]> {
    return Array.from(this.cycleCounts.values());
  }

  async getCycleCount(id: number): Promise<CycleCount | undefined> {
    return this.cycleCounts.get(id);
  }

  async createCycleCount(cycleCount: InsertCycleCount): Promise<CycleCount> {
    const newCycleCount: CycleCount = {
      id: this.currentCycleCountId++,
      countNumber: cycleCount.countNumber,
      warehouseId: cycleCount.warehouseId,
      status: cycleCount.status || 'planned',
      scheduledDate: cycleCount.scheduledDate,
      completedDate: cycleCount.completedDate ?? null,
      totalItems: cycleCount.totalItems ?? 0,
      countedItems: cycleCount.countedItems ?? 0,
      discrepancies: cycleCount.discrepancies ?? 0,
      notes: cycleCount.notes ?? null,
      createdBy: cycleCount.createdBy ?? null,
      createdAt: new Date()
    };
    this.cycleCounts.set(newCycleCount.id, newCycleCount);
    return newCycleCount;
  }

  async updateCycleCount(id: number, cycleCount: Partial<InsertCycleCount>): Promise<CycleCount | undefined> {
    const existing = this.cycleCounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...cycleCount };
    this.cycleCounts.set(id, updated);
    return updated;
  }

  async getCycleCountItems(cycleCountId: number): Promise<CycleCountItem[]> {
    return Array.from(this.cycleCountItems.values()).filter(
      item => item.cycleCountId === cycleCountId
    );
  }

  async createCycleCountItem(item: InsertCycleCountItem): Promise<CycleCountItem> {
    const newItem: CycleCountItem = {
      id: this.currentCycleCountItemId++,
      cycleCountId: item.cycleCountId,
      productId: item.productId,
      batchNumber: item.batchNumber ?? null,
      expectedQuantity: item.expectedQuantity,
      countedQuantity: item.countedQuantity ?? null,
      discrepancy: item.discrepancy ?? 0,
      notes: item.notes ?? null,
      countedBy: item.countedBy ?? null,
      countedAt: null
    };
    this.cycleCountItems.set(newItem.id, newItem);
    return newItem;
  }

  async updateCycleCountItem(id: number, item: Partial<InsertCycleCountItem>): Promise<CycleCountItem | undefined> {
    const existing = this.cycleCountItems.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    if (item.countedQuantity !== undefined) {
      updated.countedAt = new Date();
      updated.discrepancy = updated.countedQuantity - updated.expectedQuantity;
    }
    this.cycleCountItems.set(id, updated);
    return updated;
  }

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
    const totalProducts = this.products.size;
    const lowStockItems = Array.from(this.products.values()).filter(
      p => p.currentStock <= p.minStockLevel
    ).length;

    // Calculate today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = Array.from(this.salesOrders.values()).filter(
      order => order.createdAt >= today && order.status === 'fulfilled'
    );
    const todaySales = todayOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    const totalWarehouses = this.warehouses.size;
    const pendingReturns = Array.from(this.returns.values()).filter(r => r.status === 'pending').length;
    const overduePayments = Array.from(this.payments.values()).filter(p => 
      p.status === 'pending' && p.dueDate && new Date(p.dueDate) < new Date()
    ).length;
    const unreadNotifications = Array.from(this.notifications.values()).filter(n => !n.isRead).length;

    return {
      totalProducts,
      lowStockItems,
      todaySales,
      expiringSoon: 0, // Will be calculated based on product expiry dates
      totalWarehouses,
      pendingReturns,
      overduePayments,
      unreadNotifications
    };
  }

  // Advanced Analytics - Top Selling Products
  async getTopSellingProducts(limit = 10, dateRange?: { from: Date; to: Date }): Promise<Array<{
    product: Product;
    totalSold: number;
    revenue: number;
  }>> {
    const salesData = new Map<number, { totalSold: number; revenue: number }>();
    
    Array.from(this.salesOrderItems.values()).forEach(item => {
      const current = salesData.get(item.productId) || { totalSold: 0, revenue: 0 };
      salesData.set(item.productId, {
        totalSold: current.totalSold + item.quantity,
        revenue: current.revenue + parseFloat(item.totalPrice)
      });
    });

    const results = Array.from(salesData.entries())
      .map(([productId, data]) => ({
        product: this.products.get(productId)!,
        ...data
      }))
      .filter(item => item.product)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);

    return results;
  }

  // Slow Moving Inventory
  async getSlowMovingInventory(daysThreshold = 30): Promise<Product[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
    
    const recentSales = new Set(
      Array.from(this.salesOrderItems.values())
        .filter(item => {
          const order = this.salesOrders.get(item.salesOrderId);
          return order && order.createdAt >= cutoffDate;
        })
        .map(item => item.productId)
    );

    return Array.from(this.products.values()).filter(
      product => !recentSales.has(product.id) && product.currentStock > 0
    );
  }

  // Customer Analytics
  async getCustomerAnalytics(): Promise<Array<{
    customer: Customer;
    totalOrders: number;
    totalValue: number;
    lastOrderDate: Date | null;
  }>> {
    const customerData = new Map<number, { totalOrders: number; totalValue: number; lastOrderDate: Date | null }>();

    Array.from(this.salesOrders.values()).forEach(order => {
      if (!order.customerId) return;
      
      const current = customerData.get(order.customerId) || { totalOrders: 0, totalValue: 0, lastOrderDate: null };
      customerData.set(order.customerId, {
        totalOrders: current.totalOrders + 1,
        totalValue: current.totalValue + parseFloat(order.totalAmount),
        lastOrderDate: !current.lastOrderDate || order.createdAt > current.lastOrderDate 
          ? order.createdAt 
          : current.lastOrderDate
      });
    });

    return Array.from(customerData.entries())
      .map(([customerId, data]) => ({
        customer: this.customers.get(customerId)!,
        ...data
      }))
      .filter(item => item.customer)
      .sort((a, b) => b.totalValue - a.totalValue);
  }

  // Supplier Performance
  async getSupplierPerformance(): Promise<Array<{
    supplier: Supplier;
    totalOrders: number;
    totalValue: number;
    averageDeliveryTime: number | null;
  }>> {
    const supplierData = new Map<number, { totalOrders: number; totalValue: number }>();

    Array.from(this.purchaseOrders.values()).forEach(order => {
      const current = supplierData.get(order.supplierId) || { totalOrders: 0, totalValue: 0 };
      supplierData.set(order.supplierId, {
        totalOrders: current.totalOrders + 1,
        totalValue: current.totalValue + parseFloat(order.totalAmount)
      });
    });

    return Array.from(supplierData.entries())
      .map(([supplierId, data]) => ({
        supplier: this.suppliers.get(supplierId)!,
        ...data,
        averageDeliveryTime: null // Placeholder for delivery time calculation
      }))
      .filter(item => item.supplier)
      .sort((a, b) => b.totalValue - a.totalValue);
  }

  // Profit & Loss Report
  async getProfitLossReport(dateRange: { from: Date; to: Date }): Promise<{
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    netProfit: number;
  }> {
    const salesInRange = Array.from(this.salesOrders.values()).filter(
      order => order.createdAt >= dateRange.from && order.createdAt <= dateRange.to
    );
    
    const purchasesInRange = Array.from(this.purchaseOrders.values()).filter(
      order => order.createdAt >= dateRange.from && order.createdAt <= dateRange.to
    );

    const totalRevenue = salesInRange.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const totalCost = purchasesInRange.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit; // Simplified - no operating expenses calculated

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      netProfit
    };
  }
}

export const storage = new MemStorage();
