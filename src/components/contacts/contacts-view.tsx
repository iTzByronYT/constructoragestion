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
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, Building, Users, Wrench } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  type: string;
  company: string | null;
  rtn: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ContactsView() {
  const { user, hasPermission } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'CLIENT',
    company: '',
    rtn: ''
  });

  const contactTypes = ['CLIENT', 'SUPPLIER', 'WORKER'];

  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: '1',
        name: 'Inmobiliaria del Centro S.A.',
        email: 'info@inmobiliariacentro.hn',
        phone: '+504 2234-5678',
        address: 'Tegucigalpa, Colonia Palmira',
        type: 'CLIENT',
        company: 'Inmobiliaria del Centro S.A.',
        rtn: '08011995000123',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Holcim Honduras',
        email: 'ventas@holcim.hn',
        phone: '+504 2232-1000',
        address: 'San Pedro Sula, Zona Industrial',
        type: 'SUPPLIER',
        company: 'Holcim Honduras',
        rtn: '08011997000456',
        createdAt: '2024-01-16T00:00:00.000Z',
        updatedAt: '2024-01-16T00:00:00.000Z'
      },
      {
        id: '3',
        name: 'Carlos Méndez',
        email: 'carlos.mendez@email.com',
        phone: '+504 9876-5432',
        address: 'Tegucigalpa, Colonia Kennedy',
        type: 'WORKER',
        company: null,
        rtn: '08011995000789',
        createdAt: '2024-01-17T00:00:00.000Z',
        updatedAt: '2024-01-17T00:00:00.000Z'
      }
    ];
    setContacts(mockContacts);
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || contact.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return 'bg-blue-100 text-blue-800';
      case 'SUPPLIER':
        return 'bg-green-100 text-green-800';
      case 'WORKER':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return 'Cliente';
      case 'SUPPLIER':
        return 'Proveedor';
      case 'WORKER':
        return 'Trabajador';
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CLIENT':
        return <Building className="w-5 h-5" />;
      case 'SUPPLIER':
        return <Wrench className="w-5 h-5" />;
      case 'WORKER':
        return <Users className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasPermission('create')) {
      toast.error('No tienes permisos para crear contactos');
      return;
    }

    try {
      const contactData = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingContact) {
        setContacts(prev => prev.map(contact => 
          contact.id === editingContact.id ? { ...contactData, id: editingContact.id } : contact
        ));
        toast.success('Contacto actualizado exitosamente');
      } else {
        setContacts(prev => [...prev, { ...contactData, id: Date.now().toString() }]);
        toast.success('Contacto creado exitosamente');
      }

      setIsCreateDialogOpen(false);
      setEditingContact(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'CLIENT',
        company: '',
        rtn: ''
      });
    } catch (error) {
      toast.error('Error al guardar el contacto');
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      type: contact.type,
      company: contact.company || '',
      rtn: contact.rtn || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!hasPermission('delete')) {
      toast.error('No tienes permisos para eliminar contactos');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este contacto?')) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      toast.success('Contacto eliminado exitosamente');
    }
  };

  const clientCount = contacts.filter(c => c.type === 'CLIENT').length;
  const supplierCount = contacts.filter(c => c.type === 'SUPPLIER').length;
  const workerCount = contacts.filter(c => c.type === 'WORKER').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Directorio</h1>
          <p className="text-gray-500 mt-1">Gestión de clientes, proveedores y trabajadores</p>
        </div>
        {hasPermission('create') && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingContact ? 'Editar Contacto' : 'Nuevo Contacto'}</DialogTitle>
                <DialogDescription>Agrega un nuevo contacto al directorio</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                      <SelectContent>
                        {contactTypes.map(type => (
                          <SelectItem key={type} value={type}>{getTypeText(type)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input id="company" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rtn">RTN</Label>
                    <Input id="rtn" value={formData.rtn} onChange={(e) => setFormData(prev => ({ ...prev, rtn: e.target.value }))} placeholder="0801-XXXX-XXXXX" />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{editingContact ? 'Actualizar' : 'Crear'} Contacto</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Building className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
            <p className="text-xs text-gray-500">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proveedores</CardTitle>
            <Wrench className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supplierCount}</div>
            <p className="text-xs text-gray-500">Proveedores activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores</CardTitle>
            <Users className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workerCount}</div>
            <p className="text-xs text-gray-500">Personal registrado</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Search className="w-5 h-5 mr-2" />Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input placeholder="Buscar por nombre, email o empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {contactTypes.map(type => (
                  <SelectItem key={type} value={type}>{getTypeText(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">
                    {getTypeIcon(contact.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    {contact.company && (
                      <CardDescription>{contact.company}</CardDescription>
                    )}
                  </div>
                </div>
                <Badge className={getTypeColor(contact.type)}>
                  {getTypeText(contact.type)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {contact.email}
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {contact.phone}
                  </div>
                )}
                
                {contact.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {contact.address}
                  </div>
                )}
                
                {contact.rtn && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">RTN:</span> {contact.rtn}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-3 border-t">
                  {hasPermission('update') && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(contact)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {hasPermission('delete') && (
                    <Button variant="outline" size="sm" onClick={() => handleDelete(contact.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron contactos</h3>
            <p className="text-gray-500">Agrega tu primer contacto para comenzar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}