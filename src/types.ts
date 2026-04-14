// Invoices
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  items: InvoiceItem[];
  totalAmount: number;
  totalTax: number;
  outstandingAmount: number;
  status: InvoiceStatus;
}

export type InvoiceStatus = "pending" | "paid";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxRate: number;
  taxAmount: number;
}

// Payment
export interface Payment {
  id: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: Date;
  referenceNumber: string;
  status: PaymentStatus;
}

export type PaymentMethod =
  | "cash"
  | "credit_card"
  | "debit_card"
  | "bank_transfer";

export type PaymentStatus = "complete" | "pending" | "rejected";


// Receipt
export interface Receipt {
  id: string;
  paymentId: string;
  invoiceId: string;
  totalPaid: number;
  remainingBalance: number;
  items: ReceiptItem[];
}

export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amountPaid: number;
}
