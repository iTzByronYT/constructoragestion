// Script para corregir el problema del proyecto
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

// ID del proyecto a verificar/crear
const projectId = 'test_1764429348990'; // Usando el ID del proyecto existente
const oldProjectId = 'cmikeo0r90002vvvjz24iefqo';

async function fixProjectIssue() {
  console.log('🚀 Iniciando solución para el proyecto...');
  
  try {
    // 1. Verificar si el proyecto ya existe
    console.log('🔍 Verificando proyecto...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (projectError) throw projectError;

    if (project) {
      console.log('✅ Proyecto encontrado:');
      console.log(`ID: ${project.id}`);
      console.log(`Nombre: ${project.name}`);
      console.log(`Estado: ${project.status}`);
    } else {
      console.log('⚠️ El proyecto no existe. Creando uno nuevo...');
      
      // 2. Crear el proyecto si no existe
      const newProject = {
        id: projectId,
        name: 'Proyecto de Prueba',
        description: 'Proyecto de prueba creado automáticamente',
        status: 'ACTIVE', // Usar 'ACTIVE' en lugar de 'IN_PROGRESS' para coincidir con el esquema
        start_date: null,
        end_date: null,
        estimated_budget: 0,
        actual_budget: 0,
        currency: 'HNL',
        exchange_rate: 1,
        location: null,
        created_by_id: null, // Usar created_by_id en lugar de created_by
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdProject, error: createError } = await supabase
        .from('projects')
        .insert([newProject])
        .select();

      if (createError) throw createError;
      
      console.log('✅ Proyecto creado exitosamente:', createdProject);
    }

    // 3. Verificar si hay budget_items con el ID antiguo
    console.log('\n🔍 Buscando budget_items con el ID antiguo...');
    let oldItems = [];
    let itemsError = null;
    
    try {
      const { data, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('project_id', oldProjectId);
      
      if (error) {
        itemsError = error;
        console.log('⚠️ No se pudo buscar en budget_items, puede que la tabla no exista o haya un error de permisos:', error.message);
      } else {
        oldItems = data || [];
        console.log(`ℹ️ Se encontraron ${oldItems.length} items con el ID de proyecto antiguo.`);
      }
    } catch (error) {
      itemsError = error;
      console.log('⚠️ Error al buscar en budget_items:', error.message);
    }

    if (oldItems && oldItems.length > 0) {
      console.log(`⚠️ Se encontraron ${oldItems.length} items con el ID de proyecto antiguo. Actualizando...`);
      
      // Actualizar los items al nuevo ID de proyecto
      const updates = oldItems.map(async (item) => {
        const { error: updateError } = await supabase
          .from('budget_items')
          .update({ project_id: projectId })
          .eq('id', item.id);
          
        if (updateError) {
          console.error(`❌ Error al actualizar item ${item.id}:`, updateError);
          return { id: item.id, success: false, error: updateError };
        }
        return { id: item.id, success: true };
      });
      
      const results = await Promise.all(updates);
      const successCount = results.filter(r => r.success).length;
      console.log(`✅ Se actualizaron ${successCount} de ${oldItems.length} items correctamente.`);
    } else {
      console.log('✅ No se encontraron items con el ID de proyecto antiguo.');
    }

    console.log('\n✨ Proceso completado con éxito!');
    
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
    console.error('Detalles:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
  }
}

// Ejecutar la función
fixProjectIssue().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Error inesperado:', error);
  process.exit(1);
});
