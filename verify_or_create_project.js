// Verificar si el proyecto existe, si no, crearlo
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyOrCreateProject() {
  try {
    const projectId = 'test_1764429612655';
    
    console.log(`🔍 Buscando proyecto con ID: ${projectId}`);
    
    // Verificar si el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, status: true }
    });
    
    if (existingProject) {
      console.log('✅ Proyecto encontrado:');
      console.log(existingProject);
      return existingProject;
    }
    
    console.log('⚠️ El proyecto no existe, creando uno nuevo...');
    
    // Crear un nuevo proyecto si no existe
    const newProject = await prisma.project.create({
      data: {
        id: projectId,
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
        createdById: 'cmhnwoqlv0000vvb6t39lk1xe', // ID de usuario de Byron
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    console.log('✅ Nuevo proyecto creado:');
    console.log(newProject);
    
    return newProject;
    
  } catch (error) {
    console.error('❌ Error al verificar/crear el proyecto:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyOrCreateProject();
