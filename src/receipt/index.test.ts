import { describe, it, expect } from "vitest";
import { generateReceipt, GenerateReceiptOptions } from "./index";
import { Invoice, InvoiceStatus, Payment, PaymentMethod, PaymentStatus } from "../types";

describe("generateReceipt", () => {
  const createInvoice = (totalAmount = 100, outstandingAmount = 100): Invoice => ({
    id: "inv_001",
    invoiceNumber: "INV-001",
    invoiceDate: new Date("2024-01-15"),
    items: [
      { id: "item_1", description: "Product A", quantity: 1, unitPrice: 100, lineTotal: 100, taxRate: 0, taxAmount: 0 },
    ],
    totalAmount,
    totalTax: 0,
    outstandingAmount,
    status: "pending" as InvoiceStatus,
  });

  const createPayment = (amount = 100, method: PaymentMethod = "cash"): Payment => ({
    id: "pay_001",
    invoiceId: "inv_001",
    paymentMethod: method,
    amount,
    paymentDate: new Date("2024-01-15T10:30:00Z"),
    referenceNumber: "REF-001",
    status: "complete" as PaymentStatus,
  });

  it("should generate receipt from payment", () => {
    const invoice = createInvoice();
    const payment = createPayment();
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.paymentId).toBe("pay_001");
    expect(receipt.invoiceId).toBe("inv_001");
    expect(receipt.totalPaid).toBe(100);
    expect(receipt.remainingBalance).toBe(0);
    expect(receipt.id).toBeTruthy();

    expect(receipt.updatedInvoice.outstandingAmount).toBe(0);
    expect(receipt.updatedInvoice.status).toBe("paid");
  });

  it("should calculate remaining balance correctly", () => {
    const invoice: Invoice = {
      id: "inv_001",
      invoiceNumber: "INV-001",
      invoiceDate: new Date("2024-01-15"),
      items: [
        { id: "item_1", description: "Product A", quantity: 2, unitPrice: 100, lineTotal: 200, taxRate: 0, taxAmount: 0 },
      ],
      totalAmount: 200,
      totalTax: 0,
      outstandingAmount: 200,
      status: "pending" as InvoiceStatus,
    };
    const payment = createPayment(100);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.totalPaid).toBe(100);
    expect(receipt.remainingBalance).toBe(100);
    expect(receipt.updatedInvoice.outstandingAmount).toBe(100);
    expect(receipt.updatedInvoice.status).toBe("pending");
  });

  it("should generate unique receipt id", () => {
    const invoice = createInvoice();
    const payment = createPayment();
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt1 = generateReceipt(options);
    const receipt2 = generateReceipt(options);

    expect(receipt1.id).not.toBe(receipt2.id);
  });

  it("should handle partial payment correctly", () => {
    const invoice: Invoice = {
      id: "inv_003",
      invoiceNumber: "INV-003",
      invoiceDate: new Date("2024-01-15"),
      items: [
        { id: "item_1", description: "Product A", quantity: 1, unitPrice: 100, lineTotal: 100, taxRate: 0.1, taxAmount: 10 },
      ],
      totalAmount: 110,
      totalTax: 10,
      outstandingAmount: 110,
      status: "pending" as InvoiceStatus,
    };
    const payment = createPayment(55);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.totalPaid).toBe(55);
    expect(receipt.remainingBalance).toBe(55);
    expect(receipt.updatedInvoice.outstandingAmount).toBe(55);
    expect(receipt.updatedInvoice.status).toBe("pending");
  });

  it("should update invoice status to paid when fully paid", () => {
    const invoice = createInvoice(100, 100);
    const payment = createPayment(100);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.updatedInvoice.outstandingAmount).toBe(0);
    expect(receipt.updatedInvoice.status).toBe("paid");
  });

  it("should handle zero amount invoice", () => {
    const invoice = createInvoice(0, 0);
    const payment = createPayment(0);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.remainingBalance).toBe(0);
    expect(receipt.updatedInvoice.status).toBe("paid");
  });
});
