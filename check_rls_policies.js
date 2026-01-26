// Verificar las políticas RLS de la tabla projects
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configura Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  try {
    console.log('🔍 Revisando políticas RLS para la tabla projects...');
    
    // Verificar si RLS está habilitado en la tabla projects
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('table_has_rls', { table_name: 'projects' });
    
    if (rlsError) {
      console.log('No se pudo verificar el estado de RLS, intentando con consulta directa...');
      
      // Si falla el RPC, intentamos con una consulta directa
      const { data, error } = await supabase
        .from('pg_tables')
        .select('*')
        .eq('tablename', 'projects');
        
      if (error) throw error;
      
      console.log('📋 Tabla projects:');
      console.table(data);
      
      console.log('⚠️ No se pudo verificar el estado de RLS. Asegúrate de que la tabla projects exista.');
      return;
    }
    
    console.log(`🔐 RLS está ${rlsStatus ? 'habilitado' : 'deshabilitado'} en la tabla projects`);
    
    if (rlsStatus) {
      console.log('🔍 Buscando políticas RLS para la tabla projects...');
      
      // Obtener las políticas RLS
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'projects');
      
      if (policiesError) throw policiesError;
      
      if (policies.length === 0) {
        console.log('ℹ️ No se encontraron políticas RLS para la tabla projects.');
      } else {
        console.log('📋 Políticas RLS encontradas:');
        console.table(policies);
      }
    }
    
    // Verificar el usuario actual y sus permisos
    console.log('\n👤 Verificando usuario actual...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    console.log('Usuario actual:', user ? user.id : 'No autenticado');
    
    if (user) {
      console.log('🔍 Verificando permisos del usuario en la tabla projects...');
      
      // Intentar leer un proyecto para verificar permisos
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', 'test_1764429612655')
        .maybeSingle();
      
      if (projectError) {
        console.error('❌ Error al leer el proyecto:', projectError);
      } else if (project) {
        console.log('✅ El usuario puede leer el proyecto:', project);
      } else {
        console.log('ℹ️ No se pudo leer el proyecto. El usuario puede que no tenga permisos o el proyecto no existe.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error al verificar las políticas RLS:', error);
  } finally {
    process.exit(0);
  }
}

checkRLSPolicies();
