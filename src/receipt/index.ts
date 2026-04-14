import { v4 as uuidv4 } from "uuid";
import { Invoice, Payment, Receipt, ReceiptItem } from "../types";

export interface GenerateReceiptOptions {
  payment: Payment;
  invoice: Invoice;
}

export function generateReceipt(options: GenerateReceiptOptions): Receipt {
  const { payment, invoice } = options;

  const remainingBalance = invoice.outstandingAmount - payment.amount;

  const items: ReceiptItem[] = invoice.items.map((item) => {
    const itemRatio = item.lineTotal / invoice.totalAmount;
    const amountPaid = payment.amount * itemRatio;
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amountPaid,
    };
  });

  return {
    id: uuidv4(),
    paymentId: payment.id,
    invoiceId: invoice.id,
    totalPaid: payment.amount,
    remainingBalance,
    items,
  };
}
