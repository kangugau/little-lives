import { v4 as uuidv4 } from 'uuid';
import {
  Invoice,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Receipt,
} from '../types';
import {
  ExternalPaymentService,
  ExternalPaymentRequest,
  ExternalPaymentResponse,
  externalPaymentService as defaultExternalService,
} from './external';
import { generateReceipt } from '../receipt/index';

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class ExternalPaymentError extends PaymentError {
  constructor(
    message: string,
    public readonly externalError?: unknown
  ) {
    super(message, 'EXTERNAL_PAYMENT_ERROR');
    this.name = 'ExternalPaymentError';
  }
}

export class InvalidAmountError extends PaymentError {
  constructor(message: string) {
    super(message, 'INVALID_AMOUNT');
    this.name = 'InvalidAmountError';
  }
}

export class ServiceUnavailableError extends PaymentError {
  constructor(message: string) {
    super(message, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

export class InvoiceAlreadyPaidError extends PaymentError {
  constructor(message: string) {
    super(message, 'INVOICE_PAID');
    this.name = 'InvoiceZeroAmountError';
  }
}

export class MaxAmountExceededError extends PaymentError {
  constructor(
    message: string,
    public readonly maxAmount: number
  ) {
    super(message, 'MAX_AMOUNT_EXCEEDED');
    this.name = 'MaxAmountExceededError';
  }
}

export const MAX_PAYMENT_AMOUNT = 1000000;

export interface ProcessPaymentOptions {
  invoice: Invoice;
  method: PaymentMethod;
  amount: number;
}

export interface ProcessPaymentResult {
  payment: Payment;
  updatedInvoice: Invoice;
  receipt: Receipt | null;
}

function validateAmount(amount: number, invoice: Invoice): void {
  if (invoice.status === 'paid') {
    throw new InvoiceAlreadyPaidError('Invoice has already been paid');
  }

  if (amount < 0) {
    throw new InvalidAmountError('Payment amount must be greater than 0');
  }

  if (amount > MAX_PAYMENT_AMOUNT) {
    throw new MaxAmountExceededError(
      `Payment amount exceeds maximum allowed amount of ${MAX_PAYMENT_AMOUNT}`,
      MAX_PAYMENT_AMOUNT
    );
  }
}

function validateService(
  service: ExternalPaymentService | undefined
): asserts service is ExternalPaymentService {
  if (!service) {
    throw new ServiceUnavailableError(
      'External payment service is not available'
    );
  }
}

export async function processPayment(
  options: ProcessPaymentOptions
): Promise<ProcessPaymentResult> {
  const { invoice, method, amount } = options;

  const service = defaultExternalService;
  validateService(service);

  validateAmount(amount, invoice);

  let status: PaymentStatus = 'pending';
  let referenceNumber: string;
  let updatedInvoice = { ...invoice };

  if (amount === 0) {
    status = 'complete';
    referenceNumber = `REF-ZERO-${Date.now()}`;
  } else {
    try {
      const request: ExternalPaymentRequest = {
        amount,
        method,
      };
      const response: ExternalPaymentResponse =
        await service.createPayment(request);
      referenceNumber = response.referenceNumber;
      status = response.status;
    } catch (error) {
      throw new ExternalPaymentError(
        `Failed to process external payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  const payment: Payment = {
    id: uuidv4(),
    invoiceId: invoice.id,
    paymentMethod: method,
    amount,
    paymentDate: new Date(),
    referenceNumber,
    status,
  };

  let receipt: Receipt | null = null;

  if (status === 'complete') {
    updatedInvoice.outstandingAmount =
      updatedInvoice.outstandingAmount - amount;
    updatedInvoice.status =
      updatedInvoice.outstandingAmount === 0 ? 'paid' : 'pending';
    receipt = generateReceipt({ payment, invoice });
  }

  return {
    payment,
    updatedInvoice,
    receipt,
  };
}
