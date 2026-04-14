import { describe, it, expect } from "vitest";
import { calculateInvoiceTotal, CalculateInvoiceTotalOptions } from "./index";

describe("calculateInvoiceTotal", () => {
  it("should create invoice with single item without tax", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        {
          description: "Product A",
          quantity: 1,
          unitPrice: 100,
          taxRate: 0,
        },
      ],
    };

    const invoice = calculateInvoiceTotal(options);

    expect(invoice.totalAmount).toBe(100);
    expect(invoice.totalTax).toBe(0);
    expect(invoice.outstandingAmount).toBe(100);
    expect(invoice.status).toBe("pending");
    expect(invoice.items).toHaveLength(1);
    expect(invoice.items[0].lineTotal).toBe(100);
    expect(invoice.items[0].taxAmount).toBe(0);
  });

  it("should create invoice with multiple items without tax", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Product A", quantity: 2, unitPrice: 50, taxRate: 0 },
        { description: "Product B", quantity: 1, unitPrice: 75, taxRate: 0 },
      ],
    };

    const invoice = calculateInvoiceTotal(options);

    expect(invoice.totalAmount).toBe(175);
    expect(invoice.items).toHaveLength(2);
  });

  it("should create invoice with tax", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        {
          description: "Product A",
          quantity: 1,
          unitPrice: 100,
          taxRate: 0.1,
        },
      ],
    };

    const invoice = calculateInvoiceTotal(options);

    expect(invoice.totalAmount).toBe(110);
    expect(invoice.totalTax).toBe(10);
  });

  it("should create invoice with multiple items with different tax rates", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Product A", quantity: 2, unitPrice: 50, taxRate: 0.1 },
        { description: "Product B", quantity: 1, unitPrice: 100, taxRate: 0.2 },
      ],
    };

    const invoice = calculateInvoiceTotal(options);

    const expectedTotal = (2 * 50 * 1.1) + (1 * 100 * 1.2);
    expect(invoice.totalAmount).toBe(expectedTotal);
    expect(invoice.totalTax).toBe(30);
  });

  it("should return empty invoice for empty items", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [],
    };

    const invoice = calculateInvoiceTotal(options);

    expect(invoice.totalAmount).toBe(0);
    expect(invoice.totalTax).toBe(0);
    expect(invoice.items).toHaveLength(0);
  });

  it("should generate valid invoice number", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [{ description: "Product A", quantity: 1, unitPrice: 100, taxRate: 0 }],
    };

    const invoice = calculateInvoiceTotal(options);

    expect(invoice.invoiceNumber).toMatch(/^INV-\d{8}-[A-Z0-9]+$/);
    expect(invoice.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});
