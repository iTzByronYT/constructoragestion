import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await db.project.findUnique({
      where: { id: params.id },
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

    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Error al obtener el proyecto' },
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
      name,
      description,
      code,
      status,
      startDate,
      endDate,
      estimatedBudget,
      currency,
      exchangeRate,
      location
    } = body;

    // Verificar si el proyecto existe
    const existingProject = await db.project.findUnique({
      where: { id: params.id }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el código ya existe en otro proyecto (si se proporciona)
    if (code && code !== existingProject.code) {
      const duplicateProject = await db.project.findUnique({
        where: { code }
      });

      if (duplicateProject) {
        return NextResponse.json(
          { error: 'Ya existe otro proyecto con este código' },
          { status: 400 }
        );
      }
    }

    const project = await db.project.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        code: code || null,
        status: status || 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        estimatedBudget: parseFloat(estimatedBudget) || 0,
        currency: currency || 'HNL',
        exchangeRate: parseFloat(exchangeRate) || 24.5,
        location: location || null
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

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el proyecto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el proyecto existe
    const existingProject = await db.project.findUnique({
      where: { id: params.id }
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      );
    }

    await db.project.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Proyecto eliminado exitosamente' }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el proyecto' },
      { status: 500 }
    );
  }
}