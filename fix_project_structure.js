import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Datos del proyecto de prueba con estructura mínima
const testProject = {
  id: 'test_' + Date.now(),
  name: 'Proyecto de Prueba',
  created_at: new Date().toISOString(),
  // No incluimos created_by ya que parece que no existe en la tabla
};

async function fixProjectStructure() {
  console.log('🔧 Intentando solucionar la estructura de la tabla projects...');
  
  try {
    // 1. Intentar insertar un proyecto con estructura mínima
    console.log('\n🔄 Intentando insertar proyecto con estructura mínima...');
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert([testProject])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error al insertar el proyecto:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details
      });
      
      // Si el error es por columna faltante, intentamos crearla
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('\n🔨 Parece que faltan columnas. Vamos a intentar crearlas...');
        await createMissingColumns();
      }
      return;
    }

    console.log('✅ Proyecto insertado exitosamente!');
    console.log('\n📋 Detalles del proyecto:');
    console.log(project);
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

async function createMissingColumns() {
  console.log('\n🛠️  Intentando agregar columnas faltantes...');
  
  try {
    // Ejecutar SQL para agregar columnas faltantes
    const { data, error } = await supabase.rpc('add_missing_columns');
    
    if (error) {
      if (error.code === '42704') { // Función no existe
        console.log('La función RPC no existe. Creándola...');
        await createAddColumnsFunction();
      } else {
        console.error('Error al ejecutar la función RPC:', error);
      }
    } else {
      console.log('✅ Columnas agregadas exitosamente!');
      // Intentar insertar el proyecto nuevamente
      await fixProjectStructure();
    }
  } catch (error) {
    console.error('Error al crear columnas faltantes:', error);
  }
}

async function createAddColumnsFunction() {
  console.log('\n🔨 Creando función para agregar columnas...');
  
  try {
    const { data, error } = await supabase.rpc('create_add_columns_function');
    
    if (error) {
      console.error('Error al crear la función RPC:', error);
      return;
    }
    
    console.log('✅ Función RPC creada exitosamente!');
    // Ejecutar la función después de crearla
    await createMissingColumns();
  } catch (error) {
    console.error('Error inesperado al crear la función RPC:', error);
  }
}

// Ejecutar la solución
fixProjectStructure();
