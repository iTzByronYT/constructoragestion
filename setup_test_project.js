import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Datos del proyecto de prueba
const testProject = {
  id: 'test_' + Date.now(), // ID único
  name: 'Proyecto de Prueba',
  description: 'Proyecto creado automáticamente para pruebas',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: 'active',
  created_by: 'system'
};

async function setupTestProject() {
  console.log('🔍 Iniciando configuración de proyecto de prueba...');
  
  try {
    // 1. Verificar si la tabla projects existe
    console.log('Verificando estructura de la base de datos...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (tableError && tableError.code !== '42P01') { // 42P01 es el código para tabla no encontrada
      console.error('❌ Error al verificar la tabla projects:', tableError);
      return;
    }

    // 2. Insertar proyecto de prueba
    console.log('\n🔄 Insertando proyecto de prueba...');
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert([testProject])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Violación de restricción única
        console.log('ℹ️  El proyecto de prueba ya existe.');
      } else {
        console.error('❌ Error al insertar proyecto de prueba:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        });
        return;
      }
    } else {
      console.log('✅ Proyecto de prueba creado exitosamente:', {
        id: project.id,
        name: project.name
      });
    }

    // 3. Listar proyectos existentes
    console.log('\n📋 Listado de proyectos existentes:');
    const { data: projects, error: listError } = await supabase
      .from('projects')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (listError) {
      console.error('Error al listar proyectos:', listError);
      return;
    }

    if (projects && projects.length > 0) {
      projects.forEach((p, i) => {
        console.log(`${i + 1}. ID: ${p.id}\n   Nombre: ${p.name}\n   Creado: ${new Date(p.created_at).toLocaleString()}\n`);
      });
      
      console.log('\n✨ ¡Configuración completada! Copia el ID del proyecto para usarlo en la aplicación.');
    } else {
      console.log('No se encontraron proyectos en la base de datos.');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la configuración
setupTestProject();
