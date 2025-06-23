import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { storage } from './storage';
import { insertProductSchema, insertPurchaseOrderSchema, insertInventoryTransactionSchema } from '@shared/schema';

interface UploadError {
  row: number;
  field: string;
  message: string;
}

interface UploadDuplicate {
  row: number;
  sku: string;
  message: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  data: {
    processed: number;
    errors: UploadError[];
    duplicates: UploadDuplicate[];
  };
}

// Parse CSV or Excel file
async function parseFile(buffer: Buffer, mimetype: string): Promise<any[]> {
  if (mimetype.includes('csv') || mimetype.includes('text/csv')) {
    return parseCSV(buffer);
  } else if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
    return parseExcel(buffer);
  } else {
    throw new Error('Unsupported file format');
  }
}

function parseCSV(buffer: Buffer): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function parseExcel(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Process bulk products upload
export async function processBulkProducts(buffer: Buffer, mimetype: string): Promise<UploadResult> {
  try {
    const data = await parseFile(buffer, mimetype);
    const errors: UploadError[] = [];
    const duplicates: UploadDuplicate[] = [];
    let processed = 0;

    // Get existing products to check for duplicates
    const existingProducts = await storage.getAllProducts();
    const existingSKUs = new Set(existingProducts.map(p => p.sku.toLowerCase()));

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // Account for header row

      try {
        // Validate required fields
        if (!row.SKU || !row.Name || !row.Category || !row.Price) {
          errors.push({
            row: rowNumber,
            field: 'Required Fields',
            message: 'Missing required fields: SKU, Name, Category, or Price'
          });
          continue;
        }

        // Check for duplicates
        if (existingSKUs.has(row.SKU.toLowerCase())) {
          duplicates.push({
            row: rowNumber,
            sku: row.SKU,
            message: 'Product with this SKU already exists'
          });
          continue;
        }

        // Get or create category
        const categories = await storage.getAllCategories();
        let category = categories.find(c => c.name.toLowerCase() === row.Category.toLowerCase());
        if (!category) {
          category = await storage.createCategory({
            name: row.Category,
            description: `Auto-created from bulk upload`
          });
        }

        // Prepare product data
        const productData = {
          sku: row.SKU,
          name: row.Name,
          description: row.Description || null,
          categoryId: category.id,
          price: parseFloat(row.Price).toString(),
          cost: row.Cost ? parseFloat(row.Cost).toString() : '0',
          currentStock: parseInt(row['Current Stock'] || row.Stock || '0'),
          minStockLevel: parseInt(row['Min Stock'] || row.MinStock || '10'),
          maxStockLevel: parseInt(row['Max Stock'] || row.MaxStock || '100'),
          unit: row.Unit || 'pcs',
          weight: row.Weight ? parseFloat(row.Weight) : null,
          dimensions: row.Dimensions || null,
          brand: row.Brand || null,
          isActive: true,
          requiresBatchTracking: row['Batch Tracking'] === 'Yes' || row.BatchTracking === 'Yes'
        };

        // Validate using schema
        const validatedData = insertProductSchema.parse(productData);
        
        // Create product
        await storage.createProduct(validatedData);
        existingSKUs.add(row.SKU.toLowerCase());
        processed++;

      } catch (error: any) {
        errors.push({
          row: rowNumber,
          field: 'Validation',
          message: error.message || 'Invalid data format'
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Processed ${processed} products. ${errors.length} errors, ${duplicates.length} duplicates.`,
      data: { processed, errors, duplicates }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Upload failed: ${error.message}`,
      data: { processed: 0, errors: [], duplicates: [] }
    };
  }
}

// Process bulk purchase orders upload
export async function processBulkPurchaseOrders(buffer: Buffer, mimetype: string): Promise<UploadResult> {
  try {
    const data = await parseFile(buffer, mimetype);
    const errors: UploadError[] = [];
    const duplicates: UploadDuplicate[] = [];
    let processed = 0;

    // Group by order number
    const orderGroups = new Map<string, any[]>();
    data.forEach((row, index) => {
      const orderNumber = row['Order Number'] || row.OrderNumber;
      if (!orderGroups.has(orderNumber)) {
        orderGroups.set(orderNumber, []);
      }
      orderGroups.get(orderNumber)!.push({ ...row, rowIndex: index + 2 });
    });

    for (const [orderNumber, items] of Array.from(orderGroups.entries())) {
      try {
        const firstItem = items[0];
        
        // Get supplier
        const suppliers = await storage.getAllSuppliers();
        const supplier = suppliers.find(s => 
          s.name.toLowerCase() === firstItem['Supplier Name']?.toLowerCase() ||
          s.name.toLowerCase() === firstItem.Supplier?.toLowerCase()
        );

        if (!supplier) {
          errors.push({
            row: firstItem.rowIndex,
            field: 'Supplier',
            message: `Supplier "${firstItem['Supplier Name'] || firstItem.Supplier}" not found`
          });
          continue;
        }

        // Create purchase order
        const orderData = {
          orderNumber,
          supplierId: supplier.id,
          orderDate: new Date(firstItem['Order Date'] || firstItem.OrderDate || Date.now()),
          expectedDeliveryDate: firstItem['Delivery Date'] ? new Date(firstItem['Delivery Date']) : null,
          status: 'draft' as const,
          subtotal: '0',
          taxAmount: '0',
          totalAmount: '0',
          notes: firstItem.Notes || null
        };

        const order = await storage.createPurchaseOrder(orderData);
        let orderTotal = 0;

        // Process items
        for (const item of items) {
          try {
            const products = await storage.getAllProducts();
            const product = products.find(p => 
              p.sku.toLowerCase() === item['Product SKU']?.toLowerCase() ||
              p.sku.toLowerCase() === item.SKU?.toLowerCase()
            );

            if (!product) {
              errors.push({
                row: item.rowIndex,
                field: 'Product',
                message: `Product with SKU "${item['Product SKU'] || item.SKU}" not found`
              });
              continue;
            }

            const quantity = parseInt(item.Quantity);
            const unitPrice = parseFloat(item['Unit Price'] || item.Price);
            const totalPrice = quantity * unitPrice;
            orderTotal += totalPrice;

            await storage.createPurchaseOrderItem({
              purchaseOrderId: order.id,
              productId: product.id,
              quantity,
              unitPrice: unitPrice.toString(),
              totalPrice: totalPrice.toString()
            });

          } catch (error: any) {
            errors.push({
              row: item.rowIndex,
              field: 'Item Processing',
              message: error.message
            });
          }
        }

        // Update order totals
        await storage.updatePurchaseOrder(order.id, {
          totalAmount: orderTotal.toString()
        });

        processed++;

      } catch (error: any) {
        errors.push({
          row: items[0].rowIndex,
          field: 'Order Processing',
          message: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Processed ${processed} purchase orders. ${errors.length} errors.`,
      data: { processed, errors, duplicates }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Upload failed: ${error.message}`,
      data: { processed: 0, errors: [], duplicates: [] }
    };
  }
}

// Process bulk inventory adjustments
export async function processBulkInventory(buffer: Buffer, mimetype: string): Promise<UploadResult> {
  try {
    const data = await parseFile(buffer, mimetype);
    const errors: UploadError[] = [];
    const duplicates: UploadDuplicate[] = [];
    let processed = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Validate required fields
        if (!row['Product SKU'] || !row.Type || !row.Quantity || !row.Reason) {
          errors.push({
            row: rowNumber,
            field: 'Required Fields',
            message: 'Missing required fields: Product SKU, Type, Quantity, or Reason'
          });
          continue;
        }

        // Get product
        const products = await storage.getAllProducts();
        const product = products.find(p => 
          p.sku.toLowerCase() === row['Product SKU'].toLowerCase()
        );

        if (!product) {
          errors.push({
            row: rowNumber,
            field: 'Product',
            message: `Product with SKU "${row['Product SKU']}" not found`
          });
          continue;
        }

        // Get warehouse if specified
        let warehouseId = null;
        if (row['Warehouse Code']) {
          const warehouses = await storage.getAllWarehouses();
          const warehouse = warehouses.find(w => 
            w.code.toLowerCase() === row['Warehouse Code'].toLowerCase()
          );
          if (warehouse) {
            warehouseId = warehouse.id;
          }
        }

        // Prepare transaction data
        const transactionData = {
          productId: product.id,
          warehouseId,
          type: row.Type.toLowerCase() as 'in' | 'out' | 'adjustment',
          quantity: parseInt(row.Quantity),
          reason: row.Reason,
          notes: row.Notes || null,
          performedBy: 1 // Default user
        };

        // Validate transaction type
        if (!['in', 'out', 'adjustment'].includes(transactionData.type)) {
          errors.push({
            row: rowNumber,
            field: 'Type',
            message: 'Type must be IN, OUT, or ADJUSTMENT'
          });
          continue;
        }

        // Create inventory transaction
        await storage.createInventoryTransaction(transactionData);
        processed++;

      } catch (error: any) {
        errors.push({
          row: rowNumber,
          field: 'Processing',
          message: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Processed ${processed} inventory adjustments. ${errors.length} errors.`,
      data: { processed, errors, duplicates }
    };

  } catch (error: any) {
    return {
      success: false,
      message: `Upload failed: ${error.message}`,
      data: { processed: 0, errors: [], duplicates: [] }
    };
  }
}

// Generate CSV templates
export function generateTemplate(type: string): string {
  switch (type) {
    case 'products':
      return `SKU,Name,Description,Category,Price,Cost,Current Stock,Min Stock,Max Stock,Unit,Weight,Dimensions,Brand,Batch Tracking
PROD001,Sample Product,Product description,Electronics,99.99,50.00,100,10,500,pcs,1.5,10x5x2 cm,BrandName,No
PROD002,Another Product,Another description,Clothing,29.99,15.00,50,5,200,pcs,0.3,20x15x1 cm,Fashion Brand,Yes`;

    case 'purchase-orders':
      return `Order Number,Supplier Name,Order Date,Product SKU,Quantity,Unit Price,Delivery Date,Notes
PO-2025-001,Tech Supplies Co.,2025-01-15,PROD001,10,45.00,2025-01-25,Rush order
PO-2025-001,Tech Supplies Co.,2025-01-15,PROD002,5,25.00,2025-01-25,
PO-2025-002,Office Supplies Ltd,2025-01-16,PROD003,20,12.50,2025-01-30,Standard delivery`;

    case 'inventory':
      return `Product SKU,Warehouse Code,Type,Quantity,Reason,Notes
PROD001,WH001,IN,50,New stock arrival,Received from supplier
PROD002,WH001,OUT,10,Sale,Sold to customer
PROD003,WH002,ADJUSTMENT,5,Stock correction,Physical count adjustment`;

    default:
      return 'Invalid template type';
  }
}