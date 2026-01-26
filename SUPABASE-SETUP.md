# 🚀 Configuración de Supabase para ProXis

## ✅ Paso 1: Crear las Tablas en Supabase

1. Ve a tu proyecto en Supabase: https://unjgllyuuvgcyezkcrpt.supabase.co
2. Haz clic en **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega TODO el contenido del archivo `supabase-schema.sql`
5. Haz clic en **Run** para ejecutar el script
6. Verás un mensaje de éxito cuando se creen todas las tablas

## ✅ Paso 2: Verificar las Tablas

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ projects
   - ✅ expenses
   - ✅ invoices
   - ✅ budget_items
   - ✅ tasks

## ✅ Paso 3: Configurar RLS (Row Level Security)

Las políticas de seguridad ya están configuradas en el script SQL. Por ahora permiten acceso completo a usuarios autenticados.

## 🎯 Estado Actual de la Integración

### **Completado:**
- ✅ Cliente de Supabase configurado
- ✅ Store de Proyectos integrado con Supabase
  - ✅ `loadProjects()` - Carga desde base de datos
  - ✅ `addProject()` - Guarda en base de datos
  - ✅ `updateProject()` - Actualiza en base de datos
  - ✅ `deleteProject()` - Elimina de base de datos

### **Pendiente:**
- ⏳ Store de Gastos (expenses)
- ⏳ Store de Facturas (invoices)
- ⏳ Store de Presupuestos (budget_items)
- ⏳ Store de Tareas (tasks)

## 🧪 Probar la Integración

1. Ejecuta el script SQL en Supabase
2. Recarga tu aplicación
3. Los proyectos se cargarán automáticamente desde Supabase
4. Crea un nuevo proyecto
5. Recarga la página
6. ✅ **El proyecto debe seguir ahí** (persistencia real)

## 📋 Próximos Pasos

Una vez que confirmes que los proyectos funcionan correctamente, puedo integrar los demás stores:
- Gastos
- Facturas
- Presupuestos
- Tareas

## 🔑 Credenciales Configuradas

- **URL**: https://unjgllyuuvgcyezkcrpt.supabase.co
- **Anon Key**: Configurada en `src/lib/supabase.ts`

## ⚠️ Importante

- Las eliminaciones ahora son **permanentes** en la base de datos
- Los datos persisten entre sesiones
- Múltiples usuarios pueden acceder al mismo proyecto
- Los datos están respaldados automáticamente por Supabase

---

**¿Listo para probar?** Ejecuta el script SQL y recarga tu aplicación! 🎉
