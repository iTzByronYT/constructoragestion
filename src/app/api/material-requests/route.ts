import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';

// Interfaz para el usuario autenticado
interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  [key: string]: any;
}

// Asegurarse de que el modelo MaterialRequest esté disponible
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaClient {
    interface PrismaClient {
      materialRequest: any;
    }
  }
}

type MaterialRequestData = {
  projectId: string;
  materialId: string;
  quantity: number;
  notes?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED' | 'CANCELLED';
  requestedById?: string;
};

// GET - Obtener todas las solicitudes de materiales
export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autenticación de las cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-storage');
    
    if (!authToken?.value) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Parsear el token para obtener la información del usuario
    let user: AuthUser | null = null;
    try {
      const authData = JSON.parse(authToken.value);
      user = authData.state?.user || null;
    } catch (error) {
      console.error('Error al analizar el token de autenticación:', error);
      return NextResponse.json(
        { error: 'Error de autenticación' },
        { status: 401 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no válida' },
        { status: 401 }
      );
    }

    // Obtener las solicitudes de materiales
    const requests = await db['materialRequest'].findMany({
      include: {
        project: {
          select: {
            name: true,
            code: true
          }
        },
        material: {
          select: {
            name: true,
            code: true
          }
        },
        requestedBy: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching material requests:', error);
    return NextResponse.json(
      { error: 'Error al obtener las solicitudes de materiales' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva solicitud de materiales
export async function POST(request: NextRequest) {
  try {
    // Obtener el token de autenticación de las cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-storage');
    
    if (!authToken?.value) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    // Parsear el token para obtener la información del usuario
    let user: AuthUser | null = null;
    try {
      const authData = JSON.parse(authToken.value);
      user = authData.state?.user || null;
    } catch (error) {
      console.error('Error al analizar el token de autenticación:', error);
      return NextResponse.json(
        { error: 'Error de autenticación' },
        { status: 401 }
      );
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Sesión no válida' },
        { status: 401 }
      );
    }

    const body: MaterialRequestData = await request.json();
    const {
      projectId,
      materialId,
      quantity,
      notes,
      priority = 'NORMAL',
      status = 'PENDING',
      requestedById = user.id
    } = body;

    // Validaciones básicas
    if (!projectId || !materialId || !quantity) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: projectId, materialId, quantity' },
        { status: 400 }
      );
    }

    // Verificar que el proyecto existe
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'El proyecto especificado no existe' },
        { status: 400 }
      );
    }

    // Verificar que el material existe
    const material = await db.material.findUnique({
      where: { id: materialId }
    });

    if (!material) {
      return NextResponse.json(
        { error: 'El material especificado no existe' },
        { status: 400 }
      );
    }

    // Crear la solicitud
    const newRequest = await db['materialRequest'].create({
      data: {
        projectId,
        materialId,
        quantity: Number(quantity),
        notes: notes || null,
        priority: priority as any, // Using 'any' temporarily to bypass type checking
        status: status as any, // Using 'any' temporarily to bypass type checking
        requestedById: user.id
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        material: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating material request:', error);
    return NextResponse.json(
      { error: 'Error al crear la solicitud de materiales' },
      { status: 500 }
    );
  }
}
