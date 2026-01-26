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
  FileImage
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
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
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
    // Cargar gastos simulados
    const mockExpenses: Expense[] = [
      {
        id: '1',
        projectId: '1',
        budgetItemId: '1',
        description: 'Pago de salarios - Semana 1',
        amount: 150000,
        currency: 'HNL',
        exchangeRate: 24.5,
        category: 'Mano de Obra',
        date: '2024-01-20T00:00:00.000Z',
        invoiceNumber: 'SAL-001',
        supplier: 'Constructora Local S.A.',
        receiptImage: null,
        createdById: '1',
        createdAt: '2024-01-20T00:00:00.000Z',
        updatedAt: '2024-01-20T00:00:00.000Z'
      },
      {
        id: '2',
        projectId: '1',
        budgetItemId: '2',
        description: 'Compra de cemento Holcim',
        amount: 85000,
        currency: 'HNL',
        exchangeRate: 24.5,
        category: 'Materiales',
        date: '2024-01-22T00:00:00.000Z',
        invoiceNumber: 'FAC-2024-001',
        supplier: 'Holcim Honduras',
        receiptImage: null,
        createdById: '1',
        createdAt: '2024-01-22T00:00:00.000Z',
        updatedAt: '2024-01-22T00:00:00.000Z'
      },
      {
        id: '3',
        projectId: '1',
        budgetItemId: '3',
        description: 'Alquiler de grúa móvil',
        amount: 25000,
        currency: 'HNL',
        exchangeRate: 24.5,
        category: 'Equipos',
        date: '2024-01-25T00:00:00.000Z',
        invoiceNumber: 'ALQ-001',
        supplier: 'Maquinaria Pesada S.A.',
        receiptImage: null,
        createdById: '1',
        createdAt: '2024-01-25T00:00:00.000Z',
        updatedAt: '2024-01-25T00:00:00.000Z'
      }
    ];
    setExpenses(mockExpenses);
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const matchesProject = !selectedProject || expense.projectId === selectedProject;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear gastos');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        exchangeRate: parseFloat(formData.exchangeRate),
        createdById: user?.id || '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingExpense) {
        setExpenses(prev => prev.map(expense => 
          expense.id === editingExpense.id ? { ...expenseData, id: editingExpense.id } : expense
        ));
        toast.success('Gasto actualizado exitosamente');
      } else {
        setExpenses(prev => [...prev, { ...expenseData, id: Date.now().toString() }]);
        toast.success('Gasto registrado exitosamente');
      }

      setIsCreateDialogOpen(false);
      setEditingExpense(null);
      setReceiptImage(null);
      setFormData({
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
    } catch (error) {
      toast.error('Error al guardar el gasto');
    }
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

  const handleDelete = async (expenseId: string) => {
    if (!hasPermission('delete')) {
      toast.error('No tienes permisos para eliminar gastos');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      toast.success('Gasto eliminado exitosamente');
    }
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                </DialogTitle>
                <DialogDescription>
                  Registra un nuevo gasto para el proyecto seleccionado
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
                          {getUSDAmount(parseFloat(formData.amount), parseFloat(formData.exchangeRate))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingExpense ? 'Actualizar' : 'Registrar'} Gasto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Gastos
            </CardTitle>
            <DollarSign className="w-5 h-5 text-red-600" />
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
            <Receipt className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {filteredExpenses.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedProject ? 'Proyecto seleccionado' : 'Todos los proyectos'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Promedio por Gasto
            </CardTitle>
            <Calendar className="w-5 h-5 text-green-600" />
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
                  <SelectItem value="">Todos los proyectos</SelectItem>
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

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Gastos</CardTitle>
          <CardDescription>Listado detallado de todos los gastos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Proyecto</th>
                  <th className="text-left py-3 px-4">Descripción</th>
                  <th className="text-left py-3 px-4">Categoría</th>
                  <th className="text-left py-3 px-4">Proveedor</th>
                  <th className="text-right py-3 px-4">Monto</th>
                  <th className="text-right py-3 px-4">USD</th>
                  <th className="text-center py-3 px-4">Factura</th>
                  <th className="text-center py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {new Date(expense.date).toLocaleDateString('es-HN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{getProjectName(expense.projectId)}</div>
                    </td>
                    <td className="py-3 px-4 text-sm">{expense.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{expense.category}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{expense.supplier || '-'}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(expense.amount, expense.currency, expense.exchangeRate)}
                    </td>
                    <td className="py-3 px-4 text-right text-sm">
                      {getUSDAmount(expense.amount, expense.exchangeRate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {expense.invoiceNumber ? (
                        <Badge variant="secondary">{expense.invoiceNumber}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        {hasPermission('update') && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission('delete') && (
                          <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)}>
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

          {filteredExpenses.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron gastos</h3>
              <p className="text-gray-500">
                {searchTerm || selectedProject || categoryFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Registra tu primer gasto para comenzar'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}