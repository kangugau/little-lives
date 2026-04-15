import { calculateInvoiceTotal, processPayment } from './dist/index.js';

async function main() {
  console.log('='.repeat(60));
  console.log(
    'SCENARIO 1: Simple invoice with 2 items, paid by single payment'
  );
  console.log('='.repeat(60));

  const invoice1 = calculateInvoiceTotal({
    items: [
      { description: 'Product A', quantity: 2, unitPrice: 50, taxRate: 0.1 },
      { description: 'Product B', quantity: 1, unitPrice: 100, taxRate: 0.2 },
    ],
  });

  console.log('\n--- Invoice Created ---');
  console.log(JSON.stringify(invoice1, null, 2));

  const result1 = await processPayment({
    invoice: invoice1,
    method: 'cash',
    amount: invoice1.outstandingAmount,
  });

  console.log('\n--- Payment Made ---');
  console.log('Payment:', JSON.stringify(result1.payment, null, 2));

  console.log('\n--- Updated Invoice ---');
  console.log(JSON.stringify(result1.receipt.updatedInvoice, null, 2));

  console.log('\n--- Receipt ---');
  console.log(JSON.stringify(result1.receipt, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('SCENARIO 2: Simple invoice overpaid by 2 payments');
  console.log('='.repeat(60));

  const invoice2 = calculateInvoiceTotal({
    items: [
      { description: 'Service Fee', quantity: 1, unitPrice: 100, taxRate: 0 },
    ],
  });

  console.log('\n--- Invoice Created ---');
  console.log(JSON.stringify(invoice2, null, 2));

  const result2a = await processPayment({
    invoice: invoice2,
    method: 'bank_transfer',
    amount: 50,
  });

  console.log('\n--- Payment 1 (50) ---');
  console.log('Payment:', JSON.stringify(result2a.payment, null, 2));
  console.log(
    'Updated Invoice:',
    JSON.stringify(result2a.receipt.updatedInvoice, null, 2)
  );
  console.log('Receipt:', JSON.stringify(result2a.receipt, null, 2));

  const result2b = await processPayment({
    invoice: result2a.receipt.updatedInvoice,
    method: 'cash',
    amount: 100,
  });

  console.log('\n--- Payment 2 (100 - overpaid) ---');
  console.log('Payment:', JSON.stringify(result2b.payment, null, 2));
  console.log(
    'Updated Invoice:',
    JSON.stringify(result2b.receipt.updatedInvoice, null, 2)
  );
  console.log('Receipt:', JSON.stringify(result2b.receipt, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('All scenarios completed!');
  console.log('='.repeat(60));
}

main().catch(console.error);
