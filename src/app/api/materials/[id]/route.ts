import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
