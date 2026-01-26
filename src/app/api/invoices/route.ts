import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');

    let whereClause: any = {};
    
    if (projectId && projectId !== 'all') whereClause.projectId = projectId;
    if (status && status !== 'all') whereClause.status = status;

    const invoices = await db.invoice.findMany({
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
        issueDate: 'desc'
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Error fetching invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
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
      fileUrl,
      createdById
    } = body;

    // Validaciones
    if (!projectId || !invoiceNumber || !supplier || !amount || !issueDate || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verificar duplicados
    const existingInvoice = await db.invoice.findUnique({
      where: { invoiceNumber }
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Una factura con este número ya existe' },
        { status: 400 }
      );
    }

    const invoice = await db.invoice.create({
      data: {
        projectId,
        invoiceNumber,
        supplier,
        amount,
        currency: currency || 'HNL',
        exchangeRate: exchangeRate || 24.5,
        issueDate: new Date(issueDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'PENDING',
        category: category || 'Otros',
        description: description || null,
        fileUrl: fileUrl || null,
        createdById
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Error creating invoice' },
      { status: 500 }
    );
  }
}
