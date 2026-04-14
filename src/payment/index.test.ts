import { describe, it, expect, vi } from "vitest";
import {
  processPayment,
  ProcessPaymentOptions,
  InvalidAmountError,
  ExternalPaymentError,
  ServiceUnavailableError,
  InvoiceZeroAmountError,
  MaxAmountExceededError,
  MAX_PAYMENT_AMOUNT,
} from "./index";
import { Invoice, InvoiceStatus } from "../types";
import { externalPaymentService } from "./external/index";

describe("processPayment", () => {
  const createInvoice = (
    totalAmount = 110,
    outstandingAmount = 110,
  ): Invoice => ({
    id: "inv_001",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(),
    items: [
      {
        id: "item_1",
        description: "Product A",
        quantity: 2,
        unitPrice: 50,
        lineTotal: 100,
        taxRate: 0.1,
        taxAmount: 10,
      },
    ],
    totalAmount,
    totalTax: 10,
    outstandingAmount,
    status: "pending" as InvoiceStatus,
  });

  it("should process payment with cash method", async () => {
    const invoice = createInvoice();
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: 110,
    };
    const { payment, updatedInvoice } = await processPayment(options);

    expect(payment.invoiceId).toBe("inv_001");
    expect(payment.paymentMethod).toBe("cash");
    expect(payment.amount).toBe(110);
    expect(payment.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(payment.paymentDate).toBeInstanceOf(Date);
    expect(payment.referenceNumber).toMatch(/^REF-[A-Z]{2,3}-/);
    expect(payment.status).toMatch(/^(complete|pending)$/);

    expect(updatedInvoice.outstandingAmount).toBe(0);
    expect(updatedInvoice.status).toBe("paid");
  });

  it("should process payment with credit_card method", async () => {
    const invoice = createInvoice();
    const options: ProcessPaymentOptions = {
      invoice,
      method: "credit_card",
      amount: 110,
    };
    const { payment } = await processPayment(options);

    expect(payment.paymentMethod).toBe("credit_card");
  });

  it("should process payment with debit_card method", async () => {
    const invoice = createInvoice();
    const options: ProcessPaymentOptions = {
      invoice,
      method: "debit_card",
      amount: 110,
    };
    const payment = await processPayment(options);

    expect(payment.payment.paymentMethod).toBe("debit_card");
  });

  it("should process payment with bank_transfer method", async () => {
    const invoice = createInvoice();
    const options: ProcessPaymentOptions = {
      invoice,
      method: "bank_transfer",
      amount: 110,
    };
    const { payment } = await processPayment(options);

    expect(payment.paymentMethod).toBe("bank_transfer");
  });

  it("should process payment and update invoice via receipt", async () => {
    const invoice = createInvoice(200, 200);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: 100,
    };
    const { payment, updatedInvoice } = await processPayment(options);

    expect(payment.amount).toBe(100);
    expect(updatedInvoice.outstandingAmount).toBe(100);
  });

  it("should throw InvalidAmountError when amount is zero", async () => {
    const invoice = createInvoice();
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: 0,
    };

    await expect(processPayment(options)).rejects.toThrow(InvalidAmountError);
  });

  it("should throw error when amount is negative", async () => {
    const invoice = createInvoice();
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: -50,
    };

    await expect(processPayment(options)).rejects.toThrow(InvalidAmountError);
  });

  it("should throw InvoiceZeroAmountError for zero amount invoice", async () => {
    const invoice = createInvoice(0, 0);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: 10,
    };

    await expect(processPayment(options)).rejects.toThrow(
      InvoiceZeroAmountError,
    );
  });

  it("should throw InvoiceZeroAmountError for already paid invoice", async () => {
    const invoice = createInvoice(100, 0);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: 10,
    };

    await expect(processPayment(options)).rejects.toThrow(
      InvoiceZeroAmountError,
    );
  });

  it("should throw MaxAmountExceededError for amount exceeding max", async () => {
    const invoice = createInvoice(
      MAX_PAYMENT_AMOUNT + 100,
      MAX_PAYMENT_AMOUNT + 100,
    );
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: MAX_PAYMENT_AMOUNT + 100,
    };

    await expect(processPayment(options)).rejects.toThrow(
      MaxAmountExceededError,
    );
  });

  it("should allow payment equal to max amount", async () => {
    const invoice = createInvoice(MAX_PAYMENT_AMOUNT, MAX_PAYMENT_AMOUNT);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: MAX_PAYMENT_AMOUNT,
    };

    const { payment } = await processPayment(options);
    expect(payment.amount).toBe(MAX_PAYMENT_AMOUNT);
  });

  it("should handle pending status from service", async () => {
    vi.spyOn(externalPaymentService, "createPayment").mockResolvedValueOnce({
      externalId: "ext-123",
      provider: "BankTransferProvider",
      status: "pending",
      referenceNumber: "REF-BT-20260414-abc123",
      createdAt: new Date(),
    });

    const invoice = createInvoice(100, 100);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "bank_transfer",
      amount: 100,
    };

    const { payment } = await processPayment(options);
    expect(payment.status).toBe("pending");
  });

  it("should handle completed status from service", async () => {
    vi.spyOn(externalPaymentService, "createPayment").mockResolvedValueOnce({
      externalId: "ext-123",
      provider: "CashProvider",
      status: "complete",
      referenceNumber: "REF-CSH-20260414-abc123",
      createdAt: new Date(),
    });

    const invoice = createInvoice(100, 100);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "cash",
      amount: 100,
    };

    const { payment } = await processPayment(options);
    expect(payment.status).toBe("complete");
  });

  it("should handle rejected status from service", async () => {
    vi.spyOn(externalPaymentService, "createPayment").mockResolvedValueOnce({
      externalId: "ext-123",
      provider: "DebitCardProvider",
      status: "rejected",
      referenceNumber: "REF-DB-20260414-abc123",
      createdAt: new Date(),
    });

    const invoice = createInvoice(100, 100);
    const options: ProcessPaymentOptions = {
      invoice,
      method: "debit_card",
      amount: 100,
    };

    const { payment } = await processPayment(options);
    expect(payment.status).toBe("rejected");
  });
});
