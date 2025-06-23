import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PurchaseOrder, SalesOrder, PurchaseOrderItem, SalesOrderItem, Supplier, Customer, Product } from '@shared/schema';
import { formatCurrency, formatDate } from './utils';

interface PurchaseOrderWithDetails extends PurchaseOrder {
  supplier?: Supplier;
  items?: Array<PurchaseOrderItem & { product?: Product }>;
}

interface SalesOrderWithDetails extends SalesOrder {
  customer?: Customer;
  items?: Array<SalesOrderItem & { product?: Product }>;
}

export class PDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addHeader(title: string, orderNumber: string, date: Date) {
    const pageWidth = this.doc.internal.pageSize.width;
    
    // Company header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Inventory Management System', 20, 20);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('123 Business Street, City, State 12345', 20, 28);
    this.doc.text('Phone: (555) 123-4567 | Email: info@company.com', 20, 34);
    
    // Document title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, pageWidth - 20, 20, { align: 'right' });
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(orderNumber, pageWidth - 20, 28, { align: 'right' });
    this.doc.text(`Date: ${formatDate(date)}`, pageWidth - 20, 34, { align: 'right' });
    
    // Horizontal line
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 45, pageWidth - 20, 45);
    
    return 55; // Return Y position for next content
  }

  private addAddressBlock(
    label: string, 
    name: string, 
    address: string, 
    contact: string, 
    x: number, 
    y: number
  ) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, x, y);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(name, x, y + 8);
    
    const addressLines = address.split('\n').filter(line => line.trim());
    addressLines.forEach((line, index) => {
      this.doc.text(line, x, y + 16 + (index * 6));
    });
    
    if (contact) {
      this.doc.text(contact, x, y + 16 + (addressLines.length * 6));
    }
    
    return y + 40 + (addressLines.length * 6);
  }

  generatePurchaseOrderPDF(order: PurchaseOrderWithDetails): jsPDF {
    this.doc = new jsPDF();
    
    let currentY = this.addHeader('PURCHASE ORDER', order.orderNumber, order.orderDate);
    
    // Supplier information
    const supplierAddress = order.supplier?.address || 'Address not available';
    const supplierContact = order.supplier ? 
      `Contact: ${order.supplier.contactPerson || 'N/A'}\nPhone: ${order.supplier.phone || 'N/A'}\nEmail: ${order.supplier.email || 'N/A'}` :
      'Contact information not available';
    
    currentY = this.addAddressBlock(
      'SUPPLIER:',
      order.supplier?.name || 'Unknown Supplier',
      supplierAddress,
      supplierContact,
      20,
      currentY
    );

    // Order details
    currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const orderDetails = [
      ['Order Date:', formatDate(order.orderDate)],
      ['Expected Delivery:', order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'Not specified'],
      ['Payment Terms:', order.paymentTerms || 'Standard'],
      ['Status:', order.status.toUpperCase()],
    ];

    if (order.notes) {
      orderDetails.push(['Notes:', order.notes]);
    }

    orderDetails.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, 20, currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, 80, currentY);
      currentY += 8;
    });

    // Items table
    currentY += 10;
    const tableColumns = ['Item', 'SKU', 'Qty', 'Unit Price', 'Tax', 'Total'];
    const tableRows = order.items?.map(item => [
      item.product?.name || 'Unknown Product',
      item.product?.sku || 'N/A',
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      item.taxAmount ? formatCurrency(item.taxAmount) : '-',
      formatCurrency(item.totalPrice)
    ]) || [];

    autoTable(this.doc, {
      startY: currentY,
      head: [tableColumns],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 100] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    // Totals section
    const finalY = (this.doc as any).lastAutoTable.finalY + 20;
    const pageWidth = this.doc.internal.pageSize.width;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const totalsData = [
      ['Subtotal:', formatCurrency(order.subtotal)],
      ['Tax:', formatCurrency(order.taxAmount)],
      ['Total Amount:', formatCurrency(order.totalAmount)]
    ];

    totalsData.forEach(([label, value], index) => {
      const y = finalY + (index * 8);
      this.doc.text(label, pageWidth - 80, y);
      this.doc.text(value, pageWidth - 20, y, { align: 'right' });
    });

    // Footer
    const footerY = this.doc.internal.pageSize.height - 30;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Thank you for your business!', 20, footerY);
    this.doc.text(`Generated on ${formatDate(new Date())}`, pageWidth - 20, footerY, { align: 'right' });

    return this.doc;
  }

  generateSalesOrderPDF(order: SalesOrderWithDetails): jsPDF {
    this.doc = new jsPDF();
    
    let currentY = this.addHeader('SALES INVOICE', order.orderNumber, order.orderDate);
    
    // Customer information
    const customerAddress = order.customer?.address || 'Address not available';
    const customerContact = order.customer ? 
      `Phone: ${order.customer.phone || 'N/A'}\nEmail: ${order.customer.email || 'N/A'}` :
      'Contact information not available';
    
    currentY = this.addAddressBlock(
      'BILL TO:',
      order.customer?.name || 'Unknown Customer',
      customerAddress,
      customerContact,
      20,
      currentY
    );

    // Order details
    currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    const orderDetails = [
      ['Invoice Date:', formatDate(order.orderDate)],
      ['Due Date:', order.dueDate ? formatDate(order.dueDate) : 'Immediate'],
      ['Payment Terms:', order.paymentTerms || 'Net 30'],
      ['Status:', order.status.toUpperCase()],
    ];

    if (order.notes) {
      orderDetails.push(['Notes:', order.notes]);
    }

    orderDetails.forEach(([label, value]) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, 20, currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(value, 80, currentY);
      currentY += 8;
    });

    // Items table
    currentY += 10;
    const tableColumns = ['Item', 'SKU', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'];
    const tableRows = order.items?.map(item => [
      item.product?.name || 'Unknown Product',
      item.product?.sku || 'N/A',
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      item.discountAmount ? formatCurrency(item.discountAmount) : '-',
      item.taxAmount ? formatCurrency(item.taxAmount) : '-',
      formatCurrency(item.totalPrice)
    ]) || [];

    autoTable(this.doc, {
      startY: currentY,
      head: [tableColumns],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [100, 100, 100] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      }
    });

    // Totals section
    const finalY = (this.doc as any).lastAutoTable.finalY + 20;
    const pageWidth = this.doc.internal.pageSize.width;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const totalsData = [
      ['Subtotal:', formatCurrency(order.subtotal)],
      ['Discount:', formatCurrency(order.discountAmount || 0)],
      ['Tax:', formatCurrency(order.taxAmount)],
      ['Total Amount:', formatCurrency(order.totalAmount)]
    ];

    totalsData.forEach(([label, value], index) => {
      const y = finalY + (index * 8);
      this.doc.text(label, pageWidth - 100, y);
      this.doc.text(value, pageWidth - 20, y, { align: 'right' });
    });

    // Payment status
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    const paymentStatus = order.status === 'fulfilled' ? 'PAID' : 'UNPAID';
    const statusColor = order.status === 'fulfilled' ? [34, 197, 94] : [239, 68, 68];
    this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    this.doc.text(paymentStatus, pageWidth - 20, finalY + 40, { align: 'right' });
    this.doc.setTextColor(0, 0, 0);

    // Footer with payment instructions
    const footerY = this.doc.internal.pageSize.height - 40;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Payment Instructions:', 20, footerY);
    this.doc.text('Please remit payment within the specified terms.', 20, footerY + 6);
    this.doc.text('For questions, contact: billing@company.com', 20, footerY + 12);
    this.doc.text(`Generated on ${formatDate(new Date())}`, pageWidth - 20, footerY + 12, { align: 'right' });

    return this.doc;
  }

  downloadPDF(filename: string) {
    this.doc.save(filename);
  }

  getPDFBlob(): Blob {
    return this.doc.output('blob');
  }
}

export const generatePurchaseOrderPDF = (order: PurchaseOrderWithDetails) => {
  const generator = new PDFGenerator();
  return generator.generatePurchaseOrderPDF(order);
};

export const generateSalesOrderPDF = (order: SalesOrderWithDetails) => {
  const generator = new PDFGenerator();
  return generator.generateSalesOrderPDF(order);
};

export const downloadPurchaseOrderPDF = (order: PurchaseOrderWithDetails) => {
  const pdf = generatePurchaseOrderPDF(order);
  pdf.save(`purchase-order-${order.orderNumber}.pdf`);
};

export const downloadSalesOrderPDF = (order: SalesOrderWithDetails) => {
  const pdf = generateSalesOrderPDF(order);
  pdf.save(`sales-invoice-${order.orderNumber}.pdf`);
};