import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            name: true,
            code: true
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

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Error fetching invoice' },
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
      invoiceNumber,
      supplier,
      amount,
      currency,
      exchangeRate,
      issueDate,
      dueDate,
      status,
      category,
      description,
      fileUrl
    } = body;

    // Si se cambia el número de factura, verificar duplicados (excluyendo la actual)
    if (invoiceNumber) {
      const existingInvoice = await db.invoice.findFirst({
        where: {
          invoiceNumber,
          id: { not: params.id }
        }
      });

      if (existingInvoice) {
        return NextResponse.json(
          { error: 'Una factura con este número ya existe' },
          { status: 400 }
        );
      }
    }

    const invoice = await db.invoice.update({
      where: { id: params.id },
      data: {
        ...(invoiceNumber !== undefined && { invoiceNumber }),
        ...(supplier !== undefined && { supplier }),
        ...(amount !== undefined && { amount }),
        ...(currency !== undefined && { currency }),
        ...(exchangeRate !== undefined && { exchangeRate }),
        ...(issueDate !== undefined && { issueDate: new Date(issueDate) }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(status !== undefined && { status }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        updatedAt: new Date()
      },
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Error updating invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Al eliminar una factura, podríamos querer validar si está vinculada a un gasto
    // pero como la relación es opcional (un gasto puede tener factura, pero la factura no "tiene" al gasto explícitamente),
    // podemos eliminarla directamente.
    // Si quisiéramos limpiar el campo invoiceNumber del gasto, tendríamos que buscarlo.

    await db.invoice.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Error deleting invoice' },
      { status: 500 }
    );
  }
}
