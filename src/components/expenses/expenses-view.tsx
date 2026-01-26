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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  Receipt,
  Upload,
  Camera,
  FileImage,
  Calculator
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

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
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export function ExpensesView() {
  const { projects } = useProjectStore();
  const { expenses, setExpenses, addExpense, updateExpense, deleteExpense, loading } = useExpenseStore();
  const { addInvoice } = useInvoiceStore();
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    budgetItemId: '',
    description: '',
    amount: '',
    currency: 'HNL',
    exchangeRate: '24.5',
    category: '',
    date: '',
    invoiceNumber: '',
    supplier: ''
  });
  const [catalogMaterials, setCatalogMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [materialSearchTerm, setMaterialSearchTerm] = useState('');

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
    loadCatalogMaterials();
    
    // Cargar gastos cuando el componente se monta o cambia el proyecto seleccionado
    const loadExpenses = async () => {
      try {
        if (selectedProject) {
          await useExpenseStore.getState().fetchExpenses(selectedProject);
        } else {
          await useExpenseStore.getState().fetchExpenses();
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
        toast.error('Error al cargar los gastos');
      }
    };
    
    loadExpenses();
  }, [selectedProject]);

  const loadCatalogMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      if (response.ok) {
        const data = await response.json();
        setCatalogMaterials(data);
      }
    } catch (error) {
      console.error('Error loading catalog materials:', error);
    }
  };

  const handleMaterialSelect = (material: any) => {
    setSelectedMaterial(material);
    setFormData(prev => ({
      ...prev,
      description: material.name,
      amount: material.basePrice.toString(),
      currency: material.currency
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    if (value !== 'Materiales') {
      setSelectedMaterial(null);
    }
  };

  const calculateDueDate = (issueDate: string, daysToAdd: number = 30): string => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesProject = selectedProject === 'all' || !selectedProject || expense.projectId === selectedProject;
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesProject && matchesSearch && matchesCategory;
  });

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Proyecto no encontrado';
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

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('La imagen no puede ser mayor a 5MB');
        return;
      }
      setReceiptImage(file);
    }
  };

  // Validación simple para IDs (acepta UUIDs y CUIDs)
  const isValidId = (id: string) => {
    return id && id.length > 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear gastos');
      return;
    }

    // Validar campos requeridos
    if (!formData.projectId || !isValidId(formData.projectId)) {
      toast.error('Por favor selecciona un proyecto válido');
      return;
    }
    if (!formData.description || !formData.amount || !formData.date) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      // Crear el objeto del gasto
      const expenseToAdd = {
        projectId: formData.projectId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        exchangeRate: parseFloat(formData.exchangeRate),
        category: formData.category,
        date: formData.date,
        invoiceNumber: formData.invoiceNumber || null,
        supplier: formData.supplier || null,
        receiptImage: receiptImage ? `data:image/jpeg;base64,${await fileToBase64(receiptImage)}` : null,
        materialId: selectedMaterial?.id || null,
        createdById: user?.id || '1',
        // Agregar campos requeridos para la interfaz Expense
        id: '', // Se generará en el backend
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        budgetItemId: formData.budgetItemId || null
      };

      console.log('Intentando guardar gasto:', expenseToAdd);
      
      // Guardar el gasto
      await addExpense(expenseToAdd);
      
      // Limpiar el formulario
      setFormData({
        projectId: '',
        budgetItemId: '',
        description: '',
        amount: '',
        currency: 'HNL',
        exchangeRate: '24.5',
        category: '',
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        supplier: ''
      });
      
      setSelectedMaterial(null);
      setReceiptImage(null);
      
      // Cerrar el diálogo
      setIsCreateDialogOpen(false);
      
      // Mostrar mensaje de éxito
      toast.success('Gasto registrado exitosamente');
      
    } catch (error) {
      console.error('Error al guardar el gasto:', error);
      toast.error('Ocurrió un error al guardar el gasto. Por favor, inténtalo de nuevo.');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      projectId: expense.projectId,
      budgetItemId: expense.budgetItemId || '',
      description: expense.description,
      amount: expense.amount.toString(),
      currency: expense.currency,
      exchangeRate: expense.exchangeRate.toString(),
      category: expense.category,
      date: expense.date.split('T')[0],
      invoiceNumber: expense.invoiceNumber || '',
      supplier: expense.supplier || ''
    });
    setIsCreateDialogOpen(true);
  };

  const totalExpenses = getTotalExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
          <p className="text-gray-500 mt-1">Registro y control de gastos de proyectos</p>
        </div>
        {hasPermission('create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl flex flex-col max-h-[80vh]">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                  {editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                </DialogTitle>
                <DialogDescription>
                  Registra un nuevo gasto para el proyecto seleccionado
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 pr-2 -mr-2">
                <form id="expense-form" onSubmit={handleSubmit} className="space-y-4 pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectId">Proyecto *</Label>
                    <Select 
                      value={formData.projectId} 
                      onValueChange={(value) => {
                        console.log('Selected project ID:', value); // Debug log
                        setFormData(prev => ({ ...prev, projectId: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => {
                          console.log('Project in dropdown:', project.id, project.name); // Debug log
                          return (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
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

                {/* Catálogo de Materiales - solo visible cuando la categoría es Materiales */}
                {formData.category === 'Materiales' && (
                  <div className="space-y-2">
                    <Label>Seleccionar Material del Catálogo</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nombre, código o categoría..."
                        value={materialSearchTerm}
                        onChange={(e) => setMaterialSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {catalogMaterials.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">No hay materiales en el catálogo</p>
                          <p className="text-xs mt-1">Agrega materiales en la sección de Presupuesto</p>
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
                              </div>
                            );
                          }
                          
                          return filteredMaterials.map((material) => (
                            <div
                              key={material.id}
                              onClick={() => handleMaterialSelect(material)}
                              className={`p-3 border-b cursor-pointer hover:bg-blue-50 transition-colors ${
                                selectedMaterial?.id === material.id ? 'bg-blue-100 border-blue-300' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">{material.name}</div>
                                  {material.code && (
                                    <div className="text-xs text-gray-500">Código: {material.code}</div>
                                  )}
                                  {material.category && (
                                    <div className="text-xs text-gray-500">Categoría: {material.category}</div>
                                  )}
                                  {material.description && (
                                    <div className="text-xs text-gray-600 mt-1">{material.description}</div>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <div className="font-medium text-blue-600">
                                    {material.currency === 'HNL' ? 'L ' : '$ '}
                                    {material.basePrice.toLocaleString('es-HN')}
                                  </div>
                                  <div className="text-xs text-gray-500">/{material.unit}</div>
                                </div>
                              </div>
                            </div>
                          ));
                        })()
                      )}
                    </div>
                    {selectedMaterial && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ Material seleccionado: {selectedMaterial.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Precio base: {selectedMaterial.currency === 'HNL' ? 'L ' : '$ '}
                          {selectedMaterial.basePrice.toLocaleString('es-HN')} por {selectedMaterial.unit}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el gasto detalladamente"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha del Gasto *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exchangeRate">Tasa de Cambio</Label>
                    <Input
                      id="exchangeRate"
                      type="number"
                      step="0.01"
                      value={formData.exchangeRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, exchangeRate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Número de Factura</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      placeholder="Ej: FAC-2024-001"
                    />
                  </div>
                </div>

                {formData.invoiceNumber && formData.supplier && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Receipt className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          ✓ Se creará una factura automáticamente
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Esta factura aparecerá en la sección de Facturas para el proyecto seleccionado
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="receiptImage">Imagen del Recibo/Factura</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        id="receiptImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('receiptImage')?.click()}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {receiptImage ? receiptImage.name : 'Seleccionar Imagen'}
                      </Button>
                    </div>
                    {receiptImage && (
                      <div className="flex items-center space-x-2">
                        <FileImage className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600">Imagen cargada</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos: JPG, PNG. Máximo 5MB
                  </p>
                </div>

                {formData.amount && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(parseFloat(formData.amount), formData.currency, parseFloat(formData.exchangeRate))}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getUSDAmount(parseFloat(formData.amount), parseFloat(formData.exchangeRate))} USD
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  {editingExpense ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('¿Estás seguro de que deseas eliminar este gasto?\n\n' + editingExpense.description)) {
                          deleteExpense(editingExpense.id);
                          setIsCreateDialogOpen(false);
                          setEditingExpense(null);
                          toast.success('Gasto eliminado exitosamente');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Gasto
                    </Button>
                  ) : null
                  }
                  <div className="flex space-x-2 ml-auto">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingExpense ? 'Actualizar' : 'Registrar'} Gasto
                    </Button>
                  </div>
                </div>
              </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Gastos
            </CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalExpenses, 'HNL', 24.5)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUSDAmount(totalExpenses, 24.5)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Gastos Registrados
            </CardTitle>
            <Receipt className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {filteredExpenses.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Promedio por Gasto
            </CardTitle>
            <Calculator className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {filteredExpenses.length > 0 
                ? formatCurrency(totalExpenses / filteredExpenses.length, 'HNL', 24.5)
                : formatCurrency(0, 'HNL', 24.5)
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Por gasto registrado
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
                placeholder="Buscar por descripción, proveedor o factura..."
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

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Gastos</CardTitle>
          <CardDescription>
            Lista de todos los gastos registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron gastos registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Proyecto</th>
                    <th className="text-left p-2">Descripción</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-left p-2">Proveedor</th>
                    <th className="text-right p-2">Monto</th>
                    <th className="text-center p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(expense.date).toLocaleDateString('es-HN')}
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{getProjectName(expense.projectId)}</div>
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{expense.description}</div>
                          {expense.invoiceNumber && (
                            <div className="text-xs text-gray-500">Factura: {expense.invoiceNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{expense.category}</Badge>
                      </td>
                      <td className="p-2">{expense.supplier || '-'}</td>
                      <td className="p-2 text-right font-medium">
                        <div>
                          {formatCurrency(expense.amount, expense.currency, expense.exchangeRate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getUSDAmount(expense.amount, expense.exchangeRate)} USD
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                            title="Haz clic aquí para editar o eliminar"
                            className="text-blue-600"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar/Eliminar
                          </Button>
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
  );
}