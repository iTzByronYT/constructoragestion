import { PrismaClient } from '@prisma/client';

// Configuración de Prisma
const prisma = new PrismaClient();

// Datos del proyecto de prueba
const testProject = {
  id: `test_${Date.now()}`,
  name: 'Proyecto de Prueba',
  description: 'Proyecto de prueba creado automáticamente',
  code: `TEST-${Math.floor(Math.random() * 1000)}`,
  status: 'IN_PROGRESS',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días después
  estimatedBudget: 100000,
  actualBudget: 0,
  currency: 'HNL',
  exchangeRate: 24.5,
  location: 'Tegucigalpa, Honduras',
  createdById: 'cmhnwoqlv0000vvb6t39lk1xe', // ID de usuario de Byron Landero
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function createTestProject() {
  console.log('🚀 Creando proyecto de prueba con Prisma...');
  
  try {
    // Verificar si ya existe un proyecto de prueba
    const existingProject = await prisma.project.findFirst({
      where: {
        name: 'Proyecto de Prueba',
      },
    });

    if (existingProject) {
      console.log('✅ Ya existe un proyecto de prueba:');
      console.log(existingProject);
      return existingProject;
    }

    // Crear el proyecto
    const project = await prisma.project.create({
      data: testProject,
    });

    console.log('✅ Proyecto creado exitosamente:');
    console.log(project);
    return project;
  } catch (error) {
    console.error('❌ Error al crear el proyecto:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
createTestProject()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
  });
