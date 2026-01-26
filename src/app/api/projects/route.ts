import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const projects = await db.project.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Error al obtener los proyectos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      code,
      status,
      startDate,
      endDate,
      estimatedBudget,
      currency,
      exchangeRate,
      location,
      createdById
    } = body;

    // Validaciones básicas
    if (!name || !createdById) {
      return NextResponse.json(
        { error: 'El nombre y el ID del creador son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el código ya existe (solo si se proporciona un código válido)
    if (code && code.trim() !== '') {
      const existingProject = await db.project.findUnique({
        where: { code: code.trim() }
      });

      if (existingProject) {
        return NextResponse.json(
          { error: `Ya existe un proyecto con el código "${code.trim()}". Por favor usa un código diferente.` },
          { status: 400 }
        );
      }
    }

    const project = await db.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        code: code?.trim() || null,
        status: status || 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedBudget: parseFloat(estimatedBudget) || 0,
        actualBudget: 0,
        currency: currency || 'HNL',
        exchangeRate: parseFloat(exchangeRate) || 24.5,
        location: location?.trim() || null,
        createdById
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Error al crear el proyecto' },
      { status: 500 }
    );
  }
}