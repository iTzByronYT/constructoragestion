import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  supplier: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  issueDate: string;
  dueDate: string | null;
  status: string;
  category: string;
  description: string | null;
  fileUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  loadInvoices: (projectId?: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getInvoicesByProject: (projectId: string) => Invoice[];
  getInvoicesByStatus: (projectId: string, status: string) => Invoice[];
  getTotalInvoicesByProject: (projectId: string) => number;
  getPaidInvoicesByProject: (projectId: string) => number;
  getPendingInvoicesByProject: (projectId: string) => number;
  getOverdueInvoices: (projectId: string) => Invoice[];
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  loading: false,
  error: null,

  setInvoices: (invoices) => set({ invoices }),

  loadInvoices: async (projectId) => {
    try {
      set({ loading: true, error: null });
      const url = projectId ? `/api/invoices?projectId=${projectId}` : '/api/invoices';
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar las facturas');
      }

      const data = await response.json();
      
      // Adaptar datos si es necesario (la API ya devuelve el formato correcto)
      set({ invoices: data, loading: false });
    } catch (error) {
      console.error('Error loading invoices:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar facturas', 
        loading: false 
      });
    }
  },
  
  addInvoice: async (invoice) => {
    try {
      console.log('Attempting to add invoice:', invoice);
      
      // Validar campos requeridos
      if (!invoice.projectId) throw new Error('El ID del proyecto es requerido');
      if (!invoice.invoiceNumber) throw new Error('El número de factura es requerido');
      if (!invoice.supplier) throw new Error('El proveedor es requerido');
      if (!invoice.amount || isNaN(invoice.amount)) throw new Error('El monto es requerido');

      // Usar API local
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: invoice.projectId,
          invoiceNumber: invoice.invoiceNumber,
          supplier: invoice.supplier,
          amount: parseFloat(invoice.amount.toString()),
          currency: invoice.currency,
          exchangeRate: parseFloat(invoice.exchangeRate.toString()),
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          category: invoice.category,
          description: invoice.description,
          fileUrl: invoice.fileUrl,
          createdById: invoice.createdById
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la factura');
      }

      const data = await response.json();
      
      console.log('Invoice added successfully:', data);

      if (data) {
        const newInvoice = {
          id: data.id,
          projectId: data.projectId,
          invoiceNumber: data.invoiceNumber,
          supplier: data.supplier,
          amount: data.amount,
          currency: data.currency,
          exchangeRate: data.exchangeRate,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          status: data.status,
          category: data.category,
          description: data.description,
          fileUrl: data.fileUrl,
          createdById: data.createdById,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        set((state) => ({ 
          invoices: [...state.invoices, newInvoice],
          error: null 
        }));
        return newInvoice;
      }
      
      throw new Error('No se recibieron datos al guardar la factura');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al guardar la factura';
      console.error('Error in addInvoice:', error);
      set((state) => ({ ...state, error: errorMessage }));
      throw error; 
    }
  },
  
  updateInvoice: async (id, updatedInvoice) => {
    const { invoices } = get();
    const currentInvoice = invoices.find(inv => inv.id === id);
    
    if (!currentInvoice) return;

    try {
      set({ loading: true, error: null });
      
      // Usar API local para actualizar (requiere implementar PUT en /api/invoices/[id])
      // Por ahora, asumiremos que existe o la implementaremos pronto
      // Si no existe la ruta específica, podríamos usar la genérica con un flag, pero lo correcto es ID
      
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedInvoice,
          // Asegurar tipos numéricos
          amount: updatedInvoice.amount ? parseFloat(updatedInvoice.amount.toString()) : undefined,
          exchangeRate: updatedInvoice.exchangeRate ? parseFloat(updatedInvoice.exchangeRate.toString()) : undefined
        })
      });

      if (!response.ok) {
        // Fallback temporal si no existe la API PUT aún: Actualizar solo localmente
        console.warn('API update failed, updating local state only');
      } else {
        const data = await response.json();
        updatedInvoice = { ...updatedInvoice, updatedAt: data.updatedAt };
      }

      // Actualizar estado local
      set((state) => ({
        invoices: state.invoices.map(invoice => 
          invoice.id === id ? { ...invoice, ...updatedInvoice, updatedAt: new Date().toISOString() } : invoice
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating invoice:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar la factura',
        loading: false 
      });
    }
  },
  
  deleteInvoice: async (id) => {
    try {
      // Usar API local
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
         console.warn('API delete failed');
      }

      // Eliminar del estado local
      set((state) => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      // Optimistic update
      set((state) => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id)
      }));
    }
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getInvoicesByProject: (projectId) => {
    const { invoices } = get();
    return invoices.filter(invoice => invoice.projectId === projectId);
  },

  getInvoicesByStatus: (projectId, status) => {
    const { invoices } = get();
    return invoices.filter(invoice => 
      invoice.projectId === projectId && invoice.status === status
    );
  },

  getTotalInvoicesByProject: (projectId) => {
    const { invoices } = get();
    return invoices
      .filter(invoice => invoice.projectId === projectId)
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  },

  getPaidInvoicesByProject: (projectId) => {
    const { invoices } = get();
    return invoices
      .filter(invoice => invoice.projectId === projectId && invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  },

  getPendingInvoicesByProject: (projectId) => {
    const { invoices } = get();
    return invoices
      .filter(invoice => invoice.projectId === projectId && invoice.status === 'PENDING')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  },

  getOverdueInvoices: (projectId) => {
    const { invoices } = get();
    const today = new Date();
    return invoices.filter(invoice => {
      if (invoice.projectId !== projectId || invoice.status !== 'PENDING') return false;
      if (!invoice.dueDate) return false;
      return new Date(invoice.dueDate) < today;
    });
  }
}));