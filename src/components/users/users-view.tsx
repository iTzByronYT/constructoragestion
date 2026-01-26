'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Users, Shield, Eye, UserCog } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'VISUALIZER';
  phone: string | null;
  createdAt: string;
}

export function UsersView() {
  const { user: currentUser, hasPermission } = useAuthStore();
  
  // Inicializar con el usuario actual si existe
  const [users, setUsers] = useState<User[]>(() => {
    if (currentUser) {
      return [{
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        phone: currentUser.phone || null,
        createdAt: new Date().toISOString()
      }];
    }
    return [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'VISUALIZER' as 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'VISUALIZER',
    phone: '',
    password: ''
  });

  // Actualizar la lista de usuarios cuando cambie el usuario actual
  useEffect(() => {
    if (currentUser) {
      setUsers([{
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        phone: currentUser.phone || null,
        createdAt: new Date().toISOString()
      }]);
    }
  }, [currentUser]);

  // Verificar que el usuario actual sea ADMIN
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Shield className="w-6 h-6 mr-2" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Solo los administradores pueden acceder a la gestión de usuarios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'ACCOUNTANT':
        return 'bg-green-100 text-green-800';
      case 'VISUALIZER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'ACCOUNTANT':
        return 'Contador';
      case 'VISUALIZER':
        return 'Visualizador';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      case 'MANAGER':
        return <UserCog className="w-4 h-4" />;
      case 'ACCOUNTANT':
        return <Users className="w-4 h-4" />;
      case 'VISUALIZER':
        return <Eye className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name || '',
      role: user.role,
      phone: user.phone || '',
      password: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Actualizar usuario
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, name: formData.name || null, phone: formData.phone || null }
          : u
      ));
      toast.success('Usuario actualizado exitosamente');
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: formData.email,
        name: formData.name || null,
        role: formData.role,
        phone: formData.phone || null,
        createdAt: new Date().toISOString()
      };
      setUsers([...users, newUser]);
      toast.success('Usuario creado exitosamente');
    }

    setIsCreateDialogOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      role: 'VISUALIZER',
      phone: '',
      password: ''
    });
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuario eliminado exitosamente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los usuarios y sus permisos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modifica la información del usuario' : 'Crea un nuevo usuario del sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@ejemplo.com"
                  required
                  disabled={!!editingUser}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Administrador
                      </div>
                    </SelectItem>
                    <SelectItem value="MANAGER">
                      <div className="flex items-center">
                        <UserCog className="w-4 h-4 mr-2" />
                        Gerente
                      </div>
                    </SelectItem>
                    <SelectItem value="ACCOUNTANT">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Contador
                      </div>
                    </SelectItem>
                    <SelectItem value="VISUALIZER">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+504 9999-9999"
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    required={!editingUser}
                  />
                </div>
              )}

              <div className="flex justify-between items-center pt-4">
                {editingUser && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      handleDelete(editingUser.id);
                      setIsCreateDialogOpen(false);
                      setEditingUser(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Usuario
                  </Button>
                )}
                <div className="flex space-x-2 ml-auto">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingUser(null);
                  }}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Actualizar' : 'Crear'} Usuario
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
                <SelectItem value="MANAGER">Gerente</SelectItem>
                <SelectItem value="ACCOUNTANT">Contador</SelectItem>
                <SelectItem value="VISUALIZER">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'usuario' : 'usuarios'} {roleFilter !== 'all' ? `con rol ${getRoleText(roleFilter)}` : 'totales'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          {getRoleIcon(user.role)}
                        </div>
                        {user.name || 'Sin nombre'}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('es-HN')}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          title="Editar usuario"
                          className="text-blue-600"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Información de Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos por Rol</CardTitle>
          <CardDescription>
            Descripción de los permisos de cada rol en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="font-semibold">Administrador</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Todos los permisos</li>
                <li>✓ Gestionar usuarios</li>
                <li>✓ Configuración del sistema</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <UserCog className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="font-semibold">Gerente</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Crear proyectos</li>
                <li>✓ Editar y eliminar</li>
                <li>✓ Ver reportes</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold">Contador</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Gestionar gastos</li>
                <li>✓ Gestionar facturas</li>
                <li>✓ Ver reportes</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center mb-2">
                <Eye className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold">Visualizador</h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Solo lectura</li>
                <li>✓ Ver proyectos</li>
                <li>✓ Ver reportes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
