'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useProjectStore } from '@/stores/project-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useTaskStore } from '@/stores/task-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  DollarSign, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Calculator,
  Receipt,
  ClipboardList,
  FolderOpen,
  Phone,
  Bell,
  Search,
  PlayCircle,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { ProjectsView } from '@/components/projects/projects-view';
import { BudgetView } from '@/components/budget/budget-view';
import { ExpensesView } from '@/components/expenses/expenses-view';
import { InvoicesView } from '@/components/invoices/invoices-view';
import { TasksView } from '@/components/tasks/tasks-view';
import { ContactsView } from '@/components/contacts/contacts-view';
import { ReportsView } from '@/components/reports/reports-view';
import { UsersView } from '@/components/users/users-view';
import { TutorialView } from '@/components/tutorial/tutorial-view';
import { SettingsView } from '@/components/settings/settings-view';

import Image from 'next/image';

type ViewType = 'overview' | 'projects' | 'budget' | 'expenses' | 'invoices' | 'tasks' | 'contacts' | 'reports' | 'users' | 'settings' | 'tutorial';

const menuItems = [
  { id: 'overview', label: 'Dashboard', icon: Home },
  { id: 'projects', label: 'Proyectos', icon: Building2 },
  { id: 'budget', label: 'Presupuestos', icon: Calculator },
  { id: 'expenses', label: 'Gastos', icon: DollarSign },
  { id: 'invoices', label: 'Facturas', icon: Receipt },
  { id: 'tasks', label: 'Pendientes', icon: ClipboardList },
  { id: 'contacts', label: 'Directorio', icon: Phone },
  { id: 'reports', label: 'Reportes', icon: FileText },
  { id: 'users', label: 'Usuarios', icon: Users, adminOnly: true },
  { id: 'tutorial', label: 'Tutorial', icon: BookOpen },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/logo-dashboard.png');
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const { user, logout, hasPermission } = useAuthStore();
  const { projects } = useProjectStore();
  const { expenses } = useExpenseStore();
  const { tasks } = useTaskStore();
  const { invoices } = useInvoiceStore();

  // Limpiar datos viejos de localStorage (migración a Supabase)
  useEffect(() => {
    const supabaseMigrated = localStorage.getItem('supabase-migrated-v3');
    if (!supabaseMigrated) {
      // Limpiar TODO el localStorage incluyendo auth (para generar nuevos UUIDs)
      localStorage.clear();
      sessionStorage.clear();
      
      // Marcar como migrado con nueva versión
      localStorage.setItem('supabase-migrated-v3', 'true');
      
      console.log('✅ Migración a Supabase V3 completada - TODO limpiado (incluyendo auth)');
      console.log('⚠️ Necesitarás iniciar sesión de nuevo');
      
      // Recargar la página
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Función de búsqueda global
  const searchResults = () => {
    if (!searchQuery.trim()) return { projects: [], expenses: [], tasks: [], invoices: [] };
    
    const query = searchQuery.toLowerCase();
    
    return {
      projects: projects.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
      ).slice(0, 5),
      expenses: expenses.filter(e => 
        e.description.toLowerCase().includes(query) ||
        e.supplier?.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      ).slice(0, 5),
      tasks: tasks.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      ).slice(0, 5),
      invoices: invoices.filter(i => 
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.supplier.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      ).slice(0, 5)
    };
  };

  const results = searchResults();
  const totalResults = results.projects.length + results.expenses.length + results.tasks.length + results.invoices.length;

  const handleSearchClick = (type: string, id: string) => {
    if (type === 'project') setCurrentView('projects');
    else if (type === 'expense') setCurrentView('expenses');
    else if (type === 'task') setCurrentView('tasks');
    else if (type === 'invoice') setCurrentView('invoices');
    setSearchDialogOpen(false);
    setSearchQuery('');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview onNavigate={setCurrentView} />;
      case 'projects':
        return <ProjectsView />;
      case 'budget':
        return <BudgetView />;
      case 'expenses':
        return <ExpensesView />;
      case 'invoices':
        return <InvoicesView />;
      case 'tasks':
        return <TasksView />;
      case 'contacts':
        return <ContactsView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'tutorial':
        return <TutorialView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview onNavigate={setCurrentView} />;
    }
  };

  const canAccess = (view: ViewType) => {
    if (!user) return false;
    
    // Solo ADMIN puede acceder a gestión de usuarios
    if (view === 'users') {
      return user.role === 'ADMIN';
    }
    
    // Los administradores pueden acceder a todo
    if (user.role === 'ADMIN') return true;
    
    // Los gerentes pueden acceder a todo excepto usuarios
    if (user.role === 'MANAGER') {
      return view !== 'users' as ViewType;
    }
    
    // Los contadores pueden acceder a presupuestos, gastos, facturas y reportes
    if (user.role === 'ACCOUNTANT') {
      return ['budget', 'expenses', 'invoices', 'reports', 'overview', 'tutorial'].includes(view as string);
    }
    
    // Los visualizadores solo pueden ver el dashboard, reportes y tutorial
    if (user.role === 'VISUALIZER') {
      return ['overview', 'reports', 'tutorial'].includes(view as string);
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-3">
                      <Image src={logoSrc} alt="ProXis logo" width={170} height={170} className="rounded-lg" onError={() => setLogoSrc('/logo.svg')} />
                      <div>
                        <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                      if (!canAccess(item.id as ViewType)) return null;
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={currentView === item.id ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setCurrentView(item.id as ViewType);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Desktop Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Image src={logoSrc} alt="ProXis logo" width={144} height={144} className="rounded-lg" onError={() => setLogoSrc('/logo.svg')} />
                  <div className="hidden sm:block">
                    <p className="text-sm text-gray-500">Sistema de Gestión</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 cursor-pointer" onClick={() => setSearchDialogOpen(true)}>
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos, gastos, tareas..."
                  className="bg-transparent border-none outline-none text-sm w-32 lg:w-64 cursor-pointer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchDialogOpen(true)}
                  readOnly
                />
              </div>

              {/* Diálogo de búsqueda */}
              <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Búsqueda Global</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                      <Search className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar proyectos, gastos, tareas, facturas..."
                        className="bg-transparent border-none outline-none text-sm w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>

                    {searchQuery && totalResults === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No se encontraron resultados para "{searchQuery}"</p>
                      </div>
                    )}

                    {searchQuery && totalResults > 0 && (
                      <div className="space-y-4">
                        {/* Proyectos */}
                        {results.projects.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              Proyectos ({results.projects.length})
                            </h3>
                            <div className="space-y-2">
                              {results.projects.map(project => (
                                <div
                                  key={project.id}
                                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                  onClick={() => handleSearchClick('project', project.id)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{project.name}</p>
                                      {project.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                                      )}
                                    </div>
                                    {project.code && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{project.code}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Gastos */}
                        {results.expenses.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Gastos ({results.expenses.length})
                            </h3>
                            <div className="space-y-2">
                              {results.expenses.map(expense => (
                                <div
                                  key={expense.id}
                                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                  onClick={() => handleSearchClick('expense', expense.id)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{expense.description}</p>
                                      <p className="text-sm text-gray-500">{expense.category}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">{expense.currency} {expense.amount.toLocaleString()}</p>
                                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tareas */}
                        {results.tasks.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                              <ClipboardList className="w-4 h-4 mr-2" />
                              Tareas ({results.tasks.length})
                            </h3>
                            <div className="space-y-2">
                              {results.tasks.map(task => (
                                <div
                                  key={task.id}
                                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                  onClick={() => handleSearchClick('task', task.id)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{task.title}</p>
                                      {task.description && (
                                        <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                                      )}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {task.status === 'COMPLETED' ? 'Completada' : task.status === 'IN_PROGRESS' ? 'En Progreso' : 'Pendiente'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Facturas */}
                        {results.invoices.length > 0 && (
                          <div>
                            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                              <Receipt className="w-4 h-4 mr-2" />
                              Facturas ({results.invoices.length})
                            </h3>
                            <div className="space-y-2">
                              {results.invoices.map(invoice => (
                                <div
                                  key={invoice.id}
                                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                  onClick={() => handleSearchClick('invoice', invoice.id)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                                      <p className="text-sm text-gray-500">{invoice.supplier}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">{invoice.currency} {invoice.amount.toLocaleString()}</p>
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                        invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {invoice.status === 'PAID' ? 'Pagada' : invoice.status === 'OVERDUE' ? 'Vencida' : 'Pendiente'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!searchQuery && (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Escribe para buscar proyectos, gastos, tareas o facturas</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:block fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 overflow-y-auto",
          sidebarOpen ? "w-64" : "w-20"
        )}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              if (!canAccess(item.id as ViewType)) return null;
              
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full transition-all",
                    sidebarOpen ? "justify-start" : "justify-center"
                  )}
                  onClick={() => setCurrentView(item.id as ViewType)}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3">{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 w-full",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}>
          <div className="p-3 sm:p-4 md:p-6">
            {renderCurrentView()}
          </div>
          
          {/* Footer */}
          <footer className="mt-8 py-4 px-3 sm:px-4 md:px-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-sm text-gray-600">
              <p>Sistema desarrollado por <span className="font-semibold text-gray-900">Byron Landero</span></p>
              <span className="hidden sm:inline">•</span>
              <p className="text-xs sm:text-sm text-gray-500">© {new Date().getFullYear()} ProXis</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}