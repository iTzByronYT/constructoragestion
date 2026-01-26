import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budgetItem = await db.budgetItem.findUnique({
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

    if (!budgetItem) {
      return NextResponse.json(
        { error: 'Budget item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(budgetItem);
  } catch (error) {
    console.error('Error fetching budget item:', error);
    return NextResponse.json(
      { error: 'Error fetching budget item' },
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
      category,
      description,
      quantity,
      unitPrice,
      currency
    } = body;

    // Calcular precio total si se proporcionaron cantidad y precio unitario
    let totalPrice = undefined;
    if (quantity !== undefined && unitPrice !== undefined) {
      totalPrice = quantity * unitPrice;
    }

    const budgetItem = await db.budgetItem.update({
      where: { id: params.id },
      data: {
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(quantity !== undefined && { quantity }),
        ...(unitPrice !== undefined && { unitPrice }),
        ...(totalPrice !== undefined && { totalPrice }),
        ...(currency !== undefined && { currency }),
        updatedAt: new Date()
      },
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

    return NextResponse.json(budgetItem);
  } catch (error) {
    console.error('Error updating budget item:', error);
    return NextResponse.json(
      { error: 'Error updating budget item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.budgetItem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Budget item deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    return NextResponse.json(
      { error: 'Error deleting budget item' },
      { status: 500 }
    );
  }
}