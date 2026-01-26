const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Verificando tablas en la base de datos...');
  
  try {
    // 1. Listar todas las tablas
    console.log('\n📋 Tablas disponibles:');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) throw tablesError;
    
    if (tables && tables.length > 0) {
      console.table(tables);
      
      // 2. Verificar la estructura de la tabla projects
      if (tables.some(t => t.tablename === 'projects')) {
        console.log('\n🔍 Verificando estructura de la tabla projects...');
        
        // Obtener una fila de ejemplo
        const { data: sample, error: sampleError } = await supabase
          .from('projects')
          .select('*')
          .limit(1);
        
        if (sampleError) throw sampleError;
        
        if (sample && sample.length > 0) {
          console.log('\n📝 Columnas de la tabla projects:');
          console.table(Object.keys(sample[0]));
          
          console.log('\n📄 Datos de ejemplo:');
          console.table(sample);
        } else {
          console.log('ℹ️ La tabla projects está vacía.');
        }
      } else {
        console.log('❌ La tabla projects no existe en la base de datos.');
      }
    } else {
      console.log('ℹ️ No se encontraron tablas en la base de datos.');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar las tablas:', error);
    console.error('Detalles:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    // Si hay un error de permisos, intentar con una consulta simple
    console.log('\n🔍 Intentando con una consulta simple...');
    try {
      const { data, error: simpleError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);
      
      if (simpleError) throw simpleError;
      
      console.log('✅ Consulta simple exitosa. Datos:', data);
    } catch (simpleError) {
      console.error('❌ Error en consulta simple:', simpleError);
    }
  }
  
  process.exit(0);
}

checkTables();
