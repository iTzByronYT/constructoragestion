import { create } from 'zustand';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  estimatedBudget: number;
  actualBudget: number;
  currency: string;
  exchangeRate: number;
  location: string | null;
  clientId: string | null;
  contractorId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setLoading: (loading: boolean) => void;
  loadProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: async (project) => {
    // Esta función ya no se usa directamente, el componente usa el API
    // Simplemente agregar al estado local
    set((state) => ({ projects: [...state.projects, project] }));
  },
  updateProject: async (id, updatedProject) => {
    // Esta función ya no se usa directamente, el componente usa el API
    // Simplemente actualizar el estado local
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...updatedProject } : p),
      currentProject: state.currentProject?.id === id 
        ? { ...state.currentProject, ...updatedProject } 
        : state.currentProject
    }));
  },
  deleteProject: async (id) => {
    // Esta función ya no se usa directamente, el componente usa el API
    // Simplemente eliminar del estado local
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject
    }));
  },
  setLoading: (loading) => set({ loading }),
  loadProjects: async () => {
    set({ loading: true });
    try {
      console.log('Iniciando carga de proyectos...');
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta de la API:', response.status, errorText);
        throw new Error(`Error al cargar los proyectos: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Proyectos cargados:', data);
      
      // Verificar que los datos sean un array
      if (!Array.isArray(data)) {
        console.error('La respuesta de la API no es un array:', data);
        throw new Error('Formato de datos inválido');
      }
      
      // Actualizar el estado con los proyectos
      set({ projects: data, loading: false });
    } catch (error) {
      console.error('Error en loadProjects:', error);
      // Mostrar el error en la consola del navegador
      toast.error(error instanceof Error ? error.message : 'Error desconocido al cargar proyectos');
      set({ loading: false });
    }
  }
}));