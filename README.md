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


See `example.js` for integration examples demonstrating:
- Simple invoice with 2 items, paid by single payment
- Simple invoice overpaid by 2 payments

Run with: `pnpm example`

## Limitations

- No storage solution is implemented - so payment status is not tracked
- Native JavaScript numbers are used for monetary values - for production systems, consider using a decimal library to avoid floating-point precision issues
