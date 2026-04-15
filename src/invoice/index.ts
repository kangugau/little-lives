import { v4 as uuidv4 } from 'uuid';
import { Invoice, InvoiceItem, InvoiceStatus } from '../types';

export interface CalculateInvoiceTotalOptions {
  items: Omit<InvoiceItem, 'id' | 'lineTotal' | 'taxAmount'>[];
}

export class InvoiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'InvoiceError';
  }
}

export class InvalidInvoiceItemError extends InvoiceError {
  constructor(message: string) {
    super(message, 'INVALID_INVOICE_ITEM');
    this.name = 'InvalidInvoiceItemError';
  }
}

export class InvalidQuantityError extends InvoiceError {
  constructor(message: string) {
    super(message, 'INVALID_QUANTITY');
    this.name = 'InvalidQuantityError';
  }
}

export class InvalidUnitPriceError extends InvoiceError {
  constructor(message: string) {
    super(message, 'INVALID_UNIT_PRICE');
    this.name = 'InvalidUnitPriceError';
  }
}

export class InvalidTaxRateError extends InvoiceError {
  constructor(message: string) {
    super(message, 'INVALID_TAX_RATE');
    this.name = 'InvalidTaxRateError';
  }
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const uuidPart = uuidv4().substring(0, 8).toUpperCase();
  return `INV-${dateStr}-${uuidPart}`;
}

function validateInvoiceItem(
  item: Omit<InvoiceItem, 'id' | 'lineTotal' | 'taxAmount'>
): void {
  if (!item.description || item.description.trim() === '') {
    throw new InvalidInvoiceItemError('Item description is required');
  }

  if (typeof item.quantity !== 'number' || item.quantity <= 0) {
    throw new InvalidQuantityError('Quantity must be greater than 0');
  }

  if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
    throw new InvalidUnitPriceError(
      'Unit price must be greater than or equal to 0'
    );
  }

  if (typeof item.taxRate !== 'number' || item.taxRate < 0) {
    throw new InvalidTaxRateError(
      'Tax rate must be greater than or equal to 0'
    );
  }
}

export function calculateInvoiceTotal(
  options: CalculateInvoiceTotalOptions
): Invoice {
  const { items: itemsInput } = options;

  if (!itemsInput || itemsInput.length === 0) {
    throw new InvoiceError('At least one item is required', 'EMPTY_ITEMS');
  }

  itemsInput.forEach(validateInvoiceItem);

  const items: InvoiceItem[] = itemsInput.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    const taxAmount = lineTotal * item.taxRate;
    return {
      id: uuidv4(),
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
      taxRate: item.taxRate,
      taxAmount,
    };
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.lineTotal + item.taxAmount,
    0
  );
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);

  const invoice: Invoice = {
    id: uuidv4(),
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    items,
    totalAmount,
    totalTax,
    outstandingAmount: totalAmount,
    status: 'pending',
  };

  return invoice;
}
