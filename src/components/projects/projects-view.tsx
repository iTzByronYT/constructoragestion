"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectBudgetTable } from "@/components/projects/project-budget-table";
import { useProjectStore } from "@/stores/project-store";
import { useAuthStore } from "@/stores/auth-store";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export function ProjectsView() {
  const { projects, setProjects, addProject, updateProject, deleteProject, loadProjects } = useProjectStore();
  const { user, hasPermission } = useAuthStore();
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
    estimatedBudget: '',
    currency: 'HNL',
    exchangeRate: '24.5',
    status: 'PLANNING',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('El nombre del proyecto es requerido');
      return;
    }

    if (!user?.id) {
      toast.error('No se pudo identificar el usuario');
      return;
    }

    try {
      if (editingProject) {
        // Actualizar proyecto existente
        const response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            code: formData.code || null,
            description: formData.description || null,
            location: formData.location || null,
            estimatedBudget: formData.estimatedBudget,
            currency: formData.currency,
            exchangeRate: formData.exchangeRate,
            status: formData.status,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar el proyecto');
        }

        await loadProjects();
        toast.success('Proyecto actualizado');
      } else {
        // Crear nuevo proyecto
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            code: formData.code.trim() || null,
            description: formData.description.trim() || null,
            location: formData.location.trim() || null,
            estimatedBudget: formData.estimatedBudget,
            currency: formData.currency,
            exchangeRate: formData.exchangeRate,
            status: formData.status,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            createdById: user.id
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al crear el proyecto');
        }

        await loadProjects();
        toast.success('Proyecto creado exitosamente');
      }

      setIsCreateDialogOpen(false);
      setEditingProject(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        location: '',
        estimatedBudget: '',
        currency: 'HNL',
        exchangeRate: '24.5',
        status: 'PLANNING',
        startDate: '',
        endDate: ''
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el proyecto');
    }
  };
  const filtered = projects.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Gestión y seguimiento de obras y proyectos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
                <DialogDescription>Crea un nuevo proyecto de construcción</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Proyecto *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Código</Label>
                    <Input id="code" value={formData.code} onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} placeholder="PRJ-001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input id="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Tegucigalpa, Francisco Morazán" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedBudget">Presupuesto Estimado *</Label>
                    <Input id="estimatedBudget" type="number" step="0.01" value={formData.estimatedBudget} onChange={(e) => setFormData(prev => ({ ...prev, estimatedBudget: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HNL">Lempiras (HNL)</SelectItem>
                        <SelectItem value="USD">Dólares (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNING">Planificación</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                        <SelectItem value="ON_HOLD">Pausado</SelectItem>
                        <SelectItem value="COMPLETED">Completado</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Finalización</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {editingProject && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={async () => {
                        if (confirm('¿Estás seguro de que deseas eliminar este proyecto?\n\n' + editingProject.name)) {
                          try {
                            const response = await fetch(`/api/projects/${editingProject.id}`, {
                              method: 'DELETE'
                            });

                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || 'Error al eliminar el proyecto');
                            }

                            await loadProjects();
                            setIsCreateDialogOpen(false);
                            setEditingProject(null);
                            toast.success('Proyecto eliminado exitosamente');
                          } catch (error) {
                            console.error('Error deleting project:', error);
                            toast.error(error instanceof Error ? error.message : 'Error al eliminar el proyecto');
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Proyecto
                    </Button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">{editingProject ? 'Actualizar' : 'Crear'} Proyecto</Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Listado de Proyectos</span>
          </CardTitle>
          <CardDescription>Busca y selecciona un proyecto para ver su presupuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2 w-full md:w-80">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar por nombre o código"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto -mx-4 sm:mx-0">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-right">Presupuesto Estimado</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow 
                    key={p.id}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedProject?.id === p.id ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''}`}
                    onClick={() => setSelectedProject(p)}
                  >
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.code}</TableCell>
                    <TableCell className="text-right">{p.estimatedBudget?.toLocaleString("es-HN", { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{p.currency || "HNL"}</TableCell>
                    <TableCell>{p.status || "PLANNING"}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(p);
                          setFormData({
                            name: p.name,
                            code: p.code || '',
                            description: p.description || '',
                            location: p.location || '',
                            estimatedBudget: p.estimatedBudget?.toString() || '',
                            currency: p.currency || 'HNL',
                            exchangeRate: p.exchangeRate?.toString() || '24.5',
                            status: p.status || 'PLANNING',
                            startDate: p.startDate?.split('T')[0] || '',
                            endDate: p.endDate?.split('T')[0] || ''
                          });
                          setIsCreateDialogOpen(true);
                        }}
                        title="Haz clic aquí para editar o eliminar"
                        className="text-blue-600"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar/Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay proyectos
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedProject && (
        <Tabs defaultValue="budget" className="w-full">
          <TabsList>
            <TabsTrigger value="budget">Presupuesto del Proyecto: {selectedProject.name}</TabsTrigger>
          </TabsList>
          <TabsContent value="budget">
            <ProjectBudgetTable
              projectId={selectedProject.id}
              projectName={selectedProject.name}
              currency={selectedProject.currency || "HNL"}
              exchangeRate={selectedProject.exchangeRate || 24.5}
              estimatedBudget={selectedProject.estimatedBudget || 0}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
