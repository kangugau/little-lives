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

  // for overpaid
  const rawRemainingBalance = payment.amount - invoice.outstandingAmount;
  const remainingBalance = rawRemainingBalance > 0 ? rawRemainingBalance : 0;

  const items: ReceiptItem[] = [];

  return {
    id: uuidv4(),
    paymentId: payment.id,
    totalPaid: payment.amount,
    remainingBalance,
    items,
  };
}
