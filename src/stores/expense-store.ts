import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Expense {
  id: string;
  projectId: string;
  budgetItemId: string | null;
  description: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  category: string;
  date: string;
  invoiceNumber: string | null;
  supplier: string | null;
  receiptImage: string | null;
  materialId?: string | null; // Add optional materialId
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setExpenses: (expenses: Expense[]) => void;
  fetchExpenses: (projectId?: string) => Promise<Expense[]>;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getExpensesByProject: (projectId: string) => Expense[];
  getTotalExpensesByProject: (projectId: string) => number;
  getExpensesByCategory: (projectId: string) => { [category: string]: number };
  getExpensesByDateRange: (projectId: string, startDate: string, endDate: string) => Expense[];
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  error: null,

  setExpenses: (expenses) => set({ expenses }),
  
  fetchExpenses: async (projectId?: string) => {
    try {
      set({ loading: true, error: null });
      
      // Construir la URL con parámetros de consulta si es necesario
      const url = projectId 
        ? `/api/expenses?projectId=${projectId}`
        : '/api/expenses';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar los gastos');
      }
      
      const expenses = await response.json();
      set({ expenses, loading: false });
      return expenses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los gastos';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  addExpense: async (expense) => {
    try {
      console.log('Attempting to add expense:', expense);
      
      // Validar campos requeridos
      if (!expense.projectId) {
        throw new Error('El ID del proyecto es requerido');
      }
      if (!expense.description) {
        throw new Error('La descripción es requerida');
      }
      if (!expense.amount || isNaN(expense.amount)) {
        throw new Error('El monto es requerido y debe ser un número válido');
      }
      if (!expense.date) {
        throw new Error('La fecha del gasto es requerida');
      }

      // Usar la API local en lugar de Supabase directo para consistencia con SQLite
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: expense.projectId,
          budgetItemId: expense.budgetItemId,
          description: expense.description,
          amount: parseFloat(expense.amount.toString()),
          currency: expense.currency,
          exchangeRate: parseFloat(expense.exchangeRate.toString()),
          category: expense.category,
          date: expense.date,
          invoiceNumber: expense.invoiceNumber,
          supplier: expense.supplier,
          receiptImage: expense.receiptImage,
          createdById: expense.createdById
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el gasto en el servidor');
      }

      const data = await response.json();
      
      console.log('Expense added successfully:', data);

      if (data) {
        // Adaptar la respuesta del API al formato del store
        const newExpense = {
          id: data.id,
          projectId: data.projectId,
          budgetItemId: data.budgetItemId,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          exchangeRate: data.exchangeRate,
          category: data.category,
          date: data.date, // La API devuelve fecha ISO
          invoiceNumber: data.invoiceNumber || null,
          supplier: data.supplier || null,
          receiptImage: data.receiptImage || null,
          createdById: data.createdById || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        set((state) => ({ 
          expenses: [...state.expenses, newExpense],
          error: null 
        }));
        return newExpense;
      }
      
      throw new Error('No se recibieron datos al guardar el gasto');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar el gasto';
      console.error('Error in addExpense:', error);
      set((state) => ({ ...state, error: errorMessage }));
      throw error; // Relanzar el error para que el componente que llama pueda manejarlo
    }
  },
  
  updateExpense: async (id, updatedExpense) => {
    const { expenses } = get();
    const currentExpense = expenses.find(e => e.id === id);
    
    if (!currentExpense) return;

    try {
      set({ loading: true, error: null });
      
      // Usar la API local para actualizar
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: updatedExpense.projectId,
          budgetItemId: updatedExpense.budgetItemId,
          description: updatedExpense.description,
          amount: updatedExpense.amount !== undefined ? parseFloat(updatedExpense.amount.toString()) : undefined,
          currency: updatedExpense.currency,
          exchangeRate: updatedExpense.exchangeRate !== undefined ? parseFloat((updatedExpense.exchangeRate || 1).toString()) : undefined,
          category: updatedExpense.category,
          date: updatedExpense.date,
          invoiceNumber: updatedExpense.invoiceNumber,
          supplier: updatedExpense.supplier,
          receiptImage: updatedExpense.receiptImage
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el gasto');
      }

      const data = await response.json();

      // Actualizar estado local
      set((state) => ({
        expenses: state.expenses.map(expense => 
          expense.id === id ? { 
            ...expense, 
            ...updatedExpense, 
            updatedAt: data.updatedAt || new Date().toISOString() 
          } : expense
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating expense:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar el gasto',
        loading: false 
      });
    }
  },
  
  deleteExpense: async (id) => {
    // Obtener el gasto para verificar si tiene factura asociada
    const expense = get().expenses.find(e => e.id === id);
    
    try {
      // Usar la API local para eliminar
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting expense from API:', errorData);
        throw new Error(errorData.error || 'Error al eliminar el gasto');
      }
      
      // Si el gasto tiene número de factura, eliminar la factura asociada
      // Nota: Esto idealmente debería manejarse en el backend (API), pero lo mantenemos aquí por consistencia
      if (expense?.invoiceNumber) {
        // Aquí deberíamos llamar a la API de facturas para eliminarla, 
        // pero por ahora solo limpiaremos el store local de facturas
        const { useInvoiceStore } = await import('./invoice-store');
        const invoices = useInvoiceStore.getState().invoices;
        const associatedInvoice = invoices.find(
          inv => inv.invoiceNumber === expense.invoiceNumber && inv.projectId === expense.projectId
        );
        if (associatedInvoice) {
          useInvoiceStore.getState().deleteInvoice(associatedInvoice.id);
        }
      }

      // Eliminar del estado local
      set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      }));
      
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Aún eliminamos del estado local para que la UI responda, aunque falle el backend (optimistic update fallback)
      // Opcionalmente podríamos mostrar un toast de error aquí
      set((state) => ({
        expenses: state.expenses.filter(expense => expense.id !== id)
      }));
    }
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getExpensesByProject: (projectId) => {
    const { expenses } = get();
    return expenses.filter(expense => expense.projectId === projectId);
  },

  getTotalExpensesByProject: (projectId) => {
    const { expenses } = get();
    return expenses
      .filter(expense => expense.projectId === projectId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  },

  getExpensesByCategory: (projectId) => {
    const { expenses } = get();
    const categoryTotals: { [category: string]: number } = {};
    
    expenses
      .filter(expense => expense.projectId === projectId)
      .forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });
    
    return categoryTotals;
  },

  getExpensesByDateRange: (projectId, startDate, endDate) => {
    const { expenses } = get();
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expense.projectId === projectId && expenseDate >= start && expenseDate <= end;
    });
  }
}));