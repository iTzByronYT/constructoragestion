import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};
    
    if (projectId) whereClause.projectId = projectId;
    if (category) whereClause.category = category;
    
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const expenses = await db.expense.findMany({
      where: whereClause,
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
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Error fetching expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      budgetItemId,
      description,
      amount,
      currency,
      exchangeRate,
      category,
      date,
      invoiceNumber,
      supplier,
      receiptImage,
      createdById
    } = body;

    // Validaciones
    if (!projectId || !description || !amount || !category || !date || !createdById) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Transacción para crear gasto y opcionalmente la factura
    const result = await db.$transaction(async (tx) => {
      // 1. Crear el gasto
      const expense = await tx.expense.create({
        data: {
          projectId,
          budgetItemId: budgetItemId || null,
          description,
          amount,
          currency: currency || 'HNL',
          exchangeRate: exchangeRate || 24.5,
          category,
          date: new Date(date),
          invoiceNumber: invoiceNumber || null,
          supplier: supplier || null,
          receiptImage: receiptImage || null,
          createdById
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

      // 2. Si hay número de factura y proveedor, crear la factura automáticamente
      if (invoiceNumber && supplier) {
        // Verificar si ya existe una factura con ese número para este proyecto
        const existingInvoice = await tx.invoice.findUnique({
          where: {
            invoiceNumber
          }
        });

        if (!existingInvoice) {
          await tx.invoice.create({
            data: {
              projectId,
              invoiceNumber,
              supplier,
              amount,
              currency: currency || 'HNL',
              exchangeRate: exchangeRate || 24.5,
              issueDate: new Date(date),
              status: 'PAID', // Se asume pagada porque proviene de un gasto registrado
              category: category,
              description: `Generada automáticamente desde Gasto: ${description}`,
              fileUrl: receiptImage || null,
              createdById
            }
          });
          console.log(`Factura automática creada: ${invoiceNumber}`);
        } else {
          console.warn(`Factura ${invoiceNumber} ya existe, no se creó duplicada.`);
        }
      }

      return expense;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Error creating expense' },
      { status: 500 }
    );
  }
}