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
import { Plus, Search, Edit, Trash2, Receipt, DollarSign, Calendar, FileText, Download, Image as ImageIcon, X } from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useInvoiceStore } from '@/stores/invoice-store';
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
  const { invoices, setInvoices, loadInvoices, addInvoice, updateInvoice, deleteInvoice, loading } = useInvoiceStore();
  const { user, hasPermission } = useAuthStore();
  const [selectedProject, setSelectedProject] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [imagePreview, setImagePreview] = useState<{ url: string; invoiceNumber: string } | null>(null);
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

  // Cargar facturas al montar el componente
  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesProject = selectedProject === 'all' || !selectedProject || invoice.projectId === selectedProject;
    const matchesSearch = invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesProject && matchesSearch && matchesStatus;
  });

  // Debug: mostrar información en consola
  useEffect(() => {
    console.log('📄 Invoices Store:', {
      total: invoices.length,
      filtered: filteredInvoices.length,
      invoices: invoices
    });
  }, [invoices, filteredInvoices]);

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
        projectId: formData.projectId,
        invoiceNumber: formData.invoiceNumber,
        supplier: formData.supplier,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        exchangeRate: parseFloat(formData.exchangeRate),
        issueDate: formData.issueDate,
        dueDate: formData.dueDate || null,
        status: formData.status,
        category: formData.category,
        description: formData.description || null,
        createdById: user?.id || '1'
      };

      if (editingInvoice) {
        const response = await fetch(`/api/invoices/${editingInvoice.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: formData.invoiceNumber,
            supplier: formData.supplier,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            exchangeRate: parseFloat(formData.exchangeRate),
            issueDate: formData.issueDate,
            dueDate: formData.dueDate || null,
            status: formData.status,
            category: formData.category,
            description: formData.description || null
          })
        });

        if (response.ok) {
          const updatedInvoice = await response.json();
          updateInvoice(editingInvoice.id, updatedInvoice);
          toast.success('Factura actualizada exitosamente');
        } else {
          throw new Error('Error updating invoice');
        }
      } else {
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData)
        });

        if (response.ok) {
          const newInvoice = await response.json();
          addInvoice(newInvoice);
          toast.success('Factura creada exitosamente');
        } else {
          throw new Error('Error creating invoice');
        }
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
      console.error('Error saving invoice:', error);
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

  const totalInvoices = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidInvoices = filteredInvoices.filter(i => i.status === 'PAID').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingInvoices = filteredInvoices.filter(i => i.status === 'PENDING').reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
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

                <div className="flex justify-between items-center">
                  {editingInvoice && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('¿Estás seguro de que deseas eliminar esta factura?')) {
                          deleteInvoice(editingInvoice.id);
                          setIsCreateDialogOpen(false);
                          setEditingInvoice(null);
                          toast.success('Factura eliminada exitosamente');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Factura
                    </Button>
                  )}
                  <div className="flex space-x-2 ml-auto">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">{editingInvoice ? 'Actualizar' : 'Crear'} Factura</Button>
                  </div>
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

      {/* Filters */}
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

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Facturas Registradas</CardTitle>
              <CardDescription>
                {filteredInvoices.length > 0 
                  ? `Mostrando ${filteredInvoices.length} ${filteredInvoices.length === 1 ? 'factura' : 'facturas'} de ${invoices.length} totales`
                  : `${invoices.length} ${invoices.length === 1 ? 'factura registrada' : 'facturas registradas'}`
                }
              </CardDescription>
            </div>
            {invoices.length > 0 && filteredInvoices.length === 0 && (
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedProject('');
                setStatusFilter('all');
                setSearchTerm('');
              }}>
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No hay facturas registradas</p>
              <p className="text-xs text-gray-400 mt-2">Las facturas creadas desde gastos aparecerán aquí automáticamente</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron facturas con los filtros actuales</p>
              <p className="text-xs text-gray-400 mt-2">Intenta ajustar los filtros o búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Número</th>
                    <th className="text-left p-2">Proveedor</th>
                    <th className="text-left p-2">Proyecto</th>
                    <th className="text-left p-2">Fecha Emisión</th>
                    <th className="text-left p-2">Vencimiento</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-right p-2">Monto</th>
                    <th className="text-center p-2">Imagen</th>
                    <th className="text-center p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{invoice.invoiceNumber}</td>
                      <td className="p-2">{invoice.supplier}</td>
                      <td className="p-2">{getProjectName(invoice.projectId)}</td>
                      <td className="p-2">{new Date(invoice.issueDate).toLocaleDateString('es-HN')}</td>
                      <td className="p-2">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('es-HN') : '-'}</td>
                      <td className="p-2">
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </td>
                      <td className="p-2 text-right font-medium">
                        <div>{formatCurrency(invoice.amount, invoice.currency, invoice.exchangeRate)}</div>
                        <div className="text-xs text-gray-500">{getUSDAmount(invoice.amount, invoice.exchangeRate)} USD</div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center">
                          {invoice.fileUrl ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setImagePreview({ url: invoice.fileUrl!, invoiceNumber: invoice.invoiceNumber })}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">Sin imagen</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(invoice)}
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

      {/* Image Preview Modal */}
      {imagePreview && (
        <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Imagen de Factura - {imagePreview.invoiceNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImagePreview(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img
                src={imagePreview.url}
                alt={`Factura ${imagePreview.invoiceNumber}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imagePreview.url;
                  link.download = `factura-${imagePreview.invoiceNumber}.jpg`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button onClick={() => setImagePreview(null)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}