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
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
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
    const mockTasks: Task[] = [
      {
        id: '1',
        projectId: '1',
        title: 'Revisar planos estructurales',
        description: 'Verificar y aprobar planos del ingeniero estructural',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2024-02-15T00:00:00.000Z',
        assignedTo: '1',
        createdById: '1',
        createdAt: '2024-01-20T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        projectId: '1',
        title: 'Solicitar permisos municipales',
        description: 'Presentar documentación para permisos de construcción',
        status: 'TODO',
        priority: 'URGENT',
        dueDate: '2024-02-01T00:00:00.000Z',
        assignedTo: '1',
        createdById: '1',
        createdAt: '2024-01-22T00:00:00.000Z',
        updatedAt: '2024-01-22T00:00:00.000Z'
      },
      {
        id: '3',
        projectId: '2',
        title: 'Estudio de suelos',
        description: 'Realizar estudio geotécnico del terreno',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: '2024-01-30T00:00:00.000Z',
        assignedTo: '1',
        createdById: '1',
        createdAt: '2024-01-18T00:00:00.000Z',
        updatedAt: '2024-01-28T00:00:00.000Z'
      }
    ];
    setTasks(mockTasks);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesProject = !selectedProject || task.projectId === selectedProject;
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
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear tareas');
      return;
    }

    try {
      const taskData = {
        ...formData,
        createdById: user?.id || '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingTask) {
        setTasks(prev => prev.map(task => 
          task.id === editingTask.id ? { ...taskData, id: editingTask.id } : task
        ));
        toast.success('Tarea actualizada exitosamente');
      } else {
        setTasks(prev => [...prev, { ...taskData, id: Date.now().toString() }]);
        toast.success('Tarea creada exitosamente');
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
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Tarea eliminada exitosamente');
    }
  };

  const todoTasks = filteredTasks.filter(t => t.status === 'TODO').length;
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED').length;
  const urgentTasks = filteredTasks.filter(t => t.priority === 'URGENT').length;

  return (
    <div className="space-y-6">
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
                <SelectItem value="">Todos los proyectos</SelectItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex space-x-2">
                  <Badge className={getPriorityColor(task.priority)}>{getPriorityText(task.priority)}</Badge>
                </div>
              </div>
              <CardDescription>
                {getProjectName(task.projectId)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(task.status)}>{getStatusText(task.status)}</Badge>
                  {task.dueDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString('es-HN')}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3 border-t">
                  <div className="flex space-x-2">
                    {hasPermission('update') && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(task)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {hasPermission('delete') && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tareas</h3>
            <p className="text-gray-500">Crea tu primera tarea para comenzar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}