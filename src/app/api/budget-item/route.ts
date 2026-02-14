import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const budgetItems = await db.budgetItem.findMany({
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
      take: 10 // Limitar a 10 resultados para la prueba
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
