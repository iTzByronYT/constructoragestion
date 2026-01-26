import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let whereClause = {};
    if (projectId) {
      whereClause = { projectId };
    }

    const budgetItems = await db.budgetItem.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(budgetItems);
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return NextResponse.json(
      { error: 'Error fetching budget items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      category,
      description,
      quantity,
      unitPrice,
      currency,
      createdById
    } = body;

    // Validaciones
    if (!projectId || !category || !description || !quantity || !unitPrice || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calcular precio total
    const totalPrice = quantity * unitPrice;

    const budgetItem = await db.budgetItem.create({
      data: {
        projectId,
        category,
        description,
        quantity,
        unitPrice,
        totalPrice,
        currency: currency || 'HNL',
        createdById
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

    return NextResponse.json(budgetItem, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json(
      { error: 'Error creating budget item' },
      { status: 500 }
    );
  }
}