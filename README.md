# Payment Module

A TypeScript module for handling invoices, payments, and receipts.

## Installation

```bash
pnpm install
```

## Commands

```bash
# Run tests
pnpm test:run

# Build TypeScript
pnpm build

# Run example
pnpm example
```

## Example

Create invoice with `calculateInvoiceTotal`, pay invoice with `processPayment` that will call `generateReceipt` and return the receipt, payment result and updated invoice.

```javascript
import { calculateInvoiceTotal, processPayment } from './dist/index.js';

// Scenario 1: Single payment
const invoice1 = calculateInvoiceTotal({
  items: [
    { description: 'Product A', quantity: 2, unitPrice: 50, taxRate: 0.1 },
    { description: 'Product B', quantity: 1, unitPrice: 100, taxRate: 0.2 },
  ],
});
// invoice1.totalAmount: 230, invoice1.outstandingAmount: 230

const result1 = await processPayment({
  invoice: invoice1,
  method: 'cash',
  amount: invoice1.outstandingAmount,
});
// result1.payment.status: 'complete', result1.updatedInvoice.status: 'paid'

// Scenario 2: Multiple payments
const invoice2 = calculateInvoiceTotal({
  items: [
    { description: 'Service Fee', quantity: 1, unitPrice: 100, taxRate: 0 },
  ],
});

const result2a = await processPayment({
  invoice: invoice2,
  method: 'bank_transfer',
  amount: 50,
});
// result2a.payment.status: 'pending', result2a.updatedInvoice.outstandingAmount: 50

const result2b = await processPayment({
  invoice: result2a.updatedInvoice,
  method: 'cash',
  amount: 100,
});
// result2b.payment.status: 'complete', result2b.updatedInvoice.status: 'paid'
```

Run with: `pnpm example`

## Limitations

- No storage solution is implemented - so payment status is not tracked
- Native JavaScript numbers are used for monetary values - for production systems, consider using a decimal library to avoid floating-point precision issues
