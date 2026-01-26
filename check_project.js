// Script para verificar la existencia de un proyecto en Supabase
import { createClient } from '@supabase/supabase-js';

// Configura tu cliente de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
// Reemplaza esto con tu clave de servicio de Supabase (puedes obtenerla de la configuración de tu proyecto en Supabase)
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';

if (!supabaseKey || supabaseKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc') {
  console.error('❌ Error: Por favor reemplaza TU_CLAVE_DE_SERVICIO_AQUI con tu clave de servicio de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const projectId = 'cmikeo0r90002vvvjz24iefqo';

async function checkProject() {
  console.log('Verificando proyecto con ID:', projectId);
  
  try {
    // Primero, intentemos listar todas las tablas disponibles
    console.log('Listando tablas disponibles...');
    const { data: tables, error: tablesError } = await supabase
      .from('sql_queries')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.log('No se pudo listar tablas directamente, intentando con consulta directa...');
    }

    // Intentar obtener el proyecto directamente
    console.log('\nBuscando el proyecto específico...');
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      if (error.code === '42P01') {  // Código de error para tabla no encontrada
        console.error('❌ Error: La tabla "projects" no existe en la base de datos');
      } else {
        console.error('Error al consultar el proyecto:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
      }
      return;
    }

    if (project) {
      console.log('✅ Proyecto encontrado:', project);
    } else {
      console.log('❌ No se encontró ningún proyecto con ese ID');
      
      // Verifiquemos si hay algún proyecto en la tabla
      console.log('\nBuscando cualquier proyecto existente...');
      const { data: anyProject, error: anyError } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (anyError) {
        console.error('Error al verificar proyectos existentes:', {
          code: anyError.code,
          message: anyError.message
        });
        return;
      }
      
      if (anyProject && anyProject.length > 0) {
        console.log('\nProyectos existentes (últimos 5):');
        anyProject.forEach((p, i) => {
          console.log(`${i + 1}. ID: ${p.id} - Nombre: ${p.name} (Creado: ${new Date(p.created_at).toLocaleDateString()})`);
        });
      } else {
        console.log('No se encontraron proyectos en la base de datos');
      }
    }
  } catch (err) {
    console.error('Error inesperado:', err);
  }
}

checkProject();
