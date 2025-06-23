import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { processBulkProducts, processBulkPurchaseOrders, processBulkInventory, generateTemplate } from "./bulk-upload";
import {
  insertUserSchema, insertCategorySchema, insertSupplierSchema, insertCustomerSchema,
  insertProductSchema, insertInventoryTransactionSchema, insertPurchaseOrderSchema,
  insertSalesOrderSchema, insertPurchaseOrderItemSchema, insertSalesOrderItemSchema,
  insertWarehouseSchema, insertReturnSchema, insertPaymentSchema, insertNotificationSchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, supplierData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSupplier(id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Inventory Transaction routes
  app.get("/api/inventory-transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });

  app.post("/api/inventory-transactions", async (req, res) => {
    try {
      const transactionData = insertInventoryTransactionSchema.parse(req.body);
      const transaction = await storage.createInventoryTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  // Purchase Order routes
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const orders = await storage.getAllPurchaseOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      console.log("Received purchase order data:", req.body);
      
      // Extract and transform the enhanced form data
      const { items = [], ...orderFields } = req.body;
      
      // Create base order data that matches the schema
      const baseOrderData = {
        orderNumber: orderFields.orderNumber,
        orderDate: orderFields.orderDate || new Date().toISOString().split('T')[0],
        supplierId: orderFields.supplierId,
        referenceNumber: orderFields.referenceNumber || null,
        deliveryDate: orderFields.deliveryDate || null,
        deliveryLocation: orderFields.deliveryLocation || null,
        paymentTerms: orderFields.paymentTerms || "net_30",
        status: orderFields.status || "draft",
        remarks: orderFields.remarks || null,
        totalAmount: orderFields.totalAmount || orderFields.grandTotal || "0.00",
        taxAmount: orderFields.totalTax?.toString() || "0.00",
        discountAmount: orderFields.totalDiscount?.toString() || "0.00",
        subtotalAmount: orderFields.totalBeforeTax?.toString() || "0.00",
        warehouseId: null,
        paymentStatus: "pending"
      };
      
      console.log("Transformed order data:", baseOrderData);
      
      const orderData = insertPurchaseOrderSchema.parse(baseOrderData);
      const order = await storage.createPurchaseOrder(orderData);
      
      // Create order items if provided
      if (items && items.length > 0) {
        for (const item of items) {
          const itemData = {
            purchaseOrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice?.toString() || "0.00",
            taxPercent: item.taxPercent?.toString() || "0.00",
            discountPercent: item.discountPercent?.toString() || "0.00",
            unitPrice: item.purchasePrice?.toString() || "0.00",
            totalPrice: ((item.quantity || 0) * (item.purchasePrice || 0)).toString(),
            subtotal: ((item.quantity || 0) * (item.purchasePrice || 0)).toString()
          };
          await storage.createPurchaseOrderItem(itemData);
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Purchase order creation error:", error);
      res.status(400).json({ message: "Invalid purchase order data", error: error.message });
    }
  });

  app.get("/api/purchase-orders/:id/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const items = await storage.getPurchaseOrderItems(orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase order items" });
    }
  });

  // Sales Order routes
  app.get("/api/sales-orders", async (req, res) => {
    try {
      const orders = await storage.getAllSalesOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales orders" });
    }
  });

  app.post("/api/sales-orders", async (req, res) => {
    try {
      console.log("Received sales order data:", req.body);
      
      // Extract and transform the enhanced form data
      const { items = [], ...orderFields } = req.body;
      
      // Create base order data that matches the schema
      const baseOrderData = {
        orderNumber: orderFields.orderNumber,
        orderDate: orderFields.orderDate || new Date().toISOString().split('T')[0],
        customerId: orderFields.customerId,
        status: orderFields.status || "draft",
        paymentStatus: orderFields.paymentStatus || "unpaid",
        paymentTerms: orderFields.paymentTerms || "net_30",
        dueDate: orderFields.dueDate || null,
        remarks: orderFields.remarks || null,
        totalAmount: orderFields.totalAmount || orderFields.grandTotal || "0.00",
        taxAmount: orderFields.totalTax?.toString() || "0.00",
        discountAmount: orderFields.totalDiscount?.toString() || "0.00",
        subtotalAmount: orderFields.subtotalAmount?.toString() || "0.00"
      };
      
      console.log("Transformed sales order data:", baseOrderData);
      
      const orderData = insertSalesOrderSchema.parse(baseOrderData);
      const order = await storage.createSalesOrder(orderData);
      
      // Create order items if provided
      if (items && items.length > 0) {
        for (const item of items) {
          const itemData = {
            salesOrderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price?.toString() || "0.00",
            taxPercent: item.taxPercent?.toString() || "0.00",
            discountPercent: item.discountPercent?.toString() || "0.00",
            batchNumber: item.batchNumber || null,
            unitPrice: item.price?.toString() || "0.00",
            totalPrice: ((item.quantity || 0) * (item.price || 0)).toString(),
            lineTotal: ((item.quantity || 0) * (item.price || 0)).toString()
          };
          await storage.createSalesOrderItem(itemData);
        }
      }
      
      res.json(order);
    } catch (error) {
      console.error("Sales order creation error:", error);
      res.status(400).json({ message: "Invalid sales order data", error: error.message });
    }
  });

  app.get("/api/sales-orders/:id/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const items = await storage.getSalesOrderItems(orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales order items" });
    }
  });

  // Warehouse routes
  app.get("/api/warehouses", async (req, res) => {
    try {
      const warehouses = await storage.getAllWarehouses();
      res.json(warehouses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch warehouses" });
    }
  });

  app.post("/api/warehouses", async (req, res) => {
    try {
      const warehouseData = insertWarehouseSchema.parse(req.body);
      const warehouse = await storage.createWarehouse(warehouseData);
      res.json(warehouse);
    } catch (error) {
      res.status(400).json({ message: "Invalid warehouse data" });
    }
  });

  app.patch("/api/warehouses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const warehouseData = insertWarehouseSchema.partial().parse(req.body);
      const warehouse = await storage.updateWarehouse(id, warehouseData);
      if (!warehouse) {
        return res.status(404).json({ message: "Warehouse not found" });
      }
      res.json(warehouse);
    } catch (error) {
      res.status(400).json({ message: "Invalid warehouse data" });
    }
  });

  // Return routes
  app.get("/api/returns", async (req, res) => {
    try {
      const returns = await storage.getAllReturns();
      res.json(returns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch returns" });
    }
  });

  app.post("/api/returns", async (req, res) => {
    try {
      const returnData = insertReturnSchema.parse(req.body);
      const returnRecord = await storage.createReturn(returnData);
      res.json(returnRecord);
    } catch (error) {
      res.status(400).json({ message: "Invalid return data" });
    }
  });

  app.patch("/api/returns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const returnData = insertReturnSchema.partial().parse(req.body);
      const returnRecord = await storage.updateReturn(id, returnData);
      if (!returnRecord) {
        return res.status(404).json({ message: "Return not found" });
      }
      res.json(returnRecord);
    } catch (error) {
      res.status(400).json({ message: "Invalid return data" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  app.patch("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paymentData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, paymentData);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.updateNotification(id, { isRead: true });
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      const updates = await Promise.all(
        notifications.filter(n => !n.isRead).map(n => 
          storage.updateNotification(n.id, { isRead: true })
        )
      );
      res.json({ updated: updates.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Bulk upload routes
  app.post("/api/bulk-upload/:type", upload.single('file'), async (req, res) => {
    try {
      const { type } = req.params;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Process the uploaded file based on type
      let result;
      switch (type) {
        case 'products':
          result = await processBulkProducts(file.buffer, file.mimetype);
          break;
        case 'purchase-orders':
          result = await processBulkPurchaseOrders(file.buffer, file.mimetype);
          break;
        case 'inventory':
          result = await processBulkInventory(file.buffer, file.mimetype);
          break;
        default:
          return res.status(400).json({ message: "Invalid upload type" });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: "Bulk upload failed", error: error.message });
    }
  });

  app.get("/api/bulk-upload/template/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const template = generateTemplate(type);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-template.csv`);
      res.send(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate template" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
