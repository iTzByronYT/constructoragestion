'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Globe, 
  Bell, 
  Shield, 
  Database,
  Save,
  Download,
  Upload,
  Settings as SettingsIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useBudgetStore } from '@/stores/budget-store';
import { useTaskStore } from '@/stores/task-store';
import { toast } from 'sonner';

export function SettingsView() {
  const { user } = useAuthStore();
  const { projects } = useProjectStore();
  const { expenses } = useExpenseStore();
  const { invoices } = useInvoiceStore();
  const { budgetItems } = useBudgetStore();
  const { tasks } = useTaskStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [systemSettings, setSystemSettings] = useState({
    language: 'es',
    currency: 'HNL',
    exchangeRate: 24.5,
    timezone: 'America/Tegucigalpa',
    dateFormat: 'DD/MM/YYYY',
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  // Cargar configuración guardada al montar el componente
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Cargando configuración guardada...');
        const response = await fetch('/api/settings');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Configuración cargada:', data);
          
          // Actualizar el estado con la configuración guardada
          setSystemSettings(prev => ({
            ...prev,
            ...data,
            // Asegurarse de que los booleanos sean correctos
            notifications: Boolean(data.notifications),
            emailAlerts: Boolean(data.emailAlerts),
            darkMode: Boolean(data.darkMode),
            autoBackup: Boolean(data.autoBackup)
          }));
        } else {
          console.log('Usando configuración por defecto');
        }
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
      }
    };

    loadSettings();
  }, []);

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];

  const currencies = [
    { code: 'HNL', name: 'Lempira Hondureña', symbol: 'L' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' }
  ];

  const timezones = [
    { value: 'America/Tegucigalpa', label: 'Hora Honduras (GMT-6)' },
    { value: 'America/New_York', label: 'Hora Nueva York (GMT-5)' },
    { value: 'America/Los_Angeles', label: 'Hora Los Ángeles (GMT-8)' }
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulación de actualización
      console.log('Actualizando perfil:', formData);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    }
  };

  const handlePasswordUpdate = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Simulación de actualización de contraseña
      console.log('Actualizando contraseña');
      toast.success('Contraseña actualizada exitosamente');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    }
  };

  const handleSystemSettingsUpdate = async () => {
    console.log('Iniciando guardado de configuración...');
    console.log('Datos a enviar:', systemSettings);
    
    try {
      // Validar que la tasa de cambio sea un número válido
      if (systemSettings.exchangeRate <= 0) {
        const errorMsg = 'La tasa de cambio debe ser un número mayor a ';
        console.error(errorMsg, systemSettings.exchangeRate);
        toast.error(errorMsg);
        return;
      }

      // Mostrar mensaje de carga
      toast.loading('Guardando configuración...');

      // Intentar guardar en la base de datos
      console.log('Enviando solicitud a /api/settings...');
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      }).catch(err => {
        console.error('Error en la solicitud fetch:', err);
        throw new Error('No se pudo conectar con el servidor');
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);
      
      // Ocultar mensaje de carga
      toast.dismiss();

      if (!response.ok) {
        let errorMsg = 'Error al guardar la configuración';
        try {
          const errorData = await response.json();
          console.error('Detalles del error:', errorData);
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          console.error('No se pudo analizar la respuesta de error:', e);
        }
        throw new Error(errorMsg);
      }

      const updatedSettings = await response.json().catch(err => {
        console.error('Error al analizar la respuesta JSON:', err);
        throw new Error('Error al procesar la respuesta del servidor');
      });
      
      console.log('Configuración actualizada:', updatedSettings);
      
      // Actualizar el estado local asegurando que los tipos sean correctos
      setSystemSettings(prev => ({
        ...prev,
        ...updatedSettings,
        // Asegurarse de que los booleanos sean realmente booleanos
        notifications: Boolean(updatedSettings.notifications),
        emailAlerts: Boolean(updatedSettings.emailAlerts),
        darkMode: Boolean(updatedSettings.darkMode),
        autoBackup: Boolean(updatedSettings.autoBackup)
      }));
      
      // Mostrar notificación de éxito
      toast.success('Configuración guardada exitosamente');
      
      // Si se cambió el tema, recargar la página
      const darkModeChanged = updatedSettings.darkMode !== systemSettings.darkMode;
      console.log('¿Cambió el modo oscuro?', darkModeChanged);
      
      if (darkModeChanged) {
        console.log('Modo oscuro cambiado, recargando página...');
        // Forzar un hard reload para asegurar que los estilos se apliquen
        setTimeout(() => window.location.href = window.location.href, 500);
      }
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      toast.error(error instanceof Error ? error.message : 'Error desconocido al guardar la configuración');
    }
  };

  const handleBackup = async () => {
    try {
      // Crear backup completo en formato JSON
      const backupData = {
        metadata: {
          version: '1.0',
          createdAt: new Date().toISOString(),
          createdBy: user?.email,
          systemName: 'ProXis - Sistema de Gestión de Proyectos'
        },
        data: {
          projects: projects,
          expenses: expenses,
          invoices: invoices,
          budgetItems: budgetItems,
          tasks: tasks,
          systemSettings: systemSettings
        },
        statistics: {
          totalProjects: projects.length,
          totalExpenses: expenses.length,
          totalInvoices: invoices.length,
          totalBudgetItems: budgetItems.length,
          totalTasks: tasks.length
        }
      };

      // Convertir a JSON con formato legible
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Crear blob y descargar
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proxis-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Backup creado y descargado exitosamente');
    } catch (error) {
      console.error('Error al crear backup:', error);
      toast.error('Error al iniciar el backup');
    }
  };

  const handleExportData = async () => {
    try {
      // Crear archivo CSV con todos los datos
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Encabezado del archivo
      csvContent += `EXPORTACIÓN DE DATOS - PROXIS\n`;
      csvContent += `Fecha de exportación:,${new Date().toLocaleString('es-HN')}\n`;
      csvContent += `Usuario:,${user?.name || user?.email}\n\n`;
      
      // PROYECTOS
      csvContent += `PROYECTOS\n`;
      csvContent += `Nombre,Código,Presupuesto,Moneda,Estado,Ubicación,Fecha Inicio,Fecha Fin\n`;
      projects.forEach(p => {
        csvContent += `${p.name},${p.code || ''},${p.estimatedBudget || 0},${p.currency || 'HNL'},${p.status || ''},${p.location || ''},${p.startDate || ''},${p.endDate || ''}\n`;
      });
      csvContent += `\n`;
      
      // GASTOS
      csvContent += `GASTOS\n`;
      csvContent += `Proyecto,Descripción,Monto,Moneda,Categoría,Proveedor,Fecha,Factura\n`;
      expenses.forEach(e => {
        const project = projects.find(p => p.id === e.projectId);
        csvContent += `${project?.name || 'N/A'},${e.description},${e.amount},${e.currency},${e.category},${e.supplier || ''},${e.date},${e.invoiceNumber || ''}\n`;
      });
      csvContent += `\n`;
      
      // FACTURAS
      csvContent += `FACTURAS\n`;
      csvContent += `Proyecto,Número,Proveedor,Monto,Moneda,Estado,Fecha Emisión,Fecha Vencimiento\n`;
      invoices.forEach(i => {
        const project = projects.find(p => p.id === i.projectId);
        csvContent += `${project?.name || 'N/A'},${i.invoiceNumber},${i.supplier},${i.amount},${i.currency},${i.status},${i.issueDate},${i.dueDate}\n`;
      });
      csvContent += `\n`;
      
      // PRESUPUESTOS
      csvContent += `PRESUPUESTO\n`;
      csvContent += `Proyecto,Categoría,Descripción,Cantidad,Precio Unitario,Precio Total\n`;
      budgetItems.forEach(b => {
        const project = projects.find(p => p.id === b.projectId);
        csvContent += `${project?.name || 'N/A'},${b.category},${b.description},${b.quantity},${b.unitPrice},${b.totalPrice}\n`;
      });
      csvContent += `\n`;
      
      // TAREAS
      csvContent += `TAREAS\n`;
      csvContent += `Proyecto,Título,Descripción,Prioridad,Estado,Fecha Vencimiento\n`;
      tasks.forEach(t => {
        const project = projects.find(p => p.id === t.projectId);
        csvContent += `${project?.name || 'N/A'},${t.title},${t.description || ''},${t.priority},${t.status},${t.dueDate || ''}\n`;
      });
      csvContent += `\n`;
      
      // ESTADÍSTICAS
      csvContent += `ESTADÍSTICAS\n`;
      csvContent += `Total Proyectos,${projects.length}\n`;
      csvContent += `Total Gastos,${expenses.length}\n`;
      csvContent += `Total Facturas,${invoices.length}\n`;
      csvContent += `Total Items Presupuesto,${budgetItems.length}\n`;
      csvContent += `Total Tareas,${tasks.length}\n`;
      
      csvContent += `\n\nSistema desarrollado por Byron Landero\n`;
      csvContent += `ProXis - Sistema de Gestión de Proyectos de Construcción\n`;
      
      // Descargar archivo
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `proxis-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Datos exportados exitosamente a CSV');
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const getRoleColor = (role: string) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona tu cuenta y la configuración del sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Menú de Configuración</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                <Button
                  variant={activeTab === 'profile' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Perfil de Usuario
                </Button>
                <Button
                  variant={activeTab === 'system' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('system')}
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Configuración del Sistema
                </Button>
                <Button
                  variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones
                </Button>
                <Button
                  variant={activeTab === 'security' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Seguridad
                </Button>
                <Button
                  variant={activeTab === 'backup' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('backup')}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Backup y Datos
                </Button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Información del Perfil
                  </CardTitle>
                  <CardDescription>
                    Actualiza tu información personal y de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-700">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{user?.name}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <Badge className={getRoleColor(user?.role || '')}>
                          {getRoleText(user?.role || '')}
                        </Badge>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre Completo</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+504 XXXX-XXXX"
                        />
                      </div>

                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button onClick={handlePasswordUpdate}>
                      <Shield className="w-4 h-4 mr-2" />
                      Actualizar Contraseña
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'system' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Configuración del Sistema
                </CardTitle>
                <CardDescription>
                  Personaliza la configuración general del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select value={systemSettings.language} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Moneda Principal</Label>
                      <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exchangeRate">Tasa de Cambio (HNL/USD)</Label>
                      <Input
                        id="exchange-rate"
                        type="number"
                        step="0.01"
                        value={systemSettings.exchangeRate}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setSystemSettings(prev => ({ ...prev, exchangeRate: value }));
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Formato de Fecha</Label>
                      <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Modo Oscuro</Label>
                        <p className="text-sm text-gray-500">Activa el tema oscuro de la interfaz</p>
                      </div>
                      <Switch
                        checked={systemSettings.darkMode}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, darkMode: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificaciones</Label>
                        <p className="text-sm text-gray-500">Recibe notificaciones del sistema</p>
                      </div>
                      <Switch
                        checked={systemSettings.notifications}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, notifications: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alertas por Email</Label>
                        <p className="text-sm text-gray-500">Recibe alertas importantes por correo</p>
                      </div>
                      <Switch
                        checked={systemSettings.emailAlerts}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, emailAlerts: checked }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSystemSettingsUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Configuración de Notificaciones
                </CardTitle>
                <CardDescription>
                  Personaliza cómo y cuándo recibes notificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificaciones por Email</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Nuevos Proyectos</Label>
                        <p className="text-sm text-gray-500">Cuando se crea un nuevo proyecto</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Gastos Excedidos</Label>
                        <p className="text-sm text-gray-500">Cuando un gasto supera el presupuesto</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Facturas por Vencer</Label>
                        <p className="text-sm text-gray-500">Recordatorios de facturas próximas a vencer</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Tareas Críticas</Label>
                        <p className="text-sm text-gray-500">Cuando hay tareas urgentes o vencidas</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notificaciones del Sistema</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificaciones en Browser</Label>
                        <p className="text-sm text-gray-500">Muestra notificaciones en el navegador</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sonidos de Notificación</Label>
                        <p className="text-sm text-gray-500">Reproduce sonidos para notificaciones importantes</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Preferencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Seguridad
                </CardTitle>
                <CardDescription>
                  Configura las opciones de seguridad de tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Autenticación</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Autenticación de Dos Factores</Label>
                        <p className="text-sm text-gray-500">Añade una capa adicional de seguridad</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sesiones Activas</Label>
                        <p className="text-sm text-gray-500">Gestiona las sesiones activas de tu cuenta</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Sesiones
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Privacidad</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Perfil Público</Label>
                        <p className="text-sm text-gray-500">Haz tu perfil visible para otros usuarios</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compartir Actividad</Label>
                        <p className="text-sm text-gray-500">Permite que otros vean tu actividad reciente</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Registro de Actividad</h3>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Último inicio de sesión: {new Date().toLocaleDateString('es-HN')} a las {new Date().toLocaleTimeString('es-HN')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Dirección IP: 192.168.1.1
                      </p>
                      <p className="text-sm text-gray-600">
                        Dispositivo: Chrome en Windows
                      </p>
                    </div>

                    <Button variant="outline">
                      Ver Registro Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'backup' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Backup y Datos
                </CardTitle>
                <CardDescription>
                  Gestiona los respaldos de tu información
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Backup Automático</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Backup Automático</Label>
                        <p className="text-sm text-gray-500">Crea respaldos automáticos de tus datos</p>
                      </div>
                      <Switch
                        checked={systemSettings.autoBackup}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Frecuencia de Backup</Label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                        disabled={!systemSettings.autoBackup}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diario</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Backup Manual</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={handleBackup}>
                        <Download className="w-4 h-4 mr-2" />
                        Crear Backup Ahora
                      </Button>
                      <Button variant="outline" onClick={handleExportData}>
                        <Upload className="w-4 h-4 mr-2" />
                        Exportar Datos
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Historial de Backups</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Backup Completo</p>
                          <p className="text-sm text-gray-500">15 de Enero, 2024 - 10:30 AM</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Backup Completo</p>
                          <p className="text-sm text-gray-500">14 de Enero, 2024 - 10:30 AM</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}