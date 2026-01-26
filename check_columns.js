import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableColumns() {
  console.log('🔍 Verificando columnas de la tabla projects...');
  
  try {
    // Intentar obtener información de las columnas usando SQL directo
    console.log('\n🔍 Consultando columnas de la tabla projects...');
    
    // Crear una función RPC para obtener las columnas
    const { data: columns, error } = await supabase.rpc('get_columns', { 
      table_name: 'projects' 
    });

    if (error) {
      console.log('No se pudo obtener las columnas usando RPC, intentando con consulta directa...');
      
      // Si falla, intentar con una consulta directa
      const { data: result, error: queryError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'projects');
        
      if (queryError) {
        console.error('Error al obtener columnas:', queryError);
      } else if (result && result.length > 0) {
        console.log('\n📋 Columnas de la tabla projects:');
        result.forEach(col => {
          console.log(`- ${col.column_name} (${col.data_type})`);
        });
      } else {
        console.log('No se encontraron columnas en la tabla projects.');
      }
    } else if (columns && columns.length > 0) {
      console.log('\n📋 Columnas de la tabla projects:');
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('No se encontraron columnas en la tabla projects.');
    }
    
    // Verificar si la tabla está vacía
    console.log('\n🔍 Verificando si la tabla tiene datos...');
    const { data: projects, error: selectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
      
    if (selectError) {
      console.error('Error al verificar datos:', selectError);
    } else if (projects && projects.length > 0) {
      console.log('\n📝 Datos de ejemplo de la tabla projects:');
      console.log(projects[0]);
    } else {
      console.log('La tabla projects está vacía.');
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Crear la función RPC si no existe
async function createGetColumnsFunction() {
  console.log('\n🔄 Creando función RPC para obtener columnas...');
  
  const { data, error } = await supabase.rpc('create_get_columns_function');
  
  if (error) {
    if (error.code === '42710') { // Función ya existe
      console.log('La función RPC ya existe.');
    } else {
      console.error('Error al crear la función RPC:', error);
    }
  } else {
    console.log('Función RPC creada exitosamente.');
  }
}

// Ejecutar la verificación
checkTableColumns();
