// Buscar registros con el ID de proyecto incorrecto
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findIncorrectProjectIds() {
  try {
    const incorrectProjectId = 'cmikeo0r90002vvvjz24iefqo';
    
    console.log('🔍 Buscando registros con el ID de proyecto incorrecto...');
    
    // Buscar en la tabla budget_items
    const { data: budgetItems, error: budgetItemsError } = await supabase
      .from('budget_items')
      .select('*')
      .eq('project_id', incorrectProjectId);
    
    if (budgetItemsError) throw budgetItemsError;
    
    console.log(`📊 Se encontraron ${budgetItems.length} registros en budget_items con el ID de proyecto incorrecto.`);
    
    if (budgetItems.length > 0) {
      console.log('📝 Detalles de los registros encontrados:');
      console.table(budgetItems.map(item => ({
        id: item.id,
        project_id: item.project_id,
        description: item.description,
        created_at: item.created_at
      })));
    }
    
    // También buscar en otras tablas que puedan tener referencias al proyecto
    const { data: otherTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) throw tablesError;
    
    console.log('\n🔍 Buscando en otras tablas que puedan tener referencias al proyecto...');
    
    for (const { table_name } of otherTables) {
      if (table_name === 'budget_items') continue; // Ya lo revisamos
      
      try {
        // Verificar si la tabla tiene una columna project_id
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_name', table_name)
          .eq('column_name', 'project_id');
        
        if (columnsError) continue;
        
        if (columns.length > 0) {
          const { data: rows, error: rowsError } = await supabase
            .from(table_name)
            .select('*')
            .eq('project_id', incorrectProjectId);
          
          if (rowsError) continue;
          
          if (rows.length > 0) {
            console.log(`\n📊 Tabla ${table_name}: Se encontraron ${rows.length} registros con el ID de proyecto incorrecto.`);
            console.table(rows);
          }
        }
      } catch (err) {
        console.error(`Error al verificar la tabla ${table_name}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al buscar registros con ID de proyecto incorrecto:', error);
  } finally {
    process.exit(0);
  }
}

findIncorrectProjectIds();
