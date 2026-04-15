import { calculateInvoiceTotal, processPayment } from './dist/index.js';

async function main() {
  console.log('Scenario 1: Single payment');
  const invoice1 = calculateInvoiceTotal({
    items: [
      { description: 'Product A', quantity: 2, unitPrice: 50, taxRate: 0.1 },
      { description: 'Product B', quantity: 1, unitPrice: 100, taxRate: 0.2 },
    ],
  });
  console.log(
    `Invoice total: ${invoice1.totalAmount}, Outstanding: ${invoice1.outstandingAmount}`
  );

  const result1 = await processPayment({
    invoice: invoice1,
    method: 'cash',
    amount: invoice1.outstandingAmount,
  });
  console.log(`Payment: ${result1.payment.amount} (${result1.payment.status})`);
  console.log(
    `Invoice outstanding: ${result1.updatedInvoice.outstandingAmount}, status: ${result1.updatedInvoice.status}`
  );

  console.log('\nScenario 2: Multiple payments');
  const invoice2 = calculateInvoiceTotal({
    items: [
      { description: 'Service Fee', quantity: 1, unitPrice: 100, taxRate: 0 },
    ],
  });
  console.log(
    `Invoice total: ${invoice2.totalAmount}, Outstanding: ${invoice2.outstandingAmount}`
  );

  const result2a = await processPayment({
    invoice: invoice2,
    method: 'bank_transfer',
    amount: 50,
  });
  console.log(
    `Payment 1: ${result2a.payment.amount} (${result2a.payment.status}), Outstanding: ${result2a.updatedInvoice.outstandingAmount}`
  );

  const result2b = await processPayment({
    invoice: result2a.updatedInvoice,
    method: 'cash',
    amount: 100,
  });
  console.log(
    `Payment 2: ${result2b.payment.amount} (${result2b.payment.status}), Outstanding: ${result2b.updatedInvoice.outstandingAmount}`
  );

  console.log('\nAll scenarios completed!');
}

main().catch(console.error);
