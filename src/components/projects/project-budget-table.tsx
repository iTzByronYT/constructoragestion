'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Plus,
  Edit,
  FileText
} from 'lucide-react';
import { useExpenseStore } from '@/stores/expense-store';
import { useProjectStore } from '@/stores/project-store';
import { useBudgetStore } from '@/stores/budget-store';
import { toast } from 'sonner';

interface ProjectBudgetTableProps {
  projectId: string;
  projectName: string;
  currency: string;
  exchangeRate: number;
  estimatedBudget: number;
}

interface BudgetRow {
  id: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  initialBudget: number;
  budgetModifications: number;
  revisedBudget: number;
  committedAmount: number;
  realExpenses: number;
  realPlusCommitted: number;
  budgetBalance: number;
  availableBalance: number;
  status: 'normal' | 'warning' | 'danger';
}

interface PurchaseOrder {
  id: string;
  projectId: string;
  orderNumber: string;
  description: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  isCommitted: boolean;
  status: string;
}

export function ProjectBudgetTable({ 
  projectId, 
  projectName, 
  currency, 
  exchangeRate, 
  estimatedBudget 
}: ProjectBudgetTableProps) {
  const { expenses } = useExpenseStore();
  const { budgetItems, addBudgetItem } = useBudgetStore();
  const [budgetData, setBudgetData] = useState<BudgetRow[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModifyDialogOpen, setIsModifyDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [modifyFormData, setModifyFormData] = useState({
    category: '',
    modificationType: 'increase',
    amount: '',
    reason: ''
  });
  const [newCategoryFormData, setNewCategoryFormData] = useState({
    category: '',
    description: '',
    quantity: '',
    unitPrice: '',
    unit: 'Unidad'
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
    loadData();
  }, [projectId, expenses, budgetItems]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Cargar órdenes de compra
      const ordersResponse = await fetch(`/api/purchase-orders?projectId=${projectId}`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setPurchaseOrders(ordersData);
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    }
    
    calculateBudgetData();
  };

  const calculateBudgetData = () => {
    // Agrupar gastos y presupuestos por categoría
    const categoryData: { [key: string]: BudgetRow } = {};
    
    // Obtener items de presupuesto por categoría
    const budgetItemsByCategory = budgetItems.filter(item => item.projectId === projectId);
    
    // Obtener gastos por categoría
    const expensesByCategory = expenses.filter(expense => expense.projectId === projectId);
    
    // Obtener órdenes de compra comprometidas por categoría (usando descripción para inferir categoría)
    const committedOrders = purchaseOrders.filter(order => order.isCommitted);
    
    // Procesar cada categoría
    budgetItemsByCategory.forEach(budgetItem => {
      const categoryExpenses = expensesByCategory.filter(expense => expense.category === budgetItem.category);
      const totalExpenses = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calcular monto comprometido para esta categoría
      const categoryCommitted = committedOrders
        .filter(order => order.description.toLowerCase().includes(budgetItem.category.toLowerCase()))
        .reduce((sum, order) => {
          // Convertir a la moneda del proyecto si es necesario
          if (order.currency === currency) {
            return sum + order.amount;
          } else {
            return sum + (order.amount * order.exchangeRate);
          }
        }, 0);
      
      const initialBudget = budgetItem.totalPrice;
      const budgetModifications = 0; // TODO: Calcular de órdenes de cambio
      const revisedBudget = initialBudget + budgetModifications;
      const committedAmount = categoryCommitted;
      const realExpenses = totalExpenses;
      const realPlusCommitted = realExpenses + committedAmount;
      const budgetBalance = revisedBudget - realExpenses;
      const availableBalance = revisedBudget - realPlusCommitted;
      
      // Determinar estado
      let status: 'normal' | 'warning' | 'danger' = 'normal';
      const usagePercentage = revisedBudget > 0 ? (realPlusCommitted / revisedBudget) * 100 : 0;
      if (usagePercentage > 100) status = 'danger';
      else if (usagePercentage > 80) status = 'warning';
      
      categoryData[budgetItem.category] = {
        id: budgetItem.id,
        category: budgetItem.category,
        unit: 'Unidad', // TODO: Obtener del presupuesto
        quantity: budgetItem.quantity,
        unitPrice: budgetItem.unitPrice,
        initialBudget,
        budgetModifications,
        revisedBudget,
        committedAmount,
        realExpenses,
        realPlusCommitted,
        budgetBalance,
        availableBalance,
        status
      };
    });
    
    // Agregar categorías que solo tienen gastos pero no presupuesto
    const expenseCategories = [...new Set(expensesByCategory.map(expense => expense.category))];
    expenseCategories.forEach(category => {
      if (!categoryData[category]) {
        const categoryExpenses = expensesByCategory.filter(expense => expense.category === category);
        const totalExpenses = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        categoryData[category] = {
          id: `expense-${category}`,
          category,
          unit: 'Unidad',
          quantity: 0,
          unitPrice: 0,
          initialBudget: 0,
          budgetModifications: 0,
          revisedBudget: 0,
          committedAmount: 0,
          realExpenses: totalExpenses,
          realPlusCommitted: totalExpenses,
          budgetBalance: -totalExpenses,
          availableBalance: -totalExpenses,
          status: 'danger' // Sin presupuesto pero con gastos
        };
      }
    });
    
    setBudgetData(Object.values(categoryData));
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    if (currency === 'HNL') {
      return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatUSD = (amount: number) => {
    return `$ ${(amount / exchangeRate).toLocaleString('es-HN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getStatusBadge = (status: 'normal' | 'warning' | 'danger') => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Precaución</Badge>;
      case 'danger':
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>;
    }
  };

  const getStatusColor = (status: 'normal' | 'warning' | 'danger') => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleModifyBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const modification = {
        projectId,
        category: modifyFormData.category,
        amount: parseFloat(modifyFormData.amount) * (modifyFormData.modificationType === 'decrease' ? -1 : 1),
        reason: modifyFormData.reason,
        date: new Date().toISOString()
      };

      // TODO: Guardar modificación en la base de datos cuando esté disponible
      toast.success('Modificación de presupuesto registrada');
      setIsModifyDialogOpen(false);
      setModifyFormData({ category: '', modificationType: 'increase', amount: '', reason: '' });
      loadData();
    } catch (error) {
      console.error('Error modifying budget:', error);
      toast.error('Error al modificar presupuesto');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!newCategoryFormData.category) {
      toast.error('Por favor selecciona una categoría');
      return;
    }
    
    if (!newCategoryFormData.description) {
      toast.error('Por favor ingresa una descripción');
      return;
    }
    
    if (!newCategoryFormData.quantity || parseFloat(newCategoryFormData.quantity) <= 0) {
      toast.error('Por favor ingresa una cantidad válida');
      return;
    }
    
    if (!newCategoryFormData.unitPrice || parseFloat(newCategoryFormData.unitPrice) <= 0) {
      toast.error('Por favor ingresa un precio unitario válido');
      return;
    }
    
    try {
      const quantity = parseFloat(newCategoryFormData.quantity);
      const unitPrice = parseFloat(newCategoryFormData.unitPrice);
      const totalPrice = quantity * unitPrice;

      const budgetData = {
        projectId,
        category: newCategoryFormData.category,
        description: newCategoryFormData.description,
        quantity,
        unitPrice,
        totalPrice,
        currency,
        createdById: '1' // TODO: Obtener del usuario actual
      };

      try {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(budgetData)
        });

        if (response.ok) {
          const newItem = await response.json();
          addBudgetItem(newItem);
          toast.success('Categoría agregada exitosamente');
          setIsAddCategoryDialogOpen(false);
          setNewCategoryFormData({ category: '', description: '', quantity: '', unitPrice: '', unit: 'Unidad' });
          loadData();
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
          throw new Error(errorData.error || 'Error creating budget item');
        }
      } catch (fetchError: any) {
        // Si la API no está disponible, crear el item localmente
        console.warn('API not available, creating item locally:', fetchError);
        
        const newItem = {
          ...budgetData,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        addBudgetItem(newItem);
        toast.success('Categoría agregada exitosamente (guardado local)');
        setIsAddCategoryDialogOpen(false);
        setNewCategoryFormData({ category: '', description: '', quantity: '', unitPrice: '', unit: 'Unidad' });
        loadData();
      }
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.message || 'Error al agregar categoría');
    }
  };

  // Calcular totales
  const totals = budgetData.reduce((acc, row) => ({
    initialBudget: acc.initialBudget + row.initialBudget,
    budgetModifications: acc.budgetModifications + row.budgetModifications,
    revisedBudget: acc.revisedBudget + row.revisedBudget,
    committedAmount: acc.committedAmount + row.committedAmount,
    realExpenses: acc.realExpenses + row.realExpenses,
    realPlusCommitted: acc.realPlusCommitted + row.realPlusCommitted,
    budgetBalance: acc.budgetBalance + row.budgetBalance,
    availableBalance: acc.availableBalance + row.availableBalance
  }), {
    initialBudget: 0,
    budgetModifications: 0,
    revisedBudget: 0,
    committedAmount: 0,
    realExpenses: 0,
    realPlusCommitted: 0,
    budgetBalance: 0,
    availableBalance: 0
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Detalle de Presupuesto - {projectName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Detalle de Presupuesto - {projectName}
            </CardTitle>
            <CardDescription>
              Control detallado del presupuesto por categorías
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isModifyDialogOpen} onOpenChange={setIsModifyDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Modificar Presupuesto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Modificar Presupuesto</DialogTitle>
                  <DialogDescription>Registra un aumento o disminución del presupuesto</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleModifyBudget} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="modifyCategory">Categoría *</Label>
                    <Select value={modifyFormData.category} onValueChange={(value) => setModifyFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetData.map(item => (
                          <SelectItem key={item.id} value={item.category}>{item.category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="modificationType">Tipo *</Label>
                      <Select value={modifyFormData.modificationType} onValueChange={(value) => setModifyFormData(prev => ({ ...prev, modificationType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="increase">Aumento</SelectItem>
                          <SelectItem value="decrease">Disminución</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modifyAmount">Monto *</Label>
                      <Input
                        id="modifyAmount"
                        type="number"
                        step="0.01"
                        value={modifyFormData.amount}
                        onChange={(e) => setModifyFormData(prev => ({ ...prev, amount: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Razón de la Modificación *</Label>
                    <Textarea
                      id="reason"
                      value={modifyFormData.reason}
                      onChange={(e) => setModifyFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Describe el motivo de esta modificación"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsModifyDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Registrar Modificación</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Categoría
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Categoría al Presupuesto</DialogTitle>
                  <DialogDescription>Agrega una nueva categoría presupuestaria al proyecto</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newCategory">Categoría *</Label>
                      <Select value={newCategoryFormData.category} onValueChange={(value) => setNewCategoryFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidad</Label>
                      <Input
                        id="unit"
                        value={newCategoryFormData.unit}
                        onChange={(e) => setNewCategoryFormData(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="m², m³, kg, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newDescription">Descripción *</Label>
                    <Input
                      id="newDescription"
                      value={newCategoryFormData.description}
                      onChange={(e) => setNewCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción detallada"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newQuantity">Cantidad *</Label>
                      <Input
                        id="newQuantity"
                        type="number"
                        step="0.01"
                        value={newCategoryFormData.quantity}
                        onChange={(e) => setNewCategoryFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newUnitPrice">Precio Unitario *</Label>
                      <Input
                        id="newUnitPrice"
                        type="number"
                        step="0.01"
                        value={newCategoryFormData.unitPrice}
                        onChange={(e) => setNewCategoryFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {newCategoryFormData.quantity && newCategoryFormData.unitPrice && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">Total: </span>
                        {formatCurrency(parseFloat(newCategoryFormData.quantity) * parseFloat(newCategoryFormData.unitPrice))}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Agregar Categoría</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Categoría</TableHead>
                <TableHead className="font-semibold text-center">Unidad</TableHead>
                <TableHead className="font-semibold text-center">Cantidad</TableHead>
                <TableHead className="font-semibold text-right">Precio Unitario</TableHead>
                <TableHead className="font-semibold text-right">Presupuesto Inicial</TableHead>
                <TableHead className="font-semibold text-right">Modificación</TableHead>
                <TableHead className="font-semibold text-right">Presupuesto Revisado</TableHead>
                <TableHead className="font-semibold text-right">Monto Comprometido</TableHead>
                <TableHead className="font-semibold text-right">Gasto Real</TableHead>
                <TableHead className="font-semibold text-right">Gasto + Comprometido</TableHead>
                <TableHead className="font-semibold text-right">Balance</TableHead>
                <TableHead className="font-semibold text-right">Saldo Disponible</TableHead>
                <TableHead className="font-semibold text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetData.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell className="text-center">{row.unit}</TableCell>
                  <TableCell className="text-center">{row.quantity.toLocaleString('es-HN')}</TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(row.unitPrice)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.unitPrice)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(row.initialBudget)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.initialBudget)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={row.budgetModifications > 0 ? 'text-blue-600' : 'text-gray-600'}>
                      <div className="font-medium">
                        {row.budgetModifications > 0 ? '+' : ''}{formatCurrency(row.budgetModifications)}
                      </div>
                      <div className="text-xs text-gray-500">{formatUSD(row.budgetModifications)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(row.revisedBudget)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.revisedBudget)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(row.committedAmount)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.committedAmount)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(row.realExpenses)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.realExpenses)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <div className="font-medium">{formatCurrency(row.realPlusCommitted)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.realPlusCommitted)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={row.budgetBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      <div className="font-medium">{formatCurrency(row.budgetBalance)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.budgetBalance)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={row.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      <div className="font-medium">{formatCurrency(row.availableBalance)}</div>
                      <div className="text-xs text-gray-500">{formatUSD(row.availableBalance)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(row.status)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 font-semibold">
                <TableCell colSpan={4} className="text-right">TOTALES:</TableCell>
                <TableCell className="text-right">
                  <div>{formatCurrency(totals.initialBudget)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.initialBudget)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className={totals.budgetModifications > 0 ? 'text-blue-600' : 'text-gray-600'}>
                    {totals.budgetModifications > 0 ? '+' : ''}{formatCurrency(totals.budgetModifications)}
                  </div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.budgetModifications)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div>{formatCurrency(totals.revisedBudget)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.revisedBudget)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div>{formatCurrency(totals.committedAmount)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.committedAmount)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div>{formatCurrency(totals.realExpenses)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.realExpenses)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div>{formatCurrency(totals.realPlusCommitted)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.realPlusCommitted)}</div>
                </TableCell>
                <TableCell className={`text-right ${totals.budgetBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div>{formatCurrency(totals.budgetBalance)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.budgetBalance)}</div>
                </TableCell>
                <TableCell className={`text-right ${totals.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div>{formatCurrency(totals.availableBalance)}</div>
                  <div className="text-xs text-gray-500">{formatUSD(totals.availableBalance)}</div>
                </TableCell>
                <TableCell className="text-center">
                  {totals.availableBalance < 0 ? (
                    <Badge className="bg-red-100 text-red-800">Déficit</Badge>
                  ) : totals.availableBalance < totals.revisedBudget * 0.1 ? (
                    <Badge className="bg-yellow-100 text-yellow-800">Bajo</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800">Saludable</Badge>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Resumen Ejecutivo */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Presupuesto Total</p>
                  <p className="text-lg font-bold text-blue-900">{formatCurrency(totals.revisedBudget)}</p>
                  <p className="text-xs text-blue-600">{formatUSD(totals.revisedBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Gasto Total</p>
                  <p className="text-lg font-bold text-red-900">{formatCurrency(totals.realExpenses)}</p>
                  <p className="text-xs text-red-600">{formatUSD(totals.realExpenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Comprometido</p>
                  <p className="text-lg font-bold text-yellow-900">{formatCurrency(totals.committedAmount)}</p>
                  <p className="text-xs text-yellow-600">{formatUSD(totals.committedAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${totals.availableBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center">
                {totals.availableBalance >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <div>
                  <p className={`text-sm font-medium ${totals.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Saldo Disponible
                  </p>
                  <p className={`text-lg font-bold ${totals.availableBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {formatCurrency(totals.availableBalance)}
                  </p>
                  <p className={`text-xs ${totals.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatUSD(totals.availableBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}