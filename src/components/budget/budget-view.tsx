'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Download,
  Package,
  ClipboardList,
  FileCheck,
  ShoppingCart,
  ArrowDownCircle,
  ArrowUpCircle,
  FileEdit,
  ChevronDown,
  PlusCircle,
  Folder
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProjectStore } from '@/stores/project-store';
import { useBudgetStore } from '@/stores/budget-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

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

export function BudgetView() {
  const { projects } = useProjectStore();
  const { budgetItems, setBudgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem, loading } = useBudgetStore();
  const { user, hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState('catalogo');
  const [selectedProject, setSelectedProject] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Sincronizar formData.projectId con selectedProject cuando cambia
  useEffect(() => {
    if (selectedProject && selectedProject !== 'all') {
      setFormData(prev => ({
        ...prev,
        projectId: selectedProject
      }));
    }
  }, [selectedProject]);

  // Forzar la actualización del formData cuando se abre el diálogo de creación
  useEffect(() => {
    if (isCreateDialogOpen && selectedProject && selectedProject !== 'all') {
      setFormData(prev => ({
        ...prev,
        projectId: selectedProject
      }));
    }
  }, [isCreateDialogOpen, selectedProject]);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [materialCategories, setMaterialCategories] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [catalogMaterials, setCatalogMaterials] = useState<any[]>([]);
  const [projectMaterials, setProjectMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    category: '',
    description: '',
    quantity: '',
    unitPrice: '',
    currency: 'HNL'
  });
  const [materialFormData, setMaterialFormData] = useState({
    name: '',
    code: '',
    description: '',
    unit: 'unidad',
    basePrice: '',
    currency: 'HNL',
    category: ''
  });
  const [assignFormData, setAssignFormData] = useState({
    materialId: '',
    quantity: '',
    minimumStock: '',
    unitPrice: '',
    currency: 'HNL',
    notes: ''
  });
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  type PriorityType = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

  const [requestFormData, setRequestFormData] = useState({
    projectId: '',
    materialId: '',
    quantity: '',
    notes: '',
    priority: 'NORMAL' as PriorityType,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle material request submission
  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestFormData.projectId || !requestFormData.materialId || !requestFormData.quantity) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/material-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestFormData,
          quantity: Number(requestFormData.quantity),
          status: 'PENDING'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la solicitud');
      }

      await response.json();
      toast.success('Solicitud de materiales creada exitosamente');
      
      // Cerrar el diálogo
      setIsRequestDialogOpen(false);
      
      // Reset form
      setRequestFormData({
        projectId: '',
        materialId: '',
        quantity: '',
        notes: '',
        priority: 'NORMAL',
      });
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Mano de Obra',
    'Materiales',
    'Equipos',
    'Subcontratos',
    'Permisos',
    'Transporte',
    'Seguros',
    'Administración',
    'Imprevistos',
    'Otros'
  ];

  useEffect(() => {
    loadBudgetItems();
    loadCatalogMaterials();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject && activeTab === 'materiales') {
      loadProjectMaterials();
    }
  }, [selectedProject, activeTab]);

  useEffect(() => {
    const uniqueCategories = new Set<string>();
    catalogMaterials.forEach(material => {
      if (material.category) {
        uniqueCategories.add(material.category);
      }
    });
    setMaterialCategories(Array.from(uniqueCategories).sort());
  }, [catalogMaterials]);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const projectsData = await response.json();
        useProjectStore.getState().setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadBudgetItems = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        setBudgetItems(data);
      }
    } catch (error) {
      console.error('Error loading budget items:', error);
      toast.error('Error al cargar los presupuestos');
    }
  };

  const loadCatalogMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (response.ok) {
        const data = await response.json();
        setCatalogMaterials(data);
      }
    } catch (error) {
      console.error('Error loading catalog materials:', error);
      toast.error('Error al cargar el catálogo de materiales');
    }
  };

  const loadProjectMaterials = async () => {
    if (!selectedProject) return;
    
    setLoadingMaterials(true);
    try {
      const response = await fetch(`/api/project-materials?projectId=${selectedProject}`);
      if (response.ok) {
        const data = await response.json();
        setProjectMaterials(data);
      }
    } catch (error) {
      console.error('Error loading project materials:', error);
      toast.error('Error al cargar los materiales del proyecto');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const filteredItems = budgetItems.filter(item => {
    const matchesProject = selectedProject === 'all' || !selectedProject || item.projectId === selectedProject;
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesProject && matchesSearch && matchesCategory;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Proyecto no encontrado';
  };

  const getProjectExchangeRate = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.exchangeRate || 24.5;
  };

  const formatCurrency = (amount: number, currency: string, exchangeRate: number) => {
    if (currency === 'HNL') {
      return `L ${amount.toLocaleString('es-HN')}`;
    }
    return `$ ${amount.toLocaleString('es-HN')}`;
  };

  const getUSDAmount = (amount: number, exchangeRate: number) => {
    return `$ ${(amount / exchangeRate).toLocaleString('es-HN', { maximumFractionDigits: 0 })}`;
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear presupuestos');
      return;
    }

    // Asegurarse de que tenemos un projectId válido
    const projectIdToUse = selectedProject && selectedProject !== 'all' 
      ? selectedProject 
      : formData.projectId;

    if (!projectIdToUse) {
      toast.error('Por favor selecciona un proyecto antes de continuar');
      return;
    }

    try {
      const quantity = parseFloat(formData.quantity);
      const unitPrice = parseFloat(formData.unitPrice);
      const totalPrice = quantity * unitPrice;

      const budgetData = {
        projectId: projectIdToUse, // Usar el ID del proyecto seleccionado
        category: formData.category,
        description: formData.description,
        quantity,
        unitPrice,
        totalPrice,
        currency: formData.currency,
        createdById: user?.id || 'system' // Usar 'system' como respaldo si no hay usuario
      };
      
      console.log('Enviando datos del presupuesto:', budgetData);

      if (editingItem) {
        const response = await fetch(`/api/budgets/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: formData.category,
            description: formData.description,
            quantity,
            unitPrice,
            currency: formData.currency
          })
        });

        if (response.ok) {
          const updatedItem = await response.json();
          updateBudgetItem(editingItem.id, updatedItem);
          toast.success('Item de presupuesto actualizado');
        } else {
          throw new Error('Error updating budget item');
        }
      } else {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetData)
        });

        if (response.ok) {
          const newItem = await response.json();
          addBudgetItem(newItem);
          toast.success('Item de presupuesto creado');
        } else {
          throw new Error('Error creating budget item');
        }
      }

      setIsCreateDialogOpen(false);
      setEditingItem(null);
      setFormData({
        projectId: '',
        category: '',
        description: '',
        quantity: '',
        unitPrice: '',
        currency: 'HNL'
      });
    } catch (error) {
      console.error('Error saving budget item:', error);
      toast.error('Error al guardar el item de presupuesto');
    }
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      projectId: item.projectId,
      category: item.category,
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      currency: item.currency
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!hasPermission('delete')) {
      toast.error('No tienes permisos para eliminar presupuestos');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este item del presupuesto?')) {
      try {
        const response = await fetch(`/api/budgets/${itemId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          deleteBudgetItem(itemId);
          toast.success('Item eliminado exitosamente');
        } else {
          throw new Error('Error deleting budget item');
        }
      } catch (error) {
        console.error('Error deleting budget item:', error);
        toast.error('Error al eliminar el item');
      }
    }
  };

  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para agregar materiales');
      return;
    }

    if (!user?.id) {
      toast.error('No se pudo identificar el usuario');
      return;
    }

    try {
      const materialData = {
        name: materialFormData.name,
        code: materialFormData.code.trim() || null,
        description: materialFormData.description.trim() || null,
        unit: materialFormData.unit,
        basePrice: materialFormData.basePrice,
        currency: materialFormData.currency,
        category: materialFormData.category.trim() || null,
        createdById: user.id
      };

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materialData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el material');
      }

      toast.success('Material agregado al catálogo exitosamente');
      await loadCatalogMaterials();
      
      setIsMaterialDialogOpen(false);
      setMaterialFormData({
        name: '',
        code: '',
        description: '',
        unit: 'unidad',
        basePrice: '',
        currency: 'HNL',
        category: ''
      });
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar el material');
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!hasPermission('delete')) {
      toast.error('No tienes permisos para eliminar materiales');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este material del catálogo? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`/api/materials/${materialId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al eliminar el material');
        }

        // Actualizar la lista de materiales
        setCatalogMaterials(prev => prev.filter(m => m.id !== materialId));
        toast.success('Material eliminado correctamente');
      } catch (error: unknown) {
        console.error('Error deleting material:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el material';
        toast.error(errorMessage);
      }
    }
  };

  const handleAssignMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !assignFormData.materialId) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const response = await fetch('/api/project-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject,
          materialId: assignFormData.materialId,
          quantity: parseFloat(assignFormData.quantity),
          minimumStock: parseFloat(assignFormData.minimumStock) || 0,
          unitPrice: parseFloat(assignFormData.unitPrice),
          currency: assignFormData.currency,
          notes: assignFormData.notes,
          createdById: user?.id || '1'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al asignar el material');
      }

      const data = await response.json();
      
      // Actualizar la lista de materiales del proyecto
      setProjectMaterials(prev => [...prev, data]);
      
      // Cerrar el diálogo y limpiar el formulario
      setShowAssignDialog(false);
      setAssignFormData({
        materialId: '',
        quantity: '',
        minimumStock: '',
        unitPrice: '',
        currency: 'HNL',
        notes: ''
      });
      
      toast.success('Material asignado correctamente al proyecto');
    } catch (error: unknown) {
      console.error('Error assigning material:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al asignar el material';
      toast.error(errorMessage);
    }
  };

  const handleExportPDF = () => {
    toast.info('Función de exportación PDF en desarrollo');
  };

  const handleExportExcel = () => {
    toast.info('Función de exportación Excel en desarrollo');
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const projectBudgetItems = selectedProject && selectedProject !== 'all' 
    ? filteredItems.filter(item => item.projectId === selectedProject)
    : filteredItems;

  const getTotalByCategory = () => {
    const totals: { [key: string]: number } = {};
    projectBudgetItems.forEach(item => {
      totals[item.category] = (totals[item.category] || 0) + item.totalPrice;
    });
    return totals;
  };

  const getTotalBudget = () => {
    return projectBudgetItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const categoryTotals = getTotalByCategory();
  const totalBudget = getTotalBudget();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos y Gestión</h1>
          <p className="text-gray-500 mt-1">Control completo de presupuestos, materiales, cotizaciones y órdenes</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          {hasPermission('create') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Item de Presupuesto
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Editar Item de Presupuesto' : 'Nuevo Item de Presupuesto'}
                </DialogTitle>
                <DialogDescription>
                  Agrega un nuevo item al presupuesto del proyecto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Proyecto *</Label>
                    <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ej: Albañiles y ayudantes"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Precio Unitario *</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HNL">Lempiras (HNL)</SelectItem>
                        <SelectItem value="USD">Dólares (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.quantity && formData.unitPrice && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(parseFloat(formData.quantity) * parseFloat(formData.unitPrice), formData.currency, 24.5)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Actualizar' : 'Crear'} Item
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* Selector de Proyecto y Resumen */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="project-filter">Seleccionar Proyecto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-filter" className="w-full mt-2">
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} {project.code && `(${project.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProjectData && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">{selectedProjectData.name}</p>
                  {selectedProjectData.description && (
                    <p className="text-xs text-blue-700 mt-1">{selectedProjectData.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-blue-800">
                    <span>📍 {selectedProjectData.location || 'Sin ubicación'}</span>
                    <span>📊 {selectedProjectData.status}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-700 font-medium">Presupuesto Estimado</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    {selectedProjectData 
                      ? formatCurrency(selectedProjectData.estimatedBudget, selectedProjectData.currency, selectedProjectData.exchangeRate)
                      : formatCurrency(totalBudget, 'HNL', 24.5)
                    }
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-700 font-medium">Gasto Real</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">
                    {selectedProjectData 
                      ? formatCurrency(selectedProjectData.actualBudget, selectedProjectData.currency, selectedProjectData.exchangeRate)
                      : formatCurrency(totalBudget, 'HNL', 24.5)
                    }
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle Financiero del Proyecto Seleccionado */}
      {selectedProjectData && selectedProject !== 'all' && (
        <Card className="border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-blue-900 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Detalle Financiero - {selectedProjectData.name}
            </CardTitle>
            <CardDescription>Desglose completo del presupuesto y gastos del proyecto</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Materiales Asignados */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-medium text-purple-700">Materiales Asignados</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {projectMaterials.length}
                    </p>
                  </div>
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-xs text-purple-600">
                  Valor total:{' '}
                  {formatCurrency(
                    projectMaterials.reduce((sum, pm) => sum + (pm.quantity * pm.unitPrice), 0),
                    selectedProjectData.currency,
                    selectedProjectData.exchangeRate
                  )}
                </p>
              </div>

              {/* Items de Presupuesto */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-blue-700 font-medium">Items de Presupuesto</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {projectBudgetItems.length}
                    </p>
                  </div>
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-blue-600">
                  Valor total:{' '}
                  {formatCurrency(
                    projectBudgetItems.reduce((sum, item) => sum + item.totalPrice, 0),
                    selectedProjectData.currency,
                    selectedProjectData.exchangeRate
                  )}
                </p>
              </div>

              {/* Balance */}
              <div className={`p-4 rounded-lg border ${
                selectedProjectData.estimatedBudget >= selectedProjectData.actualBudget
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className={`text-xs font-medium ${
                      selectedProjectData.estimatedBudget >= selectedProjectData.actualBudget
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>Balance</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      selectedProjectData.estimatedBudget >= selectedProjectData.actualBudget
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}>
                      {formatCurrency(
                        selectedProjectData.estimatedBudget - selectedProjectData.actualBudget,
                        selectedProjectData.currency,
                        selectedProjectData.exchangeRate
                      )}
                    </p>
                  </div>
                  {selectedProjectData.estimatedBudget >= selectedProjectData.actualBudget ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <p className={`text-xs ${
                  selectedProjectData.estimatedBudget >= selectedProjectData.actualBudget
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {selectedProjectData.estimatedBudget >= selectedProjectData.actualBudget
                    ? 'Dentro del presupuesto'
                    : 'Sobre presupuesto'
                  }
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso del Presupuesto</span>
                <span className="text-sm text-gray-600">
                  {selectedProjectData.estimatedBudget > 0
                    ? Math.round((selectedProjectData.actualBudget / selectedProjectData.estimatedBudget) * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    (selectedProjectData.actualBudget / selectedProjectData.estimatedBudget) * 100 > 100
                      ? 'bg-red-600'
                      : (selectedProjectData.actualBudget / selectedProjectData.estimatedBudget) * 100 > 80
                      ? 'bg-orange-500'
                      : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      ((selectedProjectData.actualBudget / selectedProjectData.estimatedBudget) * 100),
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sub-menú de Pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto">
          <TabsTrigger value="catalogo" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </TabsTrigger>
          <TabsTrigger value="materiales" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Proyecto</span>
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Solicitudes</span>
          </TabsTrigger>
          <TabsTrigger value="cotizaciones" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Cotizaciones</span>
          </TabsTrigger>
          <TabsTrigger value="ordenes-compra" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Órdenes</span>
          </TabsTrigger>
          <TabsTrigger value="ingresos" className="flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Ingresos</span>
          </TabsTrigger>
          <TabsTrigger value="gastos" className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Gastos</span>
          </TabsTrigger>
          <TabsTrigger value="ordenes-cambio" className="flex items-center gap-2">
            <FileEdit className="w-4 h-4" />
            <span className="hidden sm:inline">Cambios</span>
          </TabsTrigger>
        </TabsList>

        {/* Catálogo de Materiales */}
        <TabsContent value="catalogo" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Catálogo General de Materiales
                  </CardTitle>
                  <CardDescription>Lista maestra de todos los materiales disponibles</CardDescription>
                </div>
                {hasPermission('create') && (
                  <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Material
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                          Categorías existentes
                        </div>
                        {materialCategories.length > 0 ? (
                          materialCategories.map((category) => (
                            <DropdownMenuItem 
                              key={category}
                              onClick={() => {
                                setMaterialFormData(prev => ({
                                  ...prev,
                                  category: category
                                }));
                                setIsMaterialDialogOpen(true);
                              }}
                              className="cursor-pointer px-3 py-2 text-sm flex items-center gap-2"
                            >
                              <Folder className="w-4 h-4 text-muted-foreground" />
                              <span>{category}</span>
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No hay categorías aún
                          </div>
                        )}
                        <div className="border-t my-1"></div>
                        <DropdownMenuItem 
                          onClick={() => {
                            setMaterialFormData(prev => ({
                              ...prev,
                              category: ''
                            }));
                            setIsMaterialDialogOpen(true);
                          }}
                          className="cursor-pointer px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Crear nueva categoría
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Material al Catálogo</DialogTitle>
                        <DialogDescription>
                          Crea un nuevo material que podrás asignar a cualquier proyecto
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleMaterialSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cat-code">Código</Label>
                            <Input
                              id="cat-code"
                              value={materialFormData.code}
                              onChange={(e) => setMaterialFormData(prev => ({ ...prev, code: e.target.value }))}
                              placeholder="Ej: MAT-001"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cat-category">Categoría</Label>
                            <div className="flex space-x-2">
                              <Select 
                                value={materialFormData.category} 
                                onValueChange={(value) => setMaterialFormData(prev => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className="max-h-60 overflow-y-auto">
                                    {materialCategories.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                    {materialCategories.length === 0 && (
                                      <div className="px-3 py-2 text-sm text-muted-foreground">
                                        No hay categorías
                                      </div>
                                    )}
                                  </div>
                                </SelectContent>
                              </Select>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={() => {
                                  const newCategory = prompt('Ingrese el nombre de la nueva categoría:');
                                  if (newCategory && newCategory.trim() !== '') {
                                    setMaterialFormData(prev => ({ ...prev, category: newCategory.trim() }));
                                    if (!materialCategories.includes(newCategory.trim())) {
                                      setMaterialCategories(prev => [...prev, newCategory.trim()].sort());
                                    }
                                  }
                                }}
                                title="Crear nueva categoría"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {materialFormData.category && materialCategories.includes(materialFormData.category) && (
                              <p className="text-xs text-muted-foreground">
                                Categoría existente
                              </p>
                            )}
                            {materialFormData.category && !materialCategories.includes(materialFormData.category) && (
                              <p className="text-xs text-blue-600">
                                Nueva categoría: {materialFormData.category}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cat-name">Nombre del Material *</Label>
                          <Input
                            id="cat-name"
                            value={materialFormData.name}
                            onChange={(e) => setMaterialFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ej: Cemento Portland"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cat-description">Descripción</Label>
                          <Textarea
                            id="cat-description"
                            value={materialFormData.description}
                            onChange={(e) => setMaterialFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descripción del material"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cat-unit">Unidad *</Label>
                            <Select value={materialFormData.unit} onValueChange={(value) => setMaterialFormData(prev => ({ ...prev, unit: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unidad">Unidad</SelectItem>
                                <SelectItem value="kg">Kilogramos</SelectItem>
                                <SelectItem value="m">Metro</SelectItem>
                                <SelectItem value="m2">Metro cuadrado</SelectItem>
                                <SelectItem value="m3">Metro cúbico</SelectItem>
                                <SelectItem value="litro">Litro</SelectItem>
                                <SelectItem value="bolsa">Bolsa</SelectItem>
                                <SelectItem value="pieza">Pieza</SelectItem>
                                <SelectItem value="caja">Caja</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cat-basePrice">Precio Base *</Label>
                            <Input
                              id="cat-basePrice"
                              type="number"
                              step="0.01"
                              value={materialFormData.basePrice}
                              onChange={(e) => setMaterialFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit">
                            Agregar al Catálogo
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {catalogMaterials.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay materiales en el catálogo</p>
                  <p className="text-sm mt-2">Agrega tu primer material para comenzar</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium">Código</th>
                        <th className="text-left p-3 font-medium">Nombre</th>
                        <th className="text-left p-3 font-medium">Categoría</th>
                        <th className="text-left p-3 font-medium">Descripción</th>
                        <th className="text-center p-3 font-medium">Unidad</th>
                        <th className="text-right p-3 font-medium">Precio Base</th>
                        <th className="text-center p-3 font-medium">Moneda</th>
                        <th className="text-center p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalogMaterials.map((material) => (
                        <tr key={material.id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">{material.code || '-'}</td>
                          <td className="p-3">{material.name}</td>
                          <td className="p-3 text-gray-600">{material.category || '-'}</td>
                          <td className="p-3 text-gray-600">{material.description || '-'}</td>
                          <td className="p-3 text-center">{material.unit}</td>
                          <td className="p-3 text-right">
                            {formatCurrency(material.basePrice, material.currency, 24.5)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary">{material.currency}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleDeleteMaterial(material.id)}
                              title="Eliminar material"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Estos materiales estarán disponibles para asignar a cualquier proyecto desde la pestaña "Proyecto"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listado de Materiales */}
        <TabsContent value="materiales" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Listado de Materiales
              </CardTitle>
              <CardDescription>Gestión completa del inventario de materiales del proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtro de proyecto */}
              <div className="mb-4">
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de materiales o placeholder */}
              {!selectedProject ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Selecciona un proyecto</p>
                  <p className="text-sm mt-2">Elige un proyecto para ver sus materiales</p>
                </div>
              ) : loadingMaterials ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Cargando materiales...</p>
                </div>
              ) : projectMaterials.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hay materiales asignados</p>
                  <p className="text-sm mt-2">Selecciona materiales del catálogo para asignar a este proyecto</p>
                  {hasPermission('create') && (
                    <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                      <DialogTrigger asChild>
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Asignar Material del Catálogo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Asignar Material al Proyecto</DialogTitle>
                          <DialogDescription>
                            Selecciona un material del catálogo y asígnalo al proyecto
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAssignMaterial} className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Materiales Disponibles *</Label>
                                  <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                      placeholder="Buscar material por nombre, código o categoría..."
                                      value={materialSearchTerm}
                                      onChange={(e) => setMaterialSearchTerm(e.target.value)}
                                      className="pl-10"
                                    />
                                  </div>
                                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                                    {catalogMaterials.length === 0 ? (
                                      <div className="p-4 text-center text-gray-500">
                                        <p className="text-sm">No hay materiales en el catálogo</p>
                                        <p className="text-xs mt-1">Agrega materiales en la pestaña "Catálogo"</p>
                                      </div>
                                    ) : (
                                      (() => {
                                        const filteredMaterials = catalogMaterials.filter(material => {
                                          const searchLower = materialSearchTerm.toLowerCase();
                                          return material.name.toLowerCase().includes(searchLower) ||
                                                 material.code?.toLowerCase().includes(searchLower) ||
                                                 material.category?.toLowerCase().includes(searchLower);
                                        });
                                        
                                        if (filteredMaterials.length === 0) {
                                          return (
                                            <div className="p-4 text-center text-gray-500">
                                              <p className="text-sm">No se encontraron materiales</p>
                                              <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                                            </div>
                                          );
                                        }
                                        
                                        return (
                                          <div className="divide-y">
                                            {filteredMaterials.map(material => (
                                          <div
                                            key={material.id}
                                            onClick={() => {
                                              setAssignFormData(prev => ({ 
                                                ...prev, 
                                                materialId: material.id,
                                                unitPrice: material.basePrice.toString(),
                                                currency: material.currency
                                              }));
                                            }}
                                            className={`p-3 cursor-pointer transition-colors ${
                                              assignFormData.materialId === material.id 
                                                ? 'bg-blue-50 border-l-4 border-blue-600' 
                                                : 'hover:bg-gray-50'
                                            }`}
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                  {material.code && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {material.code}
                                                    </Badge>
                                                  )}
                                                  <span className="font-medium">{material.name}</span>
                                                </div>
                                                {material.description && (
                                                  <p className="text-xs text-gray-500 mt-1">{material.description}</p>
                                                )}
                                                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                                  <span>📦 {material.unit}</span>
                                                  {material.category && <span>🏷️ {material.category}</span>}
                                                </div>
                                              </div>
                                              <div className="text-right ml-4">
                                                <p className="font-semibold text-blue-600">
                                                  {formatCurrency(material.basePrice, material.currency, 24.5)}
                                                </p>
                                                <p className="text-xs text-gray-500">{material.currency}</p>
                                              </div>
                                            </div>
                                          </div>
                                            ))}
                                          </div>
                                        );
                                      })()
                                    )}
                                  </div>
                                  {assignFormData.materialId && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                      <p className="text-sm text-green-800 font-medium">
                                        ✓ Material seleccionado: {catalogMaterials.find(m => m.id === assignFormData.materialId)?.name}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="assign-quantity-empty">Cantidad *</Label>
                                    <Input
                                      id="assign-quantity-empty"
                                      type="number"
                                      step="0.01"
                                      value={assignFormData.quantity}
                                      onChange={(e) => setAssignFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="assign-minimumStock-empty">Stock Mínimo *</Label>
                                    <Input
                                      id="assign-minimumStock-empty"
                                      type="number"
                                      step="0.01"
                                      value={assignFormData.minimumStock}
                                      onChange={(e) => setAssignFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="assign-unitPrice-empty">Precio Unitario *</Label>
                                    <Input
                                      id="assign-unitPrice-empty"
                                      type="number"
                                      step="0.01"
                                      value={assignFormData.unitPrice}
                                      onChange={(e) => setAssignFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="assign-notes-empty">Notas (opcional)</Label>
                                  <Textarea
                                    id="assign-notes-empty"
                                    value={assignFormData.notes}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Notas adicionales sobre este material en el proyecto"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                                    Cancelar
                                  </Button>
                                  <Button type="submit">
                                    Asignar al Proyecto
                                  </Button>
                                </div>
                              </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{projectMaterials.length} materiales asignados</p>
                    <div className="flex gap-2">
                      {hasPermission('create') && (
                        <>
                          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                            <DialogTrigger asChild>
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Asignar Material
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Asignar Material al Proyecto</DialogTitle>
                                <DialogDescription>
                                  Selecciona un material del catálogo y asígnalo al proyecto
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleAssignMaterial} className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Materiales Disponibles *</Label>
                                  <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                      placeholder="Buscar material por nombre, código o categoría..."
                                      value={materialSearchTerm}
                                      onChange={(e) => setMaterialSearchTerm(e.target.value)}
                                      className="pl-10"
                                    />
                                  </div>
                                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                                    {catalogMaterials.length === 0 ? (
                                      <div className="p-4 text-center text-gray-500">
                                        <p className="text-sm">No hay materiales en el catálogo</p>
                                        <p className="text-xs mt-1">Agrega materiales en la pestaña "Catálogo"</p>
                                      </div>
                                    ) : (
                                      (() => {
                                        const filteredMaterials = catalogMaterials.filter(material => {
                                          const searchLower = materialSearchTerm.toLowerCase();
                                          return material.name.toLowerCase().includes(searchLower) ||
                                                 material.code?.toLowerCase().includes(searchLower) ||
                                                 material.category?.toLowerCase().includes(searchLower);
                                        });
                                        
                                        if (filteredMaterials.length === 0) {
                                          return (
                                            <div className="p-4 text-center text-gray-500">
                                              <p className="text-sm">No se encontraron materiales</p>
                                              <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                                            </div>
                                          );
                                        }
                                        
                                        return (
                                          <div className="divide-y">
                                            {filteredMaterials.map(material => (
                                          <div
                                            key={material.id}
                                            onClick={() => {
                                              setAssignFormData(prev => ({ 
                                                ...prev, 
                                                materialId: material.id,
                                                unitPrice: material.basePrice.toString(),
                                                currency: material.currency
                                              }));
                                            }}
                                            className={`p-3 cursor-pointer transition-colors ${
                                              assignFormData.materialId === material.id 
                                                ? 'bg-blue-50 border-l-4 border-blue-600' 
                                                : 'hover:bg-gray-50'
                                            }`}
                                          >
                                            <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                  {material.code && (
                                                    <Badge variant="outline" className="text-xs">
                                                      {material.code}
                                                    </Badge>
                                                  )}
                                                  <span className="font-medium">{material.name}</span>
                                                </div>
                                                {material.description && (
                                                  <p className="text-xs text-gray-500 mt-1">{material.description}</p>
                                                )}
                                                <div className="flex gap-4 mt-2 text-xs text-gray-600">
                                                  <span>📦 {material.unit}</span>
                                                  {material.category && <span>🏷️ {material.category}</span>}
                                                </div>
                                              </div>
                                              <div className="text-right ml-4">
                                                <p className="font-semibold text-blue-600">
                                                  {formatCurrency(material.basePrice, material.currency, 24.5)}
                                                </p>
                                                <p className="text-xs text-gray-500">{material.currency}</p>
                                              </div>
                                            </div>
                                          </div>
                                            ))}
                                          </div>
                                        );
                                      })()
                                    )}
                                  </div>
                                  {assignFormData.materialId && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                      <p className="text-sm text-green-800 font-medium">
                                        ✓ Material seleccionado: {catalogMaterials.find(m => m.id === assignFormData.materialId)?.name}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="assign-quantity">Cantidad *</Label>
                                    <Input
                                      id="assign-quantity"
                                      type="number"
                                      step="0.01"
                                      value={assignFormData.quantity}
                                      onChange={(e) => setAssignFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="assign-minimumStock">Stock Mínimo *</Label>
                                    <Input
                                      id="assign-minimumStock"
                                      type="number"
                                      step="0.01"
                                      value={assignFormData.minimumStock}
                                      onChange={(e) => setAssignFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="assign-unitPrice">Precio Unitario *</Label>
                                    <Input
                                      id="assign-unitPrice"
                                      type="number"
                                      step="0.01"
                                      value={assignFormData.unitPrice}
                                      onChange={(e) => setAssignFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="assign-notes">Notas (opcional)</Label>
                                  <Textarea
                                    id="assign-notes"
                                    value={assignFormData.notes}
                                    onChange={(e) => setAssignFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Notas adicionales sobre este material en el proyecto"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                                    Cancelar
                                  </Button>
                                  <Button type="submit">
                                    Asignar al Proyecto
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Tabla de materiales */}
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Código</th>
                          <th className="text-left p-3 font-medium">Nombre</th>
                          <th className="text-left p-3 font-medium">Descripción</th>
                          <th className="text-center p-3 font-medium">Unidad</th>
                          <th className="text-right p-3 font-medium">Cantidad</th>
                          <th className="text-right p-3 font-medium">Stock Mín.</th>
                          <th className="text-right p-3 font-medium">Precio Unit.</th>
                          <th className="text-right p-3 font-medium">Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectMaterials.map((pm) => (
                          <tr key={pm.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{pm.material?.code || '-'}</td>
                            <td className="p-3">{pm.material?.name || pm.materialId}</td>
                            <td className="p-3 text-gray-600">{pm.material?.description || '-'}</td>
                            <td className="p-3 text-center">{pm.material?.unit || 'unidad'}</td>
                            <td className="p-3 text-right">{pm.quantity}</td>
                            <td className="p-3 text-right">{pm.minimumStock || '-'}</td>
                            <td className="p-3 text-right">
                              {formatCurrency(pm.unitPrice, pm.currency, 24.5)}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {formatCurrency(pm.quantity * pm.unitPrice, pm.currency, 24.5)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitud de Materiales */}
        <TabsContent value="solicitudes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2" />
                Solicitud de Materiales
              </CardTitle>
              <CardDescription>Gestión de solicitudes de materiales para proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Solicitudes de Materiales</p>
                <p className="text-sm mt-2">Crea y gestiona solicitudes de materiales</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsRequestDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cotizaciones */}
        <TabsContent value="cotizaciones" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCheck className="w-5 h-5 mr-2" />
                Cotizaciones
              </CardTitle>
              <CardDescription>Gestión de cotizaciones de proveedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Cotizaciones</p>
                <p className="text-sm mt-2">Administra cotizaciones y compara precios</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Cotización
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Órdenes de Compra */}
        <TabsContent value="ordenes-compra" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Órdenes de Compra
              </CardTitle>
              <CardDescription>Control de órdenes de compra a proveedores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Órdenes de Compra</p>
                <p className="text-sm mt-2">Gestiona órdenes de compra y seguimiento</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Orden de Compra
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control de Ingresos */}
        <TabsContent value="ingresos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowDownCircle className="w-5 h-5 mr-2" />
                Control de Ingresos
              </CardTitle>
              <CardDescription>Registro y control de ingresos del proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ArrowDownCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Control de Ingresos</p>
                <p className="text-sm mt-2">Monitorea todos los ingresos del proyecto</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Ingreso
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control de Gastos */}
        <TabsContent value="gastos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpCircle className="w-5 h-5 mr-2" />
                Control de Gastos
              </CardTitle>
              <CardDescription>Registro y control de gastos del presupuesto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ArrowUpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Control de Gastos</p>
                <p className="text-sm mt-2">Monitorea y controla los gastos presupuestarios</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Gasto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Órdenes de Cambio */}
        <TabsContent value="ordenes-cambio" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileEdit className="w-5 h-5 mr-2" />
                Órdenes de Cambio
              </CardTitle>
              <CardDescription>Gestión de órdenes de cambio y modificaciones al proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileEdit className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Órdenes de Cambio</p>
                <p className="text-sm mt-2">Administra cambios y modificaciones aprobadas</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Orden de Cambio
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contenido original de presupuestos (oculto por ahora) */}
      <div className="hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Presupuesto Total
            </CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBudget, 'HNL', 24.5)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUSDAmount(totalBudget, 24.5)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Items de Presupuesto
            </CardTitle>
            <FileText className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {filteredItems.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Object.keys(categoryTotals).length} categorías
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Promedio por Item
            </CardTitle>
            <Calculator className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {filteredItems.length > 0 
                ? formatCurrency(totalBudget / filteredItems.length, 'HNL', 24.5)
                : formatCurrency(0, 'HNL', 24.5)
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por item de presupuesto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por descripción o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Items de Presupuesto</CardTitle>
          <CardDescription>
            Lista de todos los items de presupuesto registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron items de presupuesto</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Proyecto</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-right p-2">Cantidad</th>
                    <th className="text-right p-2">Precio Unitario</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-center p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {projectBudgetItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{getProjectName(item.projectId)}</div>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{item.category}</Badge>
                      </td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(item.unitPrice, item.currency, getProjectExchangeRate(item.projectId))}
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(item.totalPrice, item.currency, getProjectExchangeRate(item.projectId))}
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center space-x-1">
                          {hasPermission('edit') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Material Request Dialog
  const MaterialRequestDialog = () => (
    <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nueva Solicitud de Materiales</DialogTitle>
          <DialogDescription>
            Complete los detalles de la solicitud de materiales
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitRequest}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">
                Proyecto <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={requestFormData.projectId}
                onValueChange={(value) => setRequestFormData({...requestFormData, projectId: value})}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={requestFormData.materialId}
                onValueChange={(value) => setRequestFormData({...requestFormData, materialId: value})}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un material" />
                </SelectTrigger>
                <SelectContent>
                  {catalogMaterials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name} ({material.code || material.id.slice(0, 6)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                className="col-span-3"
                value={requestFormData.quantity}
                onChange={(e) => setRequestFormData({...requestFormData, quantity: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Prioridad
              </Label>
              <Select 
                value={requestFormData.priority}
                onValueChange={(value: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => 
                  setRequestFormData({...requestFormData, priority: value})
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <Textarea
                id="notes"
                className="col-span-3"
                rows={3}
                value={requestFormData.notes}
                onChange={(e) => setRequestFormData({...requestFormData, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsRequestDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="presupuesto" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Presupuesto</span>
          </TabsTrigger>
          
          <TabsTrigger value="materiales" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Materiales</span>
          </TabsTrigger>
          
          <TabsTrigger value="solicitudes" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Solicitudes</span>
          </TabsTrigger>
          
          <TabsTrigger value="cotizaciones" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Cotizaciones</span>
          </TabsTrigger>
          
          <TabsTrigger value="ordenes-compra" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Órdenes</span>
          </TabsTrigger>
        </TabsList>

        {/* Presupuesto Tab */}
        <TabsContent value="presupuesto" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Presupuesto</CardTitle>
              <CardDescription>Gestión del presupuesto del proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add your budget content here */}
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Presupuesto del Proyecto</p>
                <p className="text-sm mt-2">Visualiza y gestiona el presupuesto del proyecto</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materiales Tab */}
        <TabsContent value="materiales" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Materiales</CardTitle>
              <CardDescription>Gestión de materiales del proyecto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Materiales del Proyecto</p>
                <p className="text-sm mt-2">Gestiona los materiales utilizados en el proyecto</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Solicitudes Tab */}
        <TabsContent value="solicitudes" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2" />
                Solicitud de Materiales
              </CardTitle>
              <CardDescription>Gestión de solicitudes de materiales para proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Solicitudes de Materiales</p>
                <p className="text-sm mt-2">Crea y gestiona solicitudes de materiales</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsRequestDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cotizaciones Tab */}
        <TabsContent value="cotizaciones" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones</CardTitle>
              <CardDescription>Gestión de cotizaciones de materiales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Cotizaciones</p>
                <p className="text-sm mt-2">Gestiona las cotizaciones de materiales</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Órdenes de Compra Tab */}
        <TabsContent value="ordenes-compra" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes de Compra</CardTitle>
              <CardDescription>Gestión de órdenes de compra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Órdenes de Compra</p>
                <p className="text-sm mt-2">Gestiona las órdenes de compra de materiales</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Material Request Dialog */}
      <MaterialRequestDialog />
    </div>
  );
};