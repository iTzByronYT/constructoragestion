-- Corrección de tipos de datos para Supabase
-- Ejecuta este script en el Editor SQL de Supabase para permitir IDs tipo CUID

BEGIN;

-- Tabla expenses (Gastos)
ALTER TABLE expenses ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE expenses ALTER COLUMN created_by_id TYPE TEXT;
ALTER TABLE expenses ALTER COLUMN budget_item_id TYPE TEXT;

-- Tabla invoices (Facturas)
ALTER TABLE invoices ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE invoices ALTER COLUMN created_by_id TYPE TEXT;

-- Tabla projects (Proyectos)
-- Nota: Si esta falla es porque ya es TEXT, lo cual es bueno.
ALTER TABLE projects ALTER COLUMN id TYPE TEXT;
ALTER TABLE projects ALTER COLUMN created_by_id TYPE TEXT;

COMMIT;
