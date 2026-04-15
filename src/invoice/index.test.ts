import { describe, it, expect } from "vitest";
import {
  calculateInvoiceTotal,
  CalculateInvoiceTotalOptions,
  InvalidInvoiceItemError,
  InvalidQuantityError,
  InvalidUnitPriceError,
  InvalidTaxRateError,
  InvoiceError,
} from "./index";

describe("calculateInvoiceTotal", () => {
  it("should create invoice with single item with tax", () => {
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
    expect(invoice.outstandingAmount).toBe(110);
    expect(invoice.status).toBe("pending");
    expect(invoice.items).toHaveLength(1);
    expect(invoice.items[0].lineTotal).toBe(100);
    expect(invoice.items[0].taxAmount).toBe(10);
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
    expect(invoice.items).toHaveLength(2);
  });

  it("should create invoice with zero unit price (free items)", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Free Product", quantity: 1, unitPrice: 0, taxRate: 0 },
      ],
    };

    const invoice = calculateInvoiceTotal(options);
    expect(invoice.totalAmount).toBe(0);
    expect(invoice.status).toBe("pending");
  });

  it("should create invoice with high tax rate (>100%)", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Product A", quantity: 1, unitPrice: 100, taxRate: 1.5 },
      ],
    };

    const invoice = calculateInvoiceTotal(options);
    expect(invoice.totalAmount).toBe(250);
    expect(invoice.totalTax).toBe(150);
  });

  it("should generate valid invoice number and id", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [{ description: "Product A", quantity: 1, unitPrice: 100, taxRate: 0 }],
    };

    const invoice = calculateInvoiceTotal(options);

    expect(invoice.invoiceNumber).toMatch(/^INV-\d{8}-[A-Z0-9]+$/);
    expect(invoice.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("should throw InvoiceError for empty items", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [],
    };

    expect(() => calculateInvoiceTotal(options)).toThrow(InvoiceError);
  });

  it("should throw InvalidInvoiceItemError for missing description", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "", quantity: 1, unitPrice: 100, taxRate: 0 },
      ],
    };

    expect(() => calculateInvoiceTotal(options)).toThrow(InvalidInvoiceItemError);
  });

  it("should throw InvalidQuantityError for invalid quantity", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Product A", quantity: 0, unitPrice: 100, taxRate: 0 },
      ],
    };

    expect(() => calculateInvoiceTotal(options)).toThrow(InvalidQuantityError);
  });

  it("should throw InvalidUnitPriceError for negative unit price", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Product A", quantity: 1, unitPrice: -10, taxRate: 0 },
      ],
    };

    expect(() => calculateInvoiceTotal(options)).toThrow(InvalidUnitPriceError);
  });

  it("should throw InvalidTaxRateError for negative tax rate", () => {
    const options: CalculateInvoiceTotalOptions = {
      items: [
        { description: "Product A", quantity: 1, unitPrice: 100, taxRate: -0.1 },
      ],
    };

    expect(() => calculateInvoiceTotal(options)).toThrow(InvalidTaxRateError);
  });
});
