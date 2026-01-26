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
import { Plus, Search, Edit, Trash2, Receipt, DollarSign, Calendar, FileText, Download } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  supplier: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  issueDate: string;
  dueDate: string | null;
  status: string;
  category: string;
  description: string | null;
  fileUrl: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export function InvoicesView() {
  const { projects } = useProjectStore();
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    projectId: '',
    invoiceNumber: '',
    supplier: '',
    amount: '',
    currency: 'HNL',
    exchangeRate: '24.5',
    issueDate: '',
    dueDate: '',
    status: 'PENDING',
    category: '',
    description: ''
  });

  const categories = ['Materiales', 'Mano de Obra', 'Equipos', 'Subcontratos', 'Permisos', 'Otros'];
  const statuses = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        projectId: '1',
        invoiceNumber: 'FAC-2024-001',
        supplier: 'Holcim Honduras',
        amount: 85000,
        currency: 'HNL',
        exchangeRate: 24.5,
        issueDate: '2024-01-22T00:00:00.000Z',
        dueDate: '2024-02-22T00:00:00.000Z',
        status: 'PAID',
        category: 'Materiales',
        description: 'Compra de cemento y agregados',
        fileUrl: null,
        createdById: '1',
        createdAt: '2024-01-22T00:00:00.000Z',
        updatedAt: '2024-01-22T00:00:00.000Z'
      },
      {
        id: '2',
        projectId: '1',
        invoiceNumber: 'FAC-2024-002',
        supplier: 'Maquinaria Pesada S.A.',
        amount: 25000,
        currency: 'HNL',
        exchangeRate: 24.5,
        issueDate: '2024-01-25T00:00:00.000Z',
        dueDate: '2024-02-25T00:00:00.000Z',
        status: 'PENDING',
        category: 'Equipos',
        description: 'Alquiler de grúa móvil',
        fileUrl: null,
        createdById: '1',
        createdAt: '2024-01-25T00:00:00.000Z',
        updatedAt: '2024-01-25T00:00:00.000Z'
      }
    ];
    setInvoices(mockInvoices);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesProject = !selectedProject || invoice.projectId === selectedProject;
    const matchesSearch = invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesProject && matchesSearch && matchesStatus;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Pagada';
      case 'PENDING':
        return 'Pendiente';
      case 'OVERDUE':
        return 'Vencida';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear facturas');
      return;
    }

    try {
      const invoiceData = {
        ...formData,
        amount: parseFloat(formData.amount),
        exchangeRate: parseFloat(formData.exchangeRate),
        createdById: user?.id || '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingInvoice) {
        setInvoices(prev => prev.map(invoice => 
          invoice.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : invoice
        ));
        toast.success('Factura actualizada exitosamente');
      } else {
        setInvoices(prev => [...prev, { ...invoiceData, id: Date.now().toString() }]);
        toast.success('Factura creada exitosamente');
      }

      setIsCreateDialogOpen(false);
      setEditingInvoice(null);
      setFormData({
        projectId: '',
        invoiceNumber: '',
        supplier: '',
        amount: '',
        currency: 'HNL',
        exchangeRate: '24.5',
        issueDate: '',
        dueDate: '',
        status: 'PENDING',
        category: '',
        description: ''
      });
    } catch (error) {
      toast.error('Error al guardar la factura');
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      projectId: invoice.projectId,
      invoiceNumber: invoice.invoiceNumber,
      supplier: invoice.supplier,
      amount: invoice.amount.toString(),
      currency: invoice.currency,
      exchangeRate: invoice.exchangeRate.toString(),
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate?.split('T')[0] || '',
      status: invoice.status,
      category: invoice.category,
      description: invoice.description || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (invoiceId: string) => {
    if (!hasPermission('delete')) {
      toast.error('No tienes permisos para eliminar facturas');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
      toast.success('Factura eliminada exitosamente');
    }
  };

  const totalInvoices = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingInvoices = filteredInvoices.filter(i => i.status === 'PENDING').reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-500 mt-1">Gestión de facturas recibidas</p>
        </div>
        {hasPermission('create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingInvoice ? 'Editar Factura' : 'Nueva Factura'}</DialogTitle>
                <DialogDescription>Registra una nueva factura recibida</DialogDescription>
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
                    <Label htmlFor="invoiceNumber">Número de Factura *</Label>
                    <Input id="invoiceNumber" value={formData.invoiceNumber} onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor *</Label>
                    <Input id="supplier" value={formData.supplier} onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto *</Label>
                    <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HNL">Lempiras</SelectItem>
                        <SelectItem value="USD">Dólares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="issueDate">Fecha de Emisión *</Label>
                    <Input id="issueDate" type="date" value={formData.issueDate} onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                    <Input id="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingInvoice ? 'Actualizar' : 'Crear'} Factura</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <Receipt className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvoices, 'HNL', 24.5)}</div>
            <p className="text-xs text-gray-500">{getUSDAmount(totalInvoices, 24.5)} USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pagadas</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidInvoices, 'HNL', 24.5)}</div>
            <p className="text-xs text-gray-500">{getUSDAmount(paidInvoices, 24.5)} USD</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <Calendar className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingInvoices, 'HNL', 24.5)}</div>
            <p className="text-xs text-gray-500">{getUSDAmount(pendingInvoices, 24.5)} USD</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Search className="w-5 h-5 mr-2" />Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Buscar por proveedor o número..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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

      <Card>
        <CardHeader>
          <CardTitle>Facturas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Número</th>
                  <th className="text-left py-3 px-4">Proveedor</th>
                  <th className="text-left py-3 px-4">Proyecto</th>
                  <th className="text-left py-3 px-4">Fecha Emisión</th>
                  <th className="text-left py-3 px-4">Vencimiento</th>
                  <th className="text-right py-3 px-4">Monto</th>
                  <th className="text-center py-3 px-4">Estado</th>
                  <th className="text-center py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4">{invoice.supplier}</td>
                    <td className="py-3 px-4 text-sm">{getProjectName(invoice.projectId)}</td>
                    <td className="py-3 px-4 text-sm">{new Date(invoice.issueDate).toLocaleDateString('es-HN')}</td>
                    <td className="py-3 px-4 text-sm">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-HN') : '-'}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {formatCurrency(invoice.amount, invoice.currency, invoice.exchangeRate)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge className={getStatusColor(invoice.status)}>{getStatusText(invoice.status)}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        {hasPermission('update') && (
                          <Button variant="outline" size="sm" onClick={() => handleEdit(invoice)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission('delete') && (
                          <Button variant="outline" size="sm" onClick={() => handleDelete(invoice.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron facturas</h3>
              <p className="text-gray-500">Registra tu primera factura para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}