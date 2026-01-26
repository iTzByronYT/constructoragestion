// Verificar y actualizar los budget_items con el ID de proyecto incorrecto
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndUpdateBudgetItems() {
  try {
    const incorrectProjectId = 'cmikeo0r90002vvvjz24iefqo';
    const correctProjectId = 'test_1764429612655';
    
    console.log('🔍 Buscando registros con el ID de proyecto incorrecto...');
    
    // 1. Buscar registros con el ID de proyecto incorrecto
    const { data: items, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('project_id', incorrectProjectId);
    
    if (error) throw error;
    
    console.log(`📊 Se encontraron ${items.length} registros con el ID de proyecto incorrecto.`);
    
    if (items.length > 0) {
      console.log('🔄 Actualizando registros...');
      
      // 2. Actualizar los registros con el ID de proyecto correcto
      const { data: updatedItems, error: updateError } = await supabase
        .from('budget_items')
        .update({ project_id: correctProjectId })
        .eq('project_id', incorrectProjectId)
        .select();
      
      if (updateError) throw updateError;
      
      console.log('✅ Registros actualizados correctamente:', updatedItems.length);
      console.log('📝 Detalles de los registros actualizados:', updatedItems);
    } else {
      console.log('✅ No se encontraron registros con el ID de proyecto incorrecto.');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar/actualizar los registros:', error);
  } finally {
    process.exit(0);
  }
}

checkAndUpdateBudgetItems();
