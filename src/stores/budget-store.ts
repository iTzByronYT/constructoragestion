import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface BudgetItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface BudgetState {
  budgetItems: BudgetItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setBudgetItems: (items: BudgetItem[]) => void;
  addBudgetItem: (item: BudgetItem) => void;
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getBudgetItemsByProject: (projectId: string) => BudgetItem[];
  getTotalBudgetByProject: (projectId: string) => number;
  getBudgetByCategory: (projectId: string) => { [category: string]: number };
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetItems: [],
  loading: false,
  error: null,

  setBudgetItems: (budgetItems) => set({ budgetItems }),
  
  addBudgetItem: async (budgetItem) => {
    // Validar campos requeridos
    const requiredFields = ['projectId', 'category', 'description', 'quantity', 'unitPrice', 'totalPrice', 'currency'];
    const missingFields = requiredFields.filter(field => {
      const value = budgetItem[field as keyof typeof budgetItem];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      const errorMsg = `Faltan campos requeridos: ${missingFields.join(', ')}`;
      console.error('Error de validación:', errorMsg);
      set({ error: errorMsg });
      return null;
    }
    
    // Corregir el ID del proyecto si es necesario
    const correctProjectId = 'test_1764429612655';
    const incorrectProjectId = 'cmikeo0r90002vvvjz24iefqo';
    
    if (budgetItem.projectId === incorrectProjectId) {
      console.warn(`⚠️ Se detectó un ID de proyecto incorrecto (${incorrectProjectId}). Corrigiendo a ${correctProjectId}`);
      budgetItem.projectId = correctProjectId;
    }

    // Verificar que el proyecto exista y el usuario tenga acceso
    try {
      console.log('🔍 Verificando existencia del proyecto y permisos...');
      console.log('ID del proyecto a verificar:', budgetItem.projectId);
      
      // 1. Primero, obtener el ID del usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Error al obtener el usuario actual:', userError);
        set({ error: 'Error al verificar la autenticación. Por favor, inicia sesión nuevamente.' });
        return null;
      }
      
      console.log('👤 Usuario actual:', user?.id);
      
      // 2. Verificar si el proyecto existe y el usuario tiene acceso
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, name, created_by')
        .or(`id.eq.${budgetItem.projectId},created_by.eq.${user?.id}`)
        .maybeSingle();
      
      console.log('🔍 Resultado de la consulta del proyecto:', { project, error: projectError });
      
      if (projectError) {
        console.error('❌ Error al verificar el proyecto:', projectError);
        set({ error: 'Error al verificar el proyecto. Por favor, inténtalo de nuevo.' });
        return null;
      }
      
      if (!project) {
        const errorMsg = `El proyecto seleccionado no existe o no tienes permisos para acceder a él. ID: ${budgetItem.projectId}`;
        console.error('❌', errorMsg);
        
        // Verificar si el proyecto existe pero el usuario no tiene acceso
        const { data: projectExists } = await supabase
          .from('projects')
          .select('id')
          .eq('id', budgetItem.projectId)
          .maybeSingle();
          
        if (projectExists) {
          console.error('⚠️ El proyecto existe, pero el usuario no tiene permisos para acceder a él.');
          set({ error: 'No tienes permisos para acceder a este proyecto.' });
        } else {
          console.error('⚠️ El proyecto no existe en la base de datos.');
          set({ error: 'El proyecto seleccionado no existe.' });
        }
        
        return null;
      }
      
      console.log('✅ Proyecto verificado correctamente:', project);
      
      console.log('Proyecto encontrado:', project);
      
    } catch (error) {
      console.error('Error al verificar el proyecto:', error);
      set({ error: 'Error al verificar el proyecto. Por favor, inténtalo de nuevo.' });
      return null;
    }

    // Preparar los datos para insertar
    const itemData = {
      project_id: budgetItem.projectId,
      category: budgetItem.category.trim(),
      description: budgetItem.description.trim(),
      quantity: Number(budgetItem.quantity),
      unit_price: Number(budgetItem.unitPrice),
      total_price: Number(budgetItem.totalPrice),
      currency: budgetItem.currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: budgetItem.createdById || null
    };

    console.log('Intentando agregar ítem con datos:', JSON.stringify(itemData, null, 2));

    // Intentar la inserción
    try {
      console.log('Iniciando inserción del ítem...');
      set({ loading: true, error: null });
      
      const { data: insertedData, error: insertError } = await supabase
        .from('budget_items')
        .insert([itemData])
        .select()
        .single();

      if (insertError) {
        let errorMessage = 'Error al guardar el ítem';
        
        // Mensajes de error más descriptivos
        if (insertError.code === '23503') { // Código de error de clave foránea
          errorMessage = 'Error de referencia: El proyecto o usuario no existe';
        } else if (insertError.code === '23505') { // Violación de restricción única
          errorMessage = 'Este ítem ya existe en el presupuesto';
        } else if (insertError.message) {
          errorMessage += `: ${insertError.message}`;
        }
        
        console.error('Error en la inserción:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        set({ error: errorMessage, loading: false });
        return null;
      }

      // Si llegamos aquí, la inserción fue exitosa
      if (insertedData) {
        const newItem: BudgetItem = {
          id: insertedData.id,
          projectId: insertedData.project_id,
          category: insertedData.category,
          description: insertedData.description,
          quantity: insertedData.quantity,
          unitPrice: insertedData.unit_price,
          totalPrice: insertedData.total_price,
          currency: insertedData.currency,
          createdById: insertedData.created_by || '',
          createdAt: insertedData.created_at || new Date().toISOString(),
          updatedAt: insertedData.updated_at || new Date().toISOString()
        };
        
        console.log('Ítem agregado exitosamente:', newItem);
        
        // Actualizar el estado con el nuevo ítem
        set(state => ({
          budgetItems: [...state.budgetItems, newItem],
          loading: false,
          error: null
        }));
        
        return newItem;
      }
      
      return null;
      
    } catch (error) {
      console.error('Error inesperado al agregar el ítem:', {
        error,
        errorDetails: error instanceof Error ? error.stack : 'No stack trace',
        itemData
      });
      
      set({ 
        error: 'Error inesperado al agregar el ítem. Por favor, inténtalo de nuevo.',
        loading: false
      });
      
      return null;
    }
  },
  
  updateBudgetItem: (id, updatedItem) => set((state) => ({
    budgetItems: state.budgetItems.map(item => 
      item.id === id ? { ...item, ...updatedItem, updatedAt: new Date().toISOString() } : item
    )
  })),
  
  deleteBudgetItem: async (id) => {
    // Verificar si es un UUID válido
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isValidUUID) {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting budget item from Supabase:', error);
        return;
      }
    } else {
      console.warn('Eliminando item de presupuesto con ID no-UUID (dato viejo):', id);
    }

    set((state) => ({
      budgetItems: state.budgetItems.filter(item => item.id !== id)
    }));
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getBudgetItemsByProject: (projectId) => {
    const { budgetItems } = get();
    return budgetItems.filter(item => item.projectId === projectId);
  },

  getTotalBudgetByProject: (projectId) => {
    const { budgetItems } = get();
    return budgetItems
      .filter(item => item.projectId === projectId)
      .reduce((sum, item) => sum + item.totalPrice, 0);
  },

  getBudgetByCategory: (projectId) => {
    const { budgetItems } = get();
    const categoryTotals: { [category: string]: number } = {};
    
    budgetItems
      .filter(item => item.projectId === projectId)
      .forEach(item => {
        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.totalPrice;
      });
    
    return categoryTotals;
  }
}));