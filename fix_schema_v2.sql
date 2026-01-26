-- Corrección COMPLETA de tipos de datos (Versión 2)
-- Este script maneja las relaciones (Foreign Keys) que causaron el error anterior.

BEGIN;

-- 1. Eliminar temporalmente las restricciones de clave foránea (Foreign Keys)
-- Esto "desata" las tablas para permitir cambiar los tipos de datos
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_project_id_fkey;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_project_id_fkey;
ALTER TABLE budget_items DROP CONSTRAINT IF EXISTS budget_items_project_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
-- Si existen restricciones para created_by, también es prudente quitarlas si vamos a cambiar ese tipo
-- (Si no existen, el IF EXISTS evitará errores)

-- 2. Cambiar el ID principal de la tabla Projects a TEXT
ALTER TABLE projects ALTER COLUMN id TYPE TEXT;
ALTER TABLE projects ALTER COLUMN created_by_id TYPE TEXT;

-- 3. Cambiar las columnas en las tablas relacionadas a TEXT
ALTER TABLE expenses ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE expenses ALTER COLUMN created_by_id TYPE TEXT;
ALTER TABLE expenses ALTER COLUMN budget_item_id TYPE TEXT;

ALTER TABLE invoices ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE invoices ALTER COLUMN created_by_id TYPE TEXT;

ALTER TABLE budget_items ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE tasks ALTER COLUMN project_id TYPE TEXT;

-- 4. Volver a crear las relaciones (Foreign Keys) ahora que ambos lados son TEXT
ALTER TABLE expenses ADD CONSTRAINT expenses_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD CONSTRAINT invoices_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE budget_items ADD CONSTRAINT budget_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

COMMIT;
