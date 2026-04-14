# Payment Module

A TypeScript module for handling invoices, payments, and receipts.

## Installation

```bash
pnpm install
```

## Usage

### Invoice Generation

```typescript
import { calculateInvoiceTotal } from './src/invoice';

const invoice = calculateInvoiceTotal({
  items: [
    { description: 'Product A', quantity: 2, unitPrice: 50, taxRate: 0.1 },
    { description: 'Product B', quantity: 1, unitPrice: 100, taxRate: 0.2 },
  ],
});

console.log(invoice.totalAmount); // 220
console.log(invoice.totalTax);   // 30
```

### Payment Processing

```typescript
import { processPayment } from './src/payment';

const payment = processPayment({
  invoice,
  method: 'credit_card',
  amount: 220,
});

console.log(payment.status);        // 'complete'
console.log(payment.referenceNumber); // 'REF-20250414-XXXXXX'
```

### Receipt Generation

```typescript
import { generateReceipt } from './src/receipt';

const receipt = generateReceipt({
  payment,
  invoice,
});

console.log(receipt.totalPaid);      // 220
console.log(receipt.remainingBalance); // 0
console.log(receipt.items);          // [...]
```

### Full Flow Example

```typescript
import { calculateInvoiceTotal } from './src/invoice';
import { processPayment } from './src/payment';
import { generateReceipt } from './src/receipt';

// 1. Create invoice
const invoice = calculateInvoiceTotal({
  items: [
    { description: 'Product A', quantity: 1, unitPrice: 100, taxRate: 0.1 },
  ],
});

// 2. Process payment
const payment = processPayment({
  invoice,
  method: 'cash',
  amount: 110,
});

// 3. Generate receipt
const receipt = generateReceipt({
  payment,
  invoice,
});
```

## Interfaces

- `Invoice` - Invoice with items, totals, and status
- `InvoiceItem` - Individual line item with quantity, price, and tax
- `InvoiceStatus` - `'pending' | 'paid'`
- `Payment` - Payment record with method, amount, and status
- `PaymentMethod` - `'cash' | 'credit_card' | 'debit_card' | 'bank_transfer'`
- `PaymentStatus` - `'complete' | 'pending'`
- `Receipt` - Payment confirmation with itemized breakdown
- `ReceiptItem` - Individual item payment breakdown

## Commands

```bash
# Run tests
pnpm test:run

# Build TypeScript
pnpm build
```

## Limitations

For simplicity, this project uses native JavaScript numbers for monetary values. For production systems, consider using a decimal library to avoid floating-point precision issues.
