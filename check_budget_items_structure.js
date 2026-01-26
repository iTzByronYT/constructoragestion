// Verificar la estructura de la tabla budget_items
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBudgetItemsStructure() {
  try {
    console.log('🔍 Obteniendo información de la tabla budget_items...');
    
    // Obtener la estructura de la tabla
    const { data: columns, error } = await supabase
      .rpc('get_columns_info', { table_name: 'budget_items' });
    
    if (error) {
      console.log('No se pudo obtener la estructura con RPC, intentando con consulta directa...');
      
      // Si falla el RPC, intentamos con una consulta directa
      const { data, error: queryError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'budget_items');
        
      if (queryError) throw queryError;
      
      console.log('📋 Estructura de la tabla budget_items:');
      console.table(data);
      return;
    }
    
    console.log('📋 Estructura de la tabla budget_items:');
    console.table(columns);
    
  } catch (error) {
    console.error('❌ Error al obtener la estructura de la tabla:', error);
  } finally {
    process.exit(0);
  }
}

checkBudgetItemsStructure();
