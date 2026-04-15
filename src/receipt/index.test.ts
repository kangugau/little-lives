import { describe, it, expect } from 'vitest';
import { generateReceipt, GenerateReceiptOptions } from './index';
import {
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../types';

describe('generateReceipt', () => {
  const createInvoice = (
    totalAmount = 100,
    outstandingAmount = 100
  ): Invoice => ({
    id: 'inv_001',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date('2024-01-15'),
    items: [
      {
        id: 'item_1',
        description: 'Product A',
        quantity: 1,
        unitPrice: 100,
        lineTotal: 100,
        taxRate: 0,
        taxAmount: 0,
      },
    ],
    totalAmount,
    totalTax: 0,
    outstandingAmount,
    status: 'pending' as InvoiceStatus,
  });

  const createPayment = (
    amount = 100,
    method: PaymentMethod = 'cash'
  ): Payment => ({
    id: 'pay_001',
    invoiceId: 'inv_001',
    paymentMethod: method,
    amount,
    paymentDate: new Date('2024-01-15T10:30:00Z'),
    referenceNumber: 'REF-001',
    status: 'complete' as PaymentStatus,
  });

  it('should generate receipt from payment', () => {
    const invoice = createInvoice();
    const payment = createPayment();
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.paymentId).toBe('pay_001');
    expect(receipt.totalPaid).toBe(100);
    expect(receipt.remainingBalance).toBe(0);
    expect(receipt.id).toBeTruthy();
    expect(receipt.items).toEqual([]);
  });

  it('should handle zero amount invoice', () => {
    const invoice = createInvoice(0, 0);
    const payment = createPayment(0);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.remainingBalance).toBe(0);
  });

  it('should handle overpaid', () => {
    const invoice = createInvoice(100, 100);
    const payment = createPayment(150);
    const options: GenerateReceiptOptions = { payment, invoice };
    const receipt = generateReceipt(options);

    expect(receipt.remainingBalance).toBe(50);
  });
});
