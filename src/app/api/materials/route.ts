import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID del material' },
        { status: 400 }
      );
    }

    // Verificar si el material existe
    const material = await db.material.findUnique({
      where: { id }
    });

    if (!material) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el material
    await db.material.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Material eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el material' },
      { status: 500 }
    );
  }
}

// GET - Obtener catálogo de materiales
export async function GET() {
  try {
    const materials = await db.material.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Error al obtener los materiales' },
      { status: 500 }
    );
  }
}

// POST - Crear material en catálogo general
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      unit,
      basePrice,
      currency,
      category,
      createdById
    } = body;

    // Validaciones básicas
    if (!name || !createdById) {
      return NextResponse.json(
        { error: 'El nombre y createdById son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el código ya existe
    if (code && code.trim() !== '') {
      const existingMaterial = await db.material.findUnique({
        where: { code: code.trim() }
      });

      if (existingMaterial) {
        return NextResponse.json(
          { error: `Ya existe un material con el código "${code.trim()}"` },
          { status: 400 }
        );
      }
    }

    const material = await db.material.create({
      data: {
        name: name.trim(),
        code: code?.trim() || null,
        description: description?.trim() || null,
        unit: unit || 'unidad',
        basePrice: parseFloat(basePrice) || 0,
        currency: currency || 'HNL',
        category: category?.trim() || null,
        createdById
      }
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Error al crear el material' },
      { status: 500 }
    );
  }
}
