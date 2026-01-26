import { create } from 'zustand';

interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  assignedTo: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    name: string;
    email: string;
  };
  project?: {
    name: string;
    code: string;
  };
  createdBy?: {
    name: string;
    email: string;
  };
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (projectId: string, status: string) => Task[];
  getTasksByPriority: (projectId: string, priority: string) => Task[];
  getOverdueTasks: (projectId: string) => Task[];
  getTaskStats: (projectId: string) => {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    urgent: number;
    overdue: number;
  };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  
  addTask: async (task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: task.projectId,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assignedTo: task.assignedTo,
          createdById: task.createdById
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la tarea');
      }

      const newTask = await response.json();
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  updateTask: async (id, updatedTask) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar la tarea');
      }

      const updatedTaskData = await response.json();
      set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updatedTaskData } : task
        )
      }));
      return updatedTaskData;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  deleteTask: async (id) => {
    try {
      // Verificar si es un UUID válido
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!isValidUUID) {
        console.error('ID de tarea no válido:', id);
        throw new Error('ID de tarea no válido');
      }

      // Primero actualizamos el estado local para una mejor experiencia de usuario
      set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
      
      // Luego hacemos la llamada a la API
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // Si hay un error, revertimos el cambio en el estado local
        const errorData = await response.json();
        console.error('Error del servidor al eliminar tarea:', errorData);
        
        // Recargamos las tareas para sincronizar con el servidor
        const tasksResponse = await fetch('/api/tasks');
        if (tasksResponse.ok) {
          const tasks = await tasksResponse.json();
          set({ tasks });
        }
        
        throw new Error(errorData.error || 'Error al eliminar la tarea');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getTasksByProject: (projectId) => {
    const { tasks } = get();
    return tasks.filter(task => task.projectId === projectId);
  },

  getTasksByStatus: (projectId, status) => {
    const { tasks } = get();
    return tasks.filter(task => task.projectId === projectId && task.status === status);
  },

  getTasksByPriority: (projectId, priority) => {
    const { tasks } = get();
    return tasks.filter(task => 
      task.projectId === projectId && task.priority === priority
    );
  },

  getOverdueTasks: (projectId) => {
    const { tasks } = get();
    const today = new Date();
    return tasks.filter(task => {
      if (task.projectId !== projectId || task.status === 'COMPLETED') return false;
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < today;
    });
  },

  getTaskStats: (projectId) => {
    const { tasks } = get();
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const today = new Date();

    return {
      total: projectTasks.length,
      todo: projectTasks.filter(t => t.status === 'TODO').length,
      inProgress: projectTasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: projectTasks.filter(t => t.status === 'COMPLETED').length,
      urgent: projectTasks.filter(t => t.priority === 'URGENT').length,
      overdue: projectTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < today && t.status !== 'COMPLETED'
      ).length
    };
  }
}));