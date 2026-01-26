// Script para crear manualmente un proyecto en Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Datos del proyecto a crear
const projectData = {
  id: 'test_1764429612655',
  name: 'Proyecto de Prueba',
  description: 'Proyecto de prueba creado manualmente',
  code: 'TEST-' + Math.floor(Math.random() * 1000),
  status: 'IN_PROGRESS',
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días después
  estimated_budget: 100000,
  actual_budget: 0,
  currency: 'HNL',
  exchange_rate: 24.5,
  location: 'Tegucigalpa, Honduras',
  created_by: 'cmhnwoqlv0000vvb6t39lk1xe', // ID de usuario de Byron
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  committed_amount: 0,
  budget_modifications: 0,
  revised_budget: 0,
  client_id: null,
  contractor_id: null
};

async function createProject() {
  try {
    console.log('🚀 Intentando crear proyecto manualmente...');
    console.log('Datos del proyecto:', JSON.stringify(projectData, null, 2));
    
    // Verificar si el proyecto ya existe
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectData.id)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    
    if (existingProject) {
      console.log('ℹ️ El proyecto ya existe. Actualizando...');
      
      // Actualizar el proyecto existente
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectData.id)
        .select();
      
      if (updateError) throw updateError;
      
      console.log('✅ Proyecto actualizado exitosamente:', updatedProject);
      return updatedProject;
    } else {
      // Crear un nuevo proyecto
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert([projectData])
        .select();
      
      if (insertError) throw insertError;
      
      console.log('✅ Proyecto creado exitosamente:', newProject);
      return newProject;
    }
  } catch (error) {
    console.error('❌ Error al crear/actualizar el proyecto:', error);
    
    // Si hay un error de restricción de clave foránea, intentar con un created_by diferente
    if (error.code === '23503' && error.details.includes('created_by')) {
      console.log('⚠️ Error de clave foránea en created_by. Intentando con un ID de usuario diferente...');
      
      // Obtener un usuario existente
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (usersError) throw usersError;
      
      if (users && users.length > 0) {
        const userId = users[0].id;
        console.log(`🔄 Usando ID de usuario alternativo: ${userId}`);
        
        // Actualizar el created_by y volver a intentar
        projectData.created_by = userId;
        return createProject();
      } else {
        console.error('❌ No se encontraron usuarios en la base de datos.');
      }
    }
    
    // Si hay un error de restricción de unicidad, intentar con un ID diferente
    if (error.code === '23505') {
      console.log('⚠️ Error de restricción de unicidad. Generando un nuevo ID...');
      projectData.id = `test_${Date.now()}`;
      return createProject();
    }
    
    console.error('Detalles del error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    return null;
  }
}

// Ejecutar la función
createProject().then(() => {
  console.log('✅ Proceso completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en el proceso:', error);
  process.exit(1);
});
