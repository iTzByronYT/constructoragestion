const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjectsSchema() {
  try {
    console.log('🔍 Obteniendo información de la tabla projects...');
    
    // 1. Obtener la estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_columns_info', { table_name: 'projects' })
      .catch(async () => {
        // Si falla el RPC, intentar con una consulta directa
        console.log('El RPC get_columns_info no está disponible, intentando con consulta directa...');
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'projects');
        
        if (error) throw error;
        return { data, error: null };
      });
    
    if (columnsError) throw columnsError;
    
    console.log('\n📋 Estructura de la tabla projects:');
    console.table(columns);
    
    // 2. Obtener datos de muestra
    console.log('\n📊 Datos de ejemplo de la tabla projects:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('projects')
      .select('*')
      .limit(2);
    
    if (sampleError) throw sampleError;
    
    if (sampleData && sampleData.length > 0) {
      console.log('\n📝 Datos de ejemplo:');
      console.table(sampleData);
    } else {
      console.log('ℹ️ La tabla projects está vacía.');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar la estructura de la tabla projects:', error);
    console.error('Detalles:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  } finally {
    process.exit(0);
  }
}

checkProjectsSchema();
