import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role = 'VISUALIZER', phone } = await request.json();

    // Validar que el email no exista
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        phone
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}