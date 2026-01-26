'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar, User } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useTaskStore } from '@/stores/task-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

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
}

export function TasksView() {
  const { projects } = useProjectStore();
  const { tasks, setTasks, addTask, updateTask, deleteTask, loading } = useTaskStore();
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: ''
  });

  const statuses = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar las tareas');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === 'all' || !selectedProject || task.projectId === selectedProject;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesProject && matchesSearch && matchesStatus;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Proyecto no encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'TODO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completada';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'TODO':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Urgente';
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Media';
      case 'LOW':
        return 'Baja';
      default:
        return priority;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debe iniciar sesión para crear tareas');
      return;
    }

    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear tareas');
      return;
    }

    if (!formData.projectId) {
      toast.error('Debe seleccionar un proyecto');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('El título de la tarea es requerido');
      return;
    }

    try {
      const taskData = {
        projectId: formData.projectId,
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        assignedTo: formData.assignedTo || null,
        createdById: user.id
      };

      if (editingTask) {
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description || null,
            status: formData.status,
            priority: formData.priority,
            dueDate: formData.dueDate || null,
            assignedTo: formData.assignedTo || null
          })
        });

        if (response.ok) {
          const updatedTask = await response.json();
          updateTask(editingTask.id, updatedTask);
          toast.success('Tarea actualizada exitosamente');
        } else {
          throw new Error('Error updating task');
        }
      } else {
        try {
          console.log('Enviando datos de tarea:', taskData);
          
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
          });

          const responseData = await response.json();
          
          if (response.ok) {
            addTask(responseData);
            toast.success('Tarea creada exitosamente');
          } else {
            console.error('Error del servidor al crear tarea:', {
              status: response.status,
              statusText: response.statusText,
              error: responseData
            });
            throw new Error(responseData.error || `Error del servidor: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error al enviar la solicitud:', error);
          throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
        }
      }

      setIsCreateDialogOpen(false);
      setEditingTask(null);
      setFormData({
        projectId: '',
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        assignedTo: ''
      });
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Error al guardar la tarea');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      projectId: task.projectId,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.split('T')[0] || '',
      assignedTo: task.assignedTo || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!hasPermission('delete')) {
      toast.error('No tienes permisos para eliminar tareas');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await deleteTask(taskId);
        toast.success('Tarea eliminada exitosamente');
      } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        toast.error(error instanceof Error ? error.message : 'Error al eliminar la tarea');
      }
    }
  };

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED').length;
  const urgentTasks = filteredTasks.filter(t => t.priority === 'URGENT').length;

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas y Pendientes</h1>
          <p className="text-gray-500 mt-1">Gestión de tareas y actividades del proyecto</p>
        </div>
        {hasPermission('create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                <DialogDescription>Crea una nueva tarea para el proyecto</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Proyecto *</Label>
                    <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un proyecto" /></SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{getStatusText(status)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridad</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority} value={priority}>{getPriorityText(priority)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha Límite</Label>
                    <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingTask ? 'Actualizar' : 'Crear'} Tarea</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoTasks}</div>
            <p className="text-xs text-gray-500">Por hacer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <AlertCircle className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-gray-500">Trabajando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-gray-500">Finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentTasks}</div>
            <p className="text-xs text-gray-500">Atención inmediata</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Search className="w-5 h-5 mr-2" />Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Buscar tareas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{getStatusText(status)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron tareas</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      {getPriorityText(task.priority)}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estado:</span>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Proyecto:</span>
                    <span className="text-sm font-medium">{getProjectName(task.projectId)}</span>
                  </div>

                  {task.dueDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Fecha límite:</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className={`text-sm ${isOverdue(task.dueDate) && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString('es-HN')}
                        </span>
                        {isOverdue(task.dueDate) && task.status !== 'COMPLETED' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-400">
                      Creada: {new Date(task.createdAt).toLocaleDateString('es-HN')}
                    </div>
                    <div className="flex space-x-1">
                      {hasPermission('edit') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(task)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {hasPermission('delete') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}