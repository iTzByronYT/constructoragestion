const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Consultando Facturas (Invoices) ---');
    const invoices = await prisma.invoice.findMany();
    console.log(`Total facturas encontradas: ${invoices.length}`);
    console.table(invoices.map(i => ({ 
      Numero: i.invoiceNumber, 
      Proveedor: i.supplier, 
      Monto: i.amount,
      Proyecto: i.projectId
    })));

    console.log('\n--- Consultando Gastos (Expenses) ---');
    const expenses = await prisma.expense.findMany({ take: 5 });
    console.table(expenses.map(e => ({
      Desc: e.description,
      Monto: e.amount,
      FacturaAsociada: e.invoiceNumber || 'N/A'
    })));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
