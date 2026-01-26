// Verificar la estructura de la tabla projects
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjectsTable() {
  try {
    console.log('🔍 Obteniendo información de la tabla projects...');
    
    // Obtener la estructura de la tabla
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'projects')
      .order('ordinal_position');
    
    if (columnsError) throw columnsError;
    
    console.log('📋 Estructura de la tabla projects:');
    console.table(columns);
    
    // Verificar si la tabla tiene datos
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    console.log(`\n📊 La tabla projects tiene ${count} registros.`);
    
    // Mostrar los primeros 5 registros si los hay
    if (count > 0) {
      const { data: sampleData, error: sampleError } = await supabase
        .from('projects')
        .select('*')
        .limit(5);
      
      if (sampleError) throw sampleError;
      
      console.log('\n📝 Muestra de datos (primeros 5 registros):');
      console.table(sampleData);
    }
    
    // Verificar restricciones de la tabla
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('get_table_constraints', { table_name: 'projects' })
      .catch(() => ({ data: null, error: 'No se pudo obtener información de restricciones' }));
    
    if (constraints) {
      console.log('\n🔒 Restricciones de la tabla projects:');
      console.table(constraints);
    }
    
  } catch (error) {
    console.error('❌ Error al verificar la tabla projects:', error);
  } finally {
    process.exit(0);
  }
}

checkProjectsTable();
