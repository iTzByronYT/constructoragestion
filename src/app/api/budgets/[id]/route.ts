import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function GET(
  request: Request,
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
  request: Request,
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
    let totalPrice: number | undefined = undefined;
    if (typeof quantity === 'number' && typeof unitPrice === 'number') {
      totalPrice = quantity * unitPrice;
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (totalPrice !== undefined) updateData.totalPrice = totalPrice;
    if (currency !== undefined) updateData.currency = currency;

    const budgetItem = await db.budgetItem.update({
      where: { id: params.id },
      data: updateData,
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
  request: Request,
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