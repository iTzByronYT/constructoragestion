'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useBudgetStore } from '@/stores/budget-store';
import { useAuthStore } from '@/stores/auth-store';
import { ProjectBudgetTable } from '@/components/projects/project-budget-table';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { projects, updateProject } = useProjectStore();
  const { expenses } = useExpenseStore();
  const { budgetItems } = useBudgetStore();
  const { user, hasPermission } = useAuthStore();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadExpenses();
      loadBudgetItems();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      } else {
        toast.error('Error al cargar el proyecto');
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error al cargar el proyecto');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const expensesData = await response.json();
        useExpenseStore.getState().setExpenses(expensesData);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadBudgetItems = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const budgetData = await response.json();
        useBudgetStore.getState().setBudgetItems(budgetData);
      }
    } catch (error) {
      console.error('Error loading budget items:', error);
    }
  };

  const getProjectExpenses = (projectId: string) => {
    return expenses
      .filter(expense => expense.projectId === projectId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getProjectBudget = (projectId: string) => {
    return budgetItems
      .filter(item => item.projectId === projectId)
      .reduce((total, item) => total + item.totalPrice, 0);
  };

  const formatCurrency = (amount: number, currency: string = 'HNL') => {
    if (currency === 'HNL') {
      return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
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
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Proyecto no encontrado</p>
          <Button onClick={() => router.push('/projects')}>
            Volver a Proyectos
          </Button>
        </div>
      </div>
    );
  }

  const totalExpenses = getProjectExpenses(projectId);
  const totalBudget = getProjectBudget(projectId);
  const budgetBalance = totalBudget - totalExpenses;
  const exchangeRate = project.exchangeRate || 24.5;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/projects')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-500">{project.code && `Código: ${project.code}`}</p>
              </div>
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {hasPermission('update') && (
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Proyecto
                </Button>
              )}
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="budget">Presupuesto</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Resumen Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Descripción</p>
                    <p className="font-medium">{project.description || 'Sin descripción'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium">{project.location || 'Sin ubicación'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fechas</p>
                    <p className="font-medium">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString('es-HN') : 'Sin inicio'} - {' '}
                      {project.endDate ? new Date(project.endDate).toLocaleDateString('es-HN') : 'Sin fin'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Summary */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Resumen Presupuestario</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showDetails ? 'Ocultar' : 'Ver'} detalle
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium mb-2">Presupuesto Inicial</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(totalBudget, project.currency)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ${ (totalBudget / exchangeRate).toLocaleString('es-HN', { maximumFractionDigits: 0 }) } USD
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium mb-2">Órdenes de cambio aprobadas</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {formatCurrency(0, project.currency)}
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      $0 USD
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium mb-2">Presupuesto Revisado</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(totalBudget, project.currency)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ${ (totalBudget / exchangeRate).toLocaleString('es-HN', { maximumFractionDigits: 0 }) } USD
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600 font-medium mb-2">Total de Gastos</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(totalExpenses, project.currency)}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      ${ (totalExpenses / exchangeRate).toLocaleString('es-HN', { maximumFractionDigits: 0 }) } USD
                    </p>
                  </div>
                </div>

                {showDetails && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium mb-2">Balance de Presupuesto</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(budgetBalance, project.currency)}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        ${ (budgetBalance / exchangeRate).toLocaleString('es-HN', { maximumFractionDigits: 0 }) } USD
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium mb-2">Total de Ingresos</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {formatCurrency(0, project.currency)}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        $0 USD
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                      <p className="text-sm text-teal-600 font-medium mb-2">Porcentaje Utilizado</p>
                      <p className="text-2xl font-bold text-teal-900">
                        {totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0}%
                      </p>
                      <p className="text-xs text-teal-600 mt-1">
                        del presupuesto total
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Presupuesto Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Control Presupuestario</h2>
                <p className="text-gray-500">Gestión detallada del presupuesto por categorías</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar tabla
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar tabla
                </Button>
                {hasPermission('update') && (
                  <Button>
                    <Settings className="w-4 h-4 mr-2" />
                    Editar presupuesto
                  </Button>
                )}
              </div>
            </div>
            
            <ProjectBudgetTable
              projectId={projectId}
              projectName={project.name}
              currency={project.currency}
              exchangeRate={exchangeRate}
              estimatedBudget={totalBudget}
            />
          </TabsContent>

          {/* Gastos Tab */}
          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gastos del Proyecto</CardTitle>
                <CardDescription>Lista de todos los gastos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidad de gastos en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reportes Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes del Proyecto</CardTitle>
                <CardDescription>Reportes financieros y de avance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Funcionalidad de reportes en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}