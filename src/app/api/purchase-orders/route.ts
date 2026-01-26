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

    const purchaseOrders = await db.purchaseOrder.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        supplier: {
          select: {
            name: true,
            company: true
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

    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Error fetching purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      orderNumber,
      supplierId,
      description,
      amount,
      currency,
      exchangeRate,
      orderDate,
      deliveryDate,
      items,
      terms,
      isCommitted,
      createdById
    } = body;

    // Validaciones
    if (!projectId || !orderNumber || !description || !amount || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const purchaseOrder = await db.purchaseOrder.create({
      data: {
        projectId,
        orderNumber,
        supplierId,
        description,
        amount,
        currency: currency || 'HNL',
        exchangeRate: exchangeRate || 24.5,
        orderDate: orderDate ? new Date(orderDate) : new Date(),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        items,
        terms,
        isCommitted: isCommitted !== false,
        createdById
      },
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        supplier: {
          select: {
            name: true,
            company: true
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

    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: 'Error creating purchase order' },
      { status: 500 }
    );
  }
}