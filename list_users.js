import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('🔍 Listando usuarios...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limitar a los primeros 10 usuarios
    });

    if (users.length === 0) {
      console.log('No se encontraron usuarios en la base de datos.');
      return [];
    }

    console.log('\n📋 Usuarios encontrados:');
    console.table(users);
    
    return users;
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
listUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });
