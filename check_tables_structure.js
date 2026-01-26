import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://unjgllyuuvgcyezkcrpt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuamdsbHl1dXZnY3llemtjcnB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc3MzcyOSwiZXhwIjoyMDc4MzQ5NzI5fQ.MZXWXTU6Vm6g58UQ-k92saxm50Q329SxUDsbUy91zbc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Verificando estructura de la base de datos...');
  
  try {
    // 1. Verificar tablas existentes
    console.log('\n📋 Tablas en la base de datos:');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .select('*');

    if (tablesError) {
      console.log('No se pudo obtener la lista de tablas usando RPC, intentando con consulta directa...');
      // Si falla, intentamos con una consulta directa a information_schema
      const { data: schemaTables, error: schemaError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (schemaError) {
        console.error('❌ Error al obtener tablas:', schemaError);
      } else if (schemaTables && schemaTables.length > 0) {
        console.log('Tablas encontradas:');
        schemaTables.forEach(table => console.log(`- ${table.table_name}`));
      } else {
        console.log('No se encontraron tablas en la base de datos.');
      }
    } else if (tables && tables.length > 0) {
      console.log('Tablas encontradas:');
      tables.forEach(table => console.log(`- ${table.tablename}`));
    } else {
      console.log('No se encontraron tablas en la base de datos.');
    }

    // 2. Verificar estructura de la tabla projects si existe
    console.log('\n🔍 Verificando estructura de la tabla projects...');
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(1);

      if (projectsError) {
        if (projectsError.code === '42P01') {
          console.log('❌ La tabla "projects" no existe en la base de datos.');
        } else {
          console.error('Error al verificar la tabla projects:', projectsError);
        }
      } else {
        console.log('✅ La tabla "projects" existe.');
        if (projects && projects.length > 0) {
          console.log('\n📝 Estructura de la primera fila:');
          console.log(projects[0]);
        } else {
          console.log('La tabla "projects" está vacía.');
        }
      }
    } catch (err) {
      console.error('Error al verificar la tabla projects:', err);
    }

    // 3. Verificar si hay algún proyecto existente
    console.log('\n🔍 Buscando proyectos existentes...');
    try {
      const { data: existingProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (projectsError) {
        console.error('Error al buscar proyectos existentes:', projectsError);
      } else if (existingProjects && existingProjects.length > 0) {
        console.log('\n📋 Proyectos encontrados:');
        existingProjects.forEach((project, index) => {
          console.log(`\nProyecto #${index + 1}:`);
          console.log(`ID: ${project.id}`);
          console.log(`Nombre: ${project.name}`);
          console.log(`Creado: ${project.created_at ? new Date(project.created_at).toLocaleString() : 'Fecha no disponible'}`);
        });
      } else {
        console.log('No se encontraron proyectos en la base de datos.');
      }
    } catch (err) {
      console.error('Error al buscar proyectos:', err);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

// Ejecutar la verificación
checkTables();
