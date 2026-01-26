import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await db.expense.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        budgetItem: {
          select: {
            description: true,
            category: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Error fetching expense' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      description,
      amount,
      currency,
      exchangeRate,
      category,
      date,
      invoiceNumber,
      supplier,
      receiptImage
    } = body;

    const expense = await db.expense.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(currency !== undefined && { currency }),
        ...(exchangeRate !== undefined && { exchangeRate }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(supplier !== undefined && { supplier }),
        ...(receiptImage !== undefined && { receiptImage }),
        updatedAt: new Date()
      },
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        budgetItem: {
          select: {
            description: true,
            category: true
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Error updating expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Transacción para eliminar gasto y su factura asociada si existe
    await db.$transaction(async (tx) => {
      // 1. Obtener el gasto para ver si tiene factura vinculada
      const expense = await tx.expense.findUnique({
        where: { id: params.id }
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      // 2. Eliminar el gasto
      await tx.expense.delete({
        where: { id: params.id }
      });

      // 3. Si tenía número de factura, intentar eliminarla también
      if (expense.invoiceNumber) {
        const deletedInvoice = await tx.invoice.deleteMany({
          where: {
            invoiceNumber: expense.invoiceNumber,
            projectId: expense.projectId // Asegurar que sea del mismo proyecto
          }
        });
        console.log(`Factura(s) asociada(s) eliminada(s): ${deletedInvoice.count}`);
      }
    });

    return NextResponse.json({ message: 'Expense and associated invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Error deleting expense' },
      { status: 500 }
    );
  }
}