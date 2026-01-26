import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Datos del proyecto de prueba
const testProject = {
  id: 'test_' + Date.now(),
  name: 'Proyecto de Prueba',
  description: 'Proyecto creado automáticamente para pruebas',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'test_user'
};

async function createTestProject() {
  console.log('🚀 Creando proyecto de prueba...');
  
  try {
    // Insertar el proyecto
    const { data: project, error } = await supabase
      .from('projects')
      .insert([testProject])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear el proyecto:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Si hay un error, intentamos verificar la estructura de la tabla
      console.log('\n🔍 Verificando la estructura de la tabla...');
      const { data: columns, error: columnsError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
        
      if (columnsError) {
        console.error('Error al verificar la estructura:', columnsError);
      } else {
        console.log('Estructura de la tabla projects:', columns);
      }
      
      return;
    }

    console.log('✅ Proyecto creado exitosamente!');
    console.log('\n📋 Detalles del proyecto:');
    console.log(`ID: ${project.id}`);
    console.log(`Nombre: ${project.name}`);
    console.log(`Descripción: ${project.description}`);
    console.log(`Estado: ${project.status}`);
    console.log(`Creado: ${new Date(project.created_at).toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la creación del proyecto
createTestProject();
