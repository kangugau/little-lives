import { v4 as uuidv4 } from "uuid";
import { Invoice, InvoiceItem, InvoiceStatus } from "../types";

export interface CalculateInvoiceTotalOptions {
  items: Omit<InvoiceItem, "id" | "lineTotal" | "taxAmount">[];
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${dateStr}-${random}`;
}

function calculateItemLineTotal(item: InvoiceItem): number {
  return item.quantity * item.unitPrice;
}

function calculateItemTax(item: InvoiceItem): number {
  return calculateItemLineTotal(item) * item.taxRate;
}

export function calculateInvoiceTotal(
  options: CalculateInvoiceTotalOptions,
): Invoice {
  const { items: itemsInput } = options;

  const items: InvoiceItem[] = itemsInput.map((item, index) => {
    const lineTotal = item.quantity * item.unitPrice;
    const taxAmount = lineTotal * item.taxRate;
    return {
      id: uuidv4(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
      taxRate: item.taxRate,
      taxAmount,
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.lineTotal + item.taxAmount,
    0,
  );
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);

  const invoice: Invoice = {
    id: uuidv4(),
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    items,
    totalAmount,
    totalTax,
    outstandingAmount: totalAmount,
    status: "pending" as InvoiceStatus,
  };

  return invoice;
}
