import { v4 as uuidv4 } from "uuid";
import {
  Invoice,
  InvoiceStatus,
  Payment,
  Receipt,
  ReceiptItem,
} from "../types";

export interface GenerateReceiptOptions {
  payment: Payment;
  invoice: Invoice;
}

export function generateReceipt(options: GenerateReceiptOptions): Receipt {
  const { payment, invoice } = options;

  const rawRemainingBalance = invoice.outstandingAmount - payment.amount;
  const remainingBalance =
    rawRemainingBalance < 0 ? rawRemainingBalance * -1 : 0;
  const updatedOutstandingAmount =
    rawRemainingBalance > 0 ? rawRemainingBalance : 0;
  const isPaid = rawRemainingBalance <= 0 || invoice.outstandingAmount === 0;

  const items: ReceiptItem[] = [];

  return {
    id: uuidv4(),
    paymentId: payment.id,
    invoiceId: invoice.id,
    totalPaid: payment.amount,
    remainingBalance,
    items,
    updatedInvoice: {
      ...invoice,
      outstandingAmount: updatedOutstandingAmount,
      status: isPaid ? ("paid" as InvoiceStatus) : invoice.status,
    },
  };
}
