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
    expect(receipt.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("should generate receipt with items", () => {
    const invoice: Invoice = {
      id: "inv_002",
      invoiceNumber: "INV-002",
      invoiceDate: new Date("2024-01-15"),
      items: [
        { id: "item_1", description: "Product A", quantity: 2, unitPrice: 50, lineTotal: 100, taxRate: 0, taxAmount: 0 },
        { id: "item_2", description: "Product B", quantity: 1, unitPrice: 50, lineTotal: 50, taxRate: 0, taxAmount: 0 },
      ],
      totalAmount: 150,
      totalTax: 0,
      outstandingAmount: 150,
      status: "pending" as InvoiceStatus,
    };
    const payment = createPayment(75);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.items).toHaveLength(2);
    expect(receipt.items[0].amountPaid).toBe(50);
    expect(receipt.items[1].amountPaid).toBe(25);
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
  });
});
