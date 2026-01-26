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
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
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
  createdAt: string;
  updatedAt: string;
}

export function BudgetView() {
  const { projects } = useProjectStore();
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    projectId: '',
    category: '',
    description: '',
    quantity: '',
    unitPrice: '',
    currency: 'HNL'
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
    // Cargar items de presupuesto simulados
    const mockBudgetItems: BudgetItem[] = [
      {
        id: '1',
        projectId: '1',
        category: 'Mano de Obra',
        description: 'Albañiles y ayudantes',
        quantity: 10,
        unitPrice: 15000,
        totalPrice: 150000,
        currency: 'HNL',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      },
      {
        id: '2',
        projectId: '1',
        category: 'Materiales',
        description: 'Cemento y agregados',
        quantity: 100,
        unitPrice: 850,
        totalPrice: 85000,
        currency: 'HNL',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      },
      {
        id: '3',
        projectId: '1',
        category: 'Equipos',
        description: 'Alquiler de grúa',
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
        currency: 'HNL',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      }
    ];
    setBudgetItems(mockBudgetItems);
  }, []);

  const filteredItems = budgetItems.filter(item => {
    const matchesProject = !selectedProject || item.projectId === selectedProject;
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

  const getTotalBudget = () => {
    return filteredItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const getTotalByCategory = () => {
    const totals: { [key: string]: number } = {};
    filteredItems.forEach(item => {
      totals[item.category] = (totals[item.category] || 0) + item.totalPrice;
    });
    return totals;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear presupuestos');
      return;
    }

    try {
      const quantity = parseFloat(formData.quantity);
      const unitPrice = parseFloat(formData.unitPrice);
      const totalPrice = quantity * unitPrice;

      const budgetData = {
        ...formData,
        quantity,
        unitPrice,
        totalPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        setBudgetItems(prev => prev.map(item => 
          item.id === editingItem.id ? { ...budgetData, id: editingItem.id } : item
        ));
        toast.success('Item de presupuesto actualizado');
      } else {
        setBudgetItems(prev => [...prev, { ...budgetData, id: Date.now().toString() }]);
        toast.success('Item de presupuesto creado');
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
      setBudgetItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item eliminado exitosamente');
    }
  };

  const categoryTotals = getTotalByCategory();
  const totalBudget = getTotalBudget();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="text-gray-500 mt-1">Control detallado de presupuestos por proyecto</p>
        </div>
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

      {/* Summary Cards */}
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

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Categoría</CardTitle>
            <CardDescription>Distribución del presupuesto por categorías</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([category, total]) => {
                const percentage = (total / totalBudget) * 100;
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(total, 'HNL', 24.5)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {percentage.toFixed(1)}% del total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items de Presupuesto</CardTitle>
          <CardDescription>Listado detallado de todos los items de presupuesto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Proyecto</th>
                  <th className="text-left py-3 px-4">Categoría</th>
                  <th className="text-left py-3 px-4">Descripción</th>
                  <th className="text-right py-3 px-4">Cantidad</th>
                  <th className="text-right py-3 px-4">Precio Unitario</th>
                  <th className="text-right py-3 px-4">Total</th>
                  <th className="text-right py-3 px-4">USD</th>
                  <th className="text-center py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const exchangeRate = getProjectExchangeRate(item.projectId);
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium">{getProjectName(item.projectId)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{item.description}</td>
                      <td className="py-3 px-4 text-right text-sm">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCurrency(item.unitPrice, item.currency, exchangeRate)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(item.totalPrice, item.currency, exchangeRate)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {getUSDAmount(item.totalPrice, exchangeRate)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center space-x-2">
                          {hasPermission('update') && (
                            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission('delete') && (
                            <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron items de presupuesto</h3>
              <p className="text-gray-500">
                {searchTerm || selectedProject || categoryFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'Crea tu primer item de presupuesto para comenzar'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}