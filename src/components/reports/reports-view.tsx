'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Building2,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useProjectStore } from '@/stores/project-store';
import { useExpenseStore } from '@/stores/expense-store';
import { useBudgetStore } from '@/stores/budget-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

export function ReportsView() {
  const { projects } = useProjectStore();
  const { expenses } = useExpenseStore();
  const { budgetItems } = useBudgetStore();
  const { invoices } = useInvoiceStore();
  const [selectedProject, setSelectedProject] = useState('all');
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('month');

  // Calcular datos reales de gastos por mes
  const getMonthlyData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === index && expDate.getFullYear() === currentYear;
      });
      
      const monthBudget = budgetItems.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === index && itemDate.getFullYear() === currentYear;
      });
      
      return {
        month,
        presupuesto: monthBudget.reduce((sum, item) => sum + item.totalPrice, 0),
        gastos: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        proyectos: new Set(monthExpenses.map(exp => exp.projectId)).size
      };
    });
  };

  // Calcular distribución por categorías
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};
    const colors: { [key: string]: string } = {
      'Mano de Obra': '#3B82F6',
      'Materiales': '#10B981',
      'Equipos': '#F59E0B',
      'Subcontratos': '#EF4444',
      'Permisos': '#8B5CF6',
      'Transporte': '#F97316',
      'Seguros': '#06B6D4',
      'Administración': '#EC4899',
      'Imprevistos': '#6366F1',
      'Otros': '#64748B'
    };
    
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    
    const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color: colors[name] || '#64748B'
    }));
  };

  // Calcular rendimiento por proyecto
  const getProjectPerformance = () => {
    return projects.map(project => {
      const projectBudget = budgetItems
        .filter(item => item.projectId === project.id)
        .reduce((sum, item) => sum + item.totalPrice, 0);
      
      const projectExpenses = expenses
        .filter(exp => exp.projectId === project.id)
        .reduce((sum, exp) => sum + exp.amount, 0);
      
      const porcentaje = projectBudget > 0 ? Math.round((projectExpenses / projectBudget) * 100) : 0;
      
      return {
        name: project.name,
        presupuesto: projectBudget || project.estimatedBudget || 0,
        gastado: projectExpenses,
        porcentaje
      };
    });
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  const projectPerformance = getProjectPerformance();

  const formatCurrency = (amount: number) => {
    return `L ${amount.toLocaleString('es-HN')}`;
  };

  const getUSDAmount = (amount: number) => {
    return `$ ${(amount / 24.5).toLocaleString('es-HN', { maximumFractionDigits: 0 })}`;
  };

  const totalBudget = projects.reduce((sum, p) => {
    const projectBudget = budgetItems
      .filter(item => item.projectId === p.id)
      .reduce((s, item) => s + item.totalPrice, 0);
    return sum + (projectBudget || p.estimatedBudget || 0);
  }, 0);
  
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalProjects = projects.filter(p => 
    p.status === 'IN_PROGRESS' || p.status === 'PLANNING'
  ).length;
  
  const efficiency = totalBudget > 0 ? ((totalBudget - totalExpenses) / totalBudget * 100).toFixed(1) : '0.0';

  const handleExportPDF = () => {
    // Crear contenido HTML para el PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte Financiero - ProXis</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #3b82f6; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:hover { background-color: #f9fafb; }
          .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
          .summary-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
          .summary-card h3 { margin: 0 0 10px 0; color: #6b7280; font-size: 14px; }
          .summary-card p { margin: 0; font-size: 24px; font-weight: bold; color: #1f2937; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte Financiero de Proyectos</h1>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-HN')}</p>
        <p><strong>Proyecto:</strong> ${selectedProject === 'all' ? 'Todos los proyectos' : projects.find(p => p.id === selectedProject)?.name || 'N/A'}</p>
        
        <h2>Resumen General</h2>
        <div class="summary">
          <div class="summary-card">
            <h3>Presupuesto Total</h3>
            <p>${formatCurrency(totalBudget)}</p>
            <small>${getUSDAmount(totalBudget)} USD</small>
          </div>
          <div class="summary-card">
            <h3>Gastos Totales</h3>
            <p>${formatCurrency(totalExpenses)}</p>
            <small>${getUSDAmount(totalExpenses)} USD</small>
          </div>
          <div class="summary-card">
            <h3>Proyectos Activos</h3>
            <p>${totalProjects}</p>
            <small>En ejecución</small>
          </div>
          <div class="summary-card">
            <h3>Eficiencia</h3>
            <p>${efficiency}%</p>
            <small>Bajo presupuesto</small>
          </div>
        </div>

        <h2>Rendimiento por Proyecto</h2>
        <table>
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Presupuesto</th>
              <th>Gastado</th>
              <th>Saldo</th>
              <th>% Utilizado</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${projectPerformance.map(project => {
              const saldo = project.presupuesto - project.gastado;
              const estado = project.porcentaje > 90 ? 'Crítico' : 
                           project.porcentaje > 70 ? 'Atención' : 'Normal';
              return `
                <tr>
                  <td>${project.name}</td>
                  <td>${formatCurrency(project.presupuesto)}</td>
                  <td>${formatCurrency(project.gastado)}</td>
                  <td style="color: ${saldo > 0 ? '#10b981' : '#ef4444'}">${formatCurrency(saldo)}</td>
                  <td>${project.porcentaje}%</td>
                  <td>${estado}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <h2>Distribución por Categorías</h2>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            ${categoryData.map(cat => `
              <tr>
                <td>${cat.name}</td>
                <td>${cat.value}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Sistema desarrollado por Byron Landero</p>
          <p>ProXis - Sistema de Gestión de Proyectos de Construcción</p>
        </div>
      </body>
      </html>
    `;

    // Crear blob y descargar
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-financiero-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Reporte HTML descargado. Ábrelo y usa "Imprimir > Guardar como PDF" en tu navegador para convertirlo a PDF.');
  };

  const handleExportExcel = () => {
    // Crear contenido CSV (compatible con Excel)
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Encabezado del reporte
    csvContent += `REPORTE FINANCIERO DE PROYECTOS\n`;
    csvContent += `Fecha de generación:,${new Date().toLocaleString('es-HN')}\n`;
    csvContent += `Proyecto:,${selectedProject === 'all' ? 'Todos los proyectos' : projects.find(p => p.id === selectedProject)?.name || 'N/A'}\n\n`;
    
    // Resumen General
    csvContent += `RESUMEN GENERAL\n`;
    csvContent += `Concepto,Monto HNL,Monto USD\n`;
    csvContent += `Presupuesto Total,${totalBudget},${(totalBudget / 24.5).toFixed(2)}\n`;
    csvContent += `Gastos Totales,${totalExpenses},${(totalExpenses / 24.5).toFixed(2)}\n`;
    csvContent += `Proyectos Activos,${totalProjects},\n`;
    csvContent += `Eficiencia,${efficiency}%,\n\n`;
    
    // Rendimiento por Proyecto
    csvContent += `RENDIMIENTO POR PROYECTO\n`;
    csvContent += `Proyecto,Presupuesto,Gastado,Saldo,% Utilizado,Estado\n`;
    projectPerformance.forEach(project => {
      const saldo = project.presupuesto - project.gastado;
      const estado = project.porcentaje > 90 ? 'Crítico' : 
                   project.porcentaje > 70 ? 'Atención' : 'Normal';
      csvContent += `${project.name},${project.presupuesto},${project.gastado},${saldo},${project.porcentaje}%,${estado}\n`;
    });
    
    csvContent += `\n`;
    
    // Distribución por Categorías
    csvContent += `DISTRIBUCIÓN POR CATEGORÍAS\n`;
    csvContent += `Categoría,Porcentaje\n`;
    categoryData.forEach(cat => {
      csvContent += `${cat.name},${cat.value}%\n`;
    });
    
    csvContent += `\n`;
    
    // Evolución Mensual
    csvContent += `EVOLUCIÓN MENSUAL\n`;
    csvContent += `Mes,Presupuesto,Gastos,Proyectos\n`;
    monthlyData.forEach(month => {
      csvContent += `${month.month},${month.presupuesto},${month.gastos},${month.proyectos}\n`;
    });
    
    csvContent += `\n\nSistema desarrollado por Byron Landero\n`;
    csvContent += `ProXis - Sistema de Gestión de Proyectos de Construcción\n`;
    
    // Descargar archivo
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte-financiero-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Reporte Excel (CSV) descargado exitosamente. Ábrelo con Excel o Google Sheets.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 mt-1">Análisis y reportes financieros de proyectos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Filtros del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Reporte</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Resumen General</SelectItem>
                  <SelectItem value="monthly">Evolución Mensual</SelectItem>
                  <SelectItem value="category">Por Categorías</SelectItem>
                  <SelectItem value="projects">Rendimiento por Proyecto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Proyecto</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rango de Fechas</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Presupuesto Total
            </CardTitle>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBudget)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUSDAmount(totalBudget)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Gastos Totales
            </CardTitle>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getUSDAmount(totalExpenses)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Proyectos Activos
            </CardTitle>
            <Building2 className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalProjects}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              En ejecución
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Eficiencia
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {efficiency}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bajo presupuesto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución Mensual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Evolución Mensual
            </CardTitle>
            <CardDescription>
              Presupuesto vs Gastos mensuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="presupuesto" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución por Categorías */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Distribución por Categorías
            </CardTitle>
            <CardDescription>
              Porcentaje de gastos por categoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento por Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Rendimiento por Proyecto
          </CardTitle>
          <CardDescription>
            Comparación de presupuesto vs gastos reales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="presupuesto" fill="#3B82F6" />
              <Bar dataKey="gastado" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla Detallada */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Detallado por Proyecto</CardTitle>
          <CardDescription>
            Estado financiero actual de cada proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Proyecto</th>
                  <th className="text-right py-3 px-4">Presupuesto</th>
                  <th className="text-right py-3 px-4">Gastado</th>
                  <th className="text-right py-3 px-4">Saldo</th>
                  <th className="text-right py-3 px-4">% Utilizado</th>
                  <th className="text-center py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {projectPerformance.map((project, index) => {
                  const saldo = project.presupuesto - project.gastado;
                  const estadoColor = project.porcentaje > 90 ? 'bg-red-600' : 
                                     project.porcentaje > 70 ? 'bg-yellow-500' : 'bg-green-500';
                  const estadoTexto = project.porcentaje > 90 ? 'Crítico' : 
                                    project.porcentaje > 70 ? 'Atención' : 'Normal';
                  const badgeVariant = project.porcentaje > 90 ? 'destructive' : 
                                    project.porcentaje > 70 ? 'outline' : 'default';
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{project.name}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(project.presupuesto)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(project.gastado)}
                      </td>
                      <td className={`py-3 px-4 text-right ${saldo < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(saldo)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 text-right pr-2 font-medium">
                            {project.porcentaje}%
                          </div>
                          <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${estadoColor} transition-all duration-500 ease-in-out`}
                              style={{ width: `${Math.min(project.porcentaje, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={badgeVariant} className="min-w-[80px] justify-center">
                          {estadoTexto}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}