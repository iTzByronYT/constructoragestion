-- ProXis Database Schema - RESET COMPLETO
-- Este script elimina todo y lo crea de nuevo
-- ADVERTENCIA: Esto eliminará todos los datos existentes

-- Eliminar triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
DROP TRIGGER IF EXISTS update_budget_items_updated_at ON budget_items;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar políticas
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON projects;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON budget_items;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON tasks;

-- Eliminar tablas (en orden inverso por las foreign keys)
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS budget_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Crear tabla de Proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  start_date DATE,
  end_date DATE,
  estimated_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  actual_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'HNL',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
  location TEXT,
  created_by_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Gastos
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  budget_item_id UUID,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'HNL',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  invoice_number TEXT,
  supplier TEXT,
  receipt_image TEXT,
  created_by_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Facturas
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'HNL',
  exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_by_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Items de Presupuesto
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(15,2) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'HNL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de Tareas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'TODO',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  due_date DATE,
  assigned_to TEXT,
  created_by_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at 
  BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad (permitir todo por ahora)
CREATE POLICY "Enable all access for authenticated users" ON projects
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON expenses
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON invoices
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON budget_items
  FOR ALL USING (true);

CREATE POLICY "Enable all access for authenticated users" ON tasks
  FOR ALL USING (true);
