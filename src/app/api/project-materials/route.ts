import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener materiales de un proyecto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'El projectId es obligatorio' },
        { status: 400 }
      );
    }

    const projectMaterials = await db.projectMaterial.findMany({
      where: {
        projectId
      },
      include: {
        material: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(projectMaterials);
  } catch (error) {
    console.error('Error fetching project materials:', error);
    return NextResponse.json(
      { error: 'Error al obtener los materiales del proyecto' },
      { status: 500 }
    );
  }
}

// POST - Asignar material del catálogo a un proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      materialId,
      quantity,
      minimumStock,
      unitPrice,
      currency,
      notes,
      createdById
    } = body;

    // Validaciones básicas
    if (!projectId || !materialId || !createdById) {
      return NextResponse.json(
        { error: 'El projectId, materialId y createdById son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar que el material existe
    const material = await db.material.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return NextResponse.json(
        { error: 'El material no existe en el catálogo' },
        { status: 404 }
      );
    }

    // Verificar si ya está asignado
    const existing = await db.projectMaterial.findUnique({
      where: {
        projectId_materialId: {
          projectId,
          materialId
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Este material ya está asignado al proyecto' },
        { status: 400 }
      );
    }

    const projectMaterial = await db.projectMaterial.create({
      data: {
        projectId,
        materialId,
        quantity: parseFloat(quantity) || 0,
        minimumStock: parseFloat(minimumStock) || 0,
        unitPrice: parseFloat(unitPrice) || material.basePrice,
        currency: currency || material.currency,
        notes: notes?.trim() || null,
        createdById
      },
      include: {
        material: true
      }
    });

    // Actualizar el presupuesto estimado del proyecto
    const materialTotalCost = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || material.basePrice);
    
    // Obtener el proyecto actual
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (project) {
      // Sumar el costo del material al presupuesto estimado
      await db.project.update({
        where: { id: projectId },
        data: {
          estimatedBudget: project.estimatedBudget + materialTotalCost
        }
      });
    }

    return NextResponse.json(projectMaterial, { status: 201 });
  } catch (error) {
    console.error('Error assigning material to project:', error);
    return NextResponse.json(
      { error: 'Error al asignar el material al proyecto' },
      { status: 500 }
    );
  }
}
