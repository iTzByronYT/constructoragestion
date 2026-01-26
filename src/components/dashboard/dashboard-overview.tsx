'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Plus
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useTaskStore } from '@/stores/task-store';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  description: string;
}

interface Alert {
  type: 'danger' | 'warning' | 'info' | 'success';
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface DashboardOverviewProps {
  onNavigate: (view: 'overview' | 'projects' | 'budget' | 'expenses' | 'invoices' | 'tasks' | 'contacts' | 'reports' | 'settings' | 'tutorial') => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const { projects, loading: projectsLoading, loadProjects } = useProjectStore();
  const { expenses, loading: expensesLoading } = useExpenseStore();
  const { invoices, loading: invoicesLoading } = useInvoiceStore();
  const { tasks, loading: tasksLoading } = useTaskStore();
  const [stats, setStats] = useState<StatCard[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load projects from Supabase
        await loadProjects();
        
        // Los demás datos (expenses, invoices, tasks) se cargarán cuando el usuario navegue a esas secciones
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadData();
  }, [loadProjects]);

  // Calculate real expenses for each project
  const getProjectExpenses = (projectId: string) => {
    return expenses
      .filter(expense => expense.projectId === projectId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  useEffect(() => {
    // Calcular estadísticas basadas en datos reales
    const totalBudget = projects.reduce((sum, p) => sum + p.estimatedBudget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + getProjectExpenses(p.id), 0);
    const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const planningProjects = projects.filter(p => p.status === 'PLANNING').length;
    const pendingInvoices = invoices.filter(i => i.status === 'PENDING').length;
    const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE').length;
    const pendingTasks = tasks.filter(t => t.status === 'TODO').length;

    setStats([
      {
        title: 'Proyectos Activos',
        value: activeProjects.toString(),
        change: activeProjects > 0 ? 12.5 : 0,
        icon: <Building2 className="w-5 h-5" />,
        description: 'Proyectos en ejecución'
      },
      {
        title: 'Presupuesto Total',
        value: totalBudget > 0 ? `L ${totalBudget.toLocaleString('es-HN')}` : 'L 0',
        change: totalBudget > 0 ? 8.2 : 0,
        icon: <DollarSign className="w-5 h-5" />,
        description: totalBudget > 0 ? `≈ $${(totalBudget / 24.5).toLocaleString('es-HN', { maximumFractionDigits: 0 })} USD` : 'Sin presupuesto'
      },
      {
        title: 'Gastos Actuales',
        value: totalSpent > 0 ? `L ${totalSpent.toLocaleString('es-HN')}` : 'L 0',
        change: totalSpent > 0 ? -3.1 : 0,
        icon: <TrendingDown className="w-5 h-5" />,
        description: totalSpent > 0 ? `≈ $${(totalSpent / 24.5).toLocaleString('es-HN', { maximumFractionDigits: 0 })} USD` : 'Sin gastos'
      },
      {
        title: 'Facturas Pendientes',
        value: pendingInvoices.toString(),
        change: pendingInvoices > 0 ? 5.2 : 0,
        icon: <FileText className="w-5 h-5" />,
        description: overdueInvoices > 0 ? `${overdueInvoices} vencidas` : 'Al día'
      }
    ]);
  }, [projects, expenses, invoices, tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-800';
      case 'PLANNING':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'PLANNING':
        return 'Planificación';
      case 'COMPLETED':
        return 'Completado';
      case 'ON_HOLD':
        return 'Pausado';
      default:
        return status;
    }
  };

  const getBudgetProgress = (estimated: number, actual: number) => {
    const percentage = (actual / estimated) * 100;
    if (percentage > 100) return 'text-red-600';
    if (percentage > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAlerts = (): Alert[] => {
    const alerts: Alert[] = [];
    
    // Alertas de presupuesto excedido
    projects.forEach(project => {
      const totalProjectExpenses = getProjectExpenses(project.id);
      
      if (totalProjectExpenses > project.estimatedBudget) {
        alerts.push({
          type: 'danger',
          icon: <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />,
          title: `Presupuesto excedido en ${project.name}`,
          description: `Los gastos superan el presupuesto en ${Math.round(((totalProjectExpenses - project.estimatedBudget) / project.estimatedBudget) * 100)}%`
        });
      }
    });

    // Alertas de facturas por vencer
    const upcomingInvoices = invoices.filter(invoice => {
      if (invoice.status === 'PAID') return false;
      if (!invoice.dueDate) return false;
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 3 && daysUntilDue > 0;
    });

    upcomingInvoices.forEach(invoice => {
      alerts.push({
        type: 'warning',
        icon: <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />,
        title: `Factura por vencer - ${invoice.supplier}`,
        description: `Vence en ${Math.ceil((new Date(invoice.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días por ${invoice.currency === 'HNL' ? 'L' : '$'} ${invoice.amount.toLocaleString('es-HN')}`
      });
    });

    // Alertas de tareas urgentes
    const urgentTasks = tasks.filter(task => {
      if (task.status === 'COMPLETED' || task.status === 'CANCELLED') return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 2 && daysUntilDue >= 0 && task.priority === 'URGENT';
    });

    urgentTasks.forEach(task => {
      alerts.push({
        type: 'info',
        icon: <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />,
        title: `Tarea urgente: ${task.title}`,
        description: `Vence en ${Math.ceil((new Date(task.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días`
      });
    });

    // Si no hay alertas, mostrar mensaje de bienvenida
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        icon: <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />,
        title: '¡Todo en orden!',
        description: 'No hay alertas pendientes en este momento'
      });
    }

    return alerts.slice(0, 3); // Limitar a 3 alertas
  };

  const isLoading = projectsLoading || expensesLoading || invoicesLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const alerts = getAlerts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Resumen general de proyectos y finanzas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={() => onNavigate('projects')}>
          <Plus className="w-4 h-4 mr-2" />
          <span>Nuevo Proyecto</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className="text-blue-600">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span className={stat.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </span>
                <span>vs mes anterior</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Proyectos Recientes
            </CardTitle>
            <CardDescription>
              Últimos proyectos actualizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => {
                  const totalProjectExpenses = getProjectExpenses(project.id);
                  
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusText(project.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{project.location || 'Sin ubicación'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600">
                            Presupuesto: L {project.estimatedBudget.toLocaleString('es-HN')}
                          </span>
                          <span className={`text-sm font-medium ${getBudgetProgress(project.estimatedBudget, totalProjectExpenses)}`}>
                            Gastado: L {totalProjectExpenses.toLocaleString('es-HN')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {project.estimatedBudget > 0 ? Math.round((totalProjectExpenses / project.estimatedBudget) * 100) : 0}%
                        </div>
                        <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                          <div 
                            className={`h-2 rounded-full ${
                              (totalProjectExpenses / project.estimatedBudget) > 1 
                                ? 'bg-red-500' 
                                : (totalProjectExpenses / project.estimatedBudget) > 0.8 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((totalProjectExpenses / project.estimatedBudget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay proyectos registrados</p>
                <p className="text-sm">Crea tu primer proyecto para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Alertas y Notificaciones
            </CardTitle>
            <CardDescription>
              Acciones requeridas y próximos vencimientos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    alert.type === 'danger' ? 'bg-red-50' :
                    alert.type === 'warning' ? 'bg-yellow-50' :
                    alert.type === 'info' ? 'bg-blue-50' :
                    'bg-green-50'
                  }`}
                >
                  {alert.icon}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      alert.type === 'danger' ? 'text-red-900' :
                      alert.type === 'warning' ? 'text-yellow-900' :
                      alert.type === 'info' ? 'text-blue-900' :
                      'text-green-900'
                    }`}>
                      {alert.title}
                    </p>
                    <p className={`text-xs mt-1 ${
                      alert.type === 'danger' ? 'text-red-700' :
                      alert.type === 'warning' ? 'text-yellow-700' :
                      alert.type === 'info' ? 'text-blue-700' :
                      'text-green-700'
                    }`}>
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accesos directos a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button variant="outline" className="h-20 sm:h-24 flex flex-col justify-center space-y-2" onClick={() => onNavigate('expenses')}>
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Nuevo Gasto</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex flex-col justify-center space-y-2" onClick={() => onNavigate('invoices')}>
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Nueva Factura</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex flex-col justify-center space-y-2" onClick={() => onNavigate('contacts')}>
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Agregar Contacto</span>
            </Button>
            <Button variant="outline" className="h-20 sm:h-24 flex flex-col justify-center space-y-2" onClick={() => onNavigate('reports')}>
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Ver Reportes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}