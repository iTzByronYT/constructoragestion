'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  BookOpen, 
  PlayCircle, 
  Eye, 
  CheckCircle, 
  ArrowRight,
  Building2,
  DollarSign,
  Calculator,
  Receipt,
  ClipboardList,
  Users,
  FileText,
  Settings,
  Target,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Database,
  Lock,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  content: React.ReactNode;
}

export function TutorialView() {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      description: 'Aprende los conceptos básicos del sistema y cómo navegar por la interfaz',
      icon: <BookOpen className="w-6 h-6" />,
      duration: '5 min',
      difficulty: 'Principiante',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎯 Bienvenido a ProXis</h4>
            <p className="text-blue-800">Sistema profesional de gestión de proyectos de construcción con base de datos en tiempo real y persistencia completa de datos.</p>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium">📋 Elementos principales de la interfaz:</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Menú lateral:</strong> Acceso rápido a todas las secciones del sistema</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Dashboard:</strong> Vista general con estadísticas en tiempo real</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Proyectos:</strong> Gestión completa de tus proyectos de construcción</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Gastos:</strong> Control detallado de todos los gastos</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Facturas:</strong> Gestión de facturas de proveedores</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Presupuestos:</strong> Planificación y control de costos</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">▸</span>
                <span><strong>Tareas:</strong> Organización de actividades del proyecto</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">💾 Persistencia de Datos:</h5>
            <p className="text-green-800 mb-2">ProXis utiliza Supabase como base de datos en tiempo real:</p>
            <ul className="text-green-800 text-sm space-y-1">
              <li>✅ Todos los datos se guardan automáticamente</li>
              <li>✅ Tus proyectos, gastos y facturas están seguros</li>
              <li>✅ Accede a tus datos desde cualquier dispositivo</li>
              <li>✅ Las eliminaciones son permanentes</li>
              <li>✅ Sincronización en tiempo real</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-semibold text-purple-900 mb-2">🔗 Integración Automática:</h5>
            <p className="text-purple-800">El sistema conecta automáticamente la información:</p>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Gastos con número de factura crean facturas automáticamente</li>
              <li>• Al eliminar un gasto, su factura asociada también se elimina</li>
              <li>• Los proyectos muestran el total de gastos en tiempo real</li>
              <li>• El dashboard se actualiza automáticamente</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-semibold text-yellow-900 mb-2">💡 Tips importantes:</h5>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Todos los datos nuevos se guardan en Supabase con UUIDs</li>
              <li>• Puedes recargar la página sin perder información</li>
              <li>• El sistema valida permisos en cada acción</li>
              <li>• Cada registro guarda quién lo creó y cuándo</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'Gestión de Proyectos',
      description: 'Crea y administra tus proyectos de construcción desde el inicio hasta la finalización',
      icon: <Building2 className="w-6 h-6" />,
      duration: '8 min',
      difficulty: 'Principiante',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🏗️ Crear tu primer proyecto</h4>
            <p className="text-green-800">Los proyectos son la base de todo el sistema. Cada gasto, factura y tarea está asociada a un proyecto.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">📝 Pasos para crear un proyecto:</h5>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Ve a la sección <strong>Proyectos</strong> en el menú lateral</li>
              <li>Haz clic en <strong>"Nuevo Proyecto"</strong></li>
              <li>Completa la información básica:
                <ul className="ml-4 mt-1 space-y-1 text-xs">
                  <li>• Nombre del proyecto</li>
                  <li>• Descripción detallada</li>
                  <li>• Código único (opcional)</li>
                  <li>• Ubicación</li>
                </ul>
              </li>
              <li>Establece las fechas de inicio y finalización</li>
              <li>Define el presupuesto estimado</li>
              <li>Selecciona la moneda (HNL o USD)</li>
              <li>Guarda el proyecto</li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">👁️ Ver detalles del proyecto:</h5>
            <p className="text-blue-800">Usa el botón del ojo (👁️) para ver información completa del proyecto, incluyendo progreso, presupuesto y fechas importantes.</p>
          </div>
        </div>
      )
    },
    {
      id: 'budget',
      title: 'Presupuestos',
      description: 'Planifica y controla los presupuestos de tus proyectos con categorías detalladas',
      icon: <Calculator className="w-6 h-6" />,
      duration: '10 min',
      difficulty: 'Intermedio',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">💰 Creación de presupuestos</h4>
            <p className="text-purple-800">Los presupuestos te ayudan a planificar los costos y controlar el gasto real vs lo planeado.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">📊 Estructura de un presupuesto:</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Categorías:</strong> Mano de obra, materiales, equipos, etc.</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Ítems:</strong> Desglose detallado de cada elemento</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Cantidades y precios:</strong> Control exacto de costos</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span><strong>Moneda dual:</strong> Soporte HNL/USD con conversión automática</span>
              </li>
            </ul>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h5 className="font-semibold text-orange-900 mb-2">📈 Seguimiento de presupuesto:</h5>
            <p className="text-orange-800">El sistema muestra automáticamente el progreso del gasto vs el presupuesto con indicadores visuales de alerta.</p>
          </div>
        </div>
      )
    },
    {
      id: 'expenses',
      title: 'Control de Gastos',
      description: 'Registra y categoriza todos los gastos de tus proyectos con soporte de recibos',
      icon: <DollarSign className="w-6 h-6" />,
      duration: '7 min',
      difficulty: 'Principiante',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">💳 Registro de gastos</h4>
            <p className="text-red-800">Cada gasto se asocia a un proyecto y categoría para un control preciso.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">🧾 Información requerida:</h5>
            <ul className="space-y-2 text-sm">
              <li>• Proyecto asociado</li>
              <li>• Descripción del gasto</li>
              <li>• Monto y moneda</li>
              <li>• Categoría (mano de obra, materiales, etc.)</li>
              <li>• Fecha del gasto</li>
              <li>• Proveedor (opcional)</li>
              <li>• Número de factura (opcional)</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">🔗 Integración automática:</h5>
            <p className="text-green-800">Si ingresas un número de factura y proveedor, el sistema automáticamente creará la entrada en la sección de facturas.</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">📷 Soporte de recibos:</h5>
            <p className="text-blue-800">Puedes adjuntar imágenes de recibos o facturas como respaldo de cada gasto.</p>
          </div>
        </div>
      )
    },
    {
      id: 'invoices',
      title: 'Facturas',
      description: 'Gestiona el ciclo de vida de las facturas desde la recepción hasta el pago',
      icon: <Receipt className="w-6 h-6" />,
      duration: '8 min',
      difficulty: 'Intermedio',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">🧾 Gestión de facturas</h4>
            <p className="text-indigo-800">Controla todas las facturas de proveedores con seguimiento de vencimientos y pagos.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">📋 Estados de factura:</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Badge className="bg-yellow-100 text-yellow-800 mr-2">Pendiente</Badge>
                <span>Factura recibida, esperando pago</span>
              </li>
              <li className="flex items-center">
                <Badge className="bg-red-100 text-red-800 mr-2">Vencida</Badge>
                <span>Factura que ha pasado su fecha de vencimiento</span>
              </li>
              <li className="flex items-center">
                <Badge className="bg-green-100 text-green-800 mr-2">Pagada</Badge>
                <span>Factura completamente saldada</span>
              </li>
              <li className="flex items-center">
                <Badge className="bg-gray-100 text-gray-800 mr-2">Cancelada</Badge>
                <span>Factura anulada o rechazada</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-semibold text-yellow-900 mb-2">⏰ Alertas automáticas:</h5>
            <p className="text-yellow-800">El sistema te notificará sobre facturas próximas a vencer para evitar retrasos en los pagos.</p>
          </div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Tareas y Pendientes',
      description: 'Organiza y asigna tareas para mantener el flujo de trabajo eficiente',
      icon: <ClipboardList className="w-6 h-6" />,
      duration: '6 min',
      difficulty: 'Principiante',
      content: (
        <div className="space-y-4">
          <div className="bg-teal-50 p-4 rounded-lg">
            <h4 className="font-semibold text-teal-900 mb-2">✅ Gestión de tareas</h4>
            <p className="teal-800">Mantén organizadas todas las actividades del proyecto con un sistema de tareas completo.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">🎯 Prioridades:</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Badge className="bg-red-100 text-red-800 mr-2">Urgente</Badge>
                <span>Requiere atención inmediata</span>
              </li>
              <li className="flex items-center">
                <Badge className="bg-orange-100 text-orange-800 mr-2">Alta</Badge>
                <span>Importante pero no urgente</span>
              </li>
              <li className="flex items-center">
                <Badge className="bg-blue-100 text-blue-800 mr-2">Media</Badge>
                <span>Prioridad normal</span>
              </li>
              <li className="flex items-center">
                <Badge className="bg-gray-100 text-gray-800 mr-2">Baja</Badge>
                <span>Puede esperar</span>
              </li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-semibold text-purple-900 mb-2">📅 Seguimiento de plazos:</h5>
            <p className="purple-800">Asigna fechas de vencimiento y recibe recordatorios automáticos para tareas próximas a vencer.</p>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Reportes y Análisis',
      description: 'Genera reportes detallados para tomar decisiones informadas',
      icon: <FileText className="w-6 h-6" />,
      duration: '12 min',
      difficulty: 'Avanzado',
      content: (
        <div className="space-y-4">
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h4 className="font-semibold text-cyan-900 mb-2">📊 Análisis de datos</h4>
            <p className="cyan-800">Transforma los datos de tus proyectos en información útil para la toma de decisiones.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">📈 Tipos de reportes disponibles:</h5>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Reporte financiero:</strong> Resumen de ingresos, gastos y rentabilidad</li>
              <li>• <strong>Reporte de proyectos:</strong> Estado general de todos los proyectos</li>
              <li>• <strong>Reporte de presupuesto vs real:</strong> Comparación de lo planeado vs lo ejecutado</li>
              <li>• <strong>Reporte de proveedores:</strong> Análisis de gastos por proveedor</li>
              <li>• <strong>Reporte de productividad:</strong> Eficiencia en la ejecución de tareas</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">📤 Exportación de datos:</h5>
            <p className="green-800">Exporta tus reportes en formato PDF o Excel para compartirlos con el equipo o clientes.</p>
          </div>
        </div>
      )
    },
    {
      id: 'roles-permissions',
      title: 'Roles y Permisos',
      description: 'Entiende los diferentes roles de usuario y sus permisos en el sistema',
      icon: <Shield className="w-6 h-6" />,
      duration: '10 min',
      difficulty: 'Intermedio',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">👥 Sistema de Roles</h4>
            <p className="text-indigo-800">ProXis cuenta con 4 roles de usuario, cada uno con permisos específicos para garantizar la seguridad y organización.</p>
          </div>

          <div className="space-y-4">
            <h5 className="font-medium">🔐 Roles Disponibles:</h5>
            
            <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
              <div className="flex items-center mb-2">
                <Badge className="bg-red-600 text-white mr-2">ADMIN</Badge>
                <span className="font-semibold">Administrador</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">Control total del sistema</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Crear, editar y eliminar todo</li>
                <li>✅ Gestionar usuarios del sistema</li>
                <li>✅ Acceso a todas las secciones</li>
                <li>✅ Configuración del sistema</li>
                <li>✅ Ver todos los reportes</li>
                <li>✅ Exportar datos</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
              <div className="flex items-center mb-2">
                <Badge className="bg-blue-600 text-white mr-2">MANAGER</Badge>
                <span className="font-semibold">Gerente</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">Gestión completa de proyectos</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Crear, editar y eliminar proyectos</li>
                <li>✅ Gestionar presupuestos</li>
                <li>✅ Registrar y eliminar gastos</li>
                <li>✅ Administrar facturas</li>
                <li>✅ Crear y asignar tareas</li>
                <li>✅ Ver reportes de proyectos</li>
                <li>❌ No puede gestionar usuarios</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
              <div className="flex items-center mb-2">
                <Badge className="bg-green-600 text-white mr-2">ACCOUNTANT</Badge>
                <span className="font-semibold">Contador</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">Enfocado en finanzas</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Ver todos los proyectos</li>
                <li>✅ Crear y editar gastos</li>
                <li>✅ Gestionar facturas</li>
                <li>✅ Ver presupuestos</li>
                <li>✅ Generar reportes financieros</li>
                <li>⚠️ Editar (pero no eliminar) registros</li>
                <li>❌ No puede crear/eliminar proyectos</li>
              </ul>
            </div>

            <div className="border-l-4 border-gray-500 pl-4 py-2 bg-gray-50">
              <div className="flex items-center mb-2">
                <Badge className="bg-gray-600 text-white mr-2">VISUALIZER</Badge>
                <span className="font-semibold">Visualizador</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">Solo lectura</p>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>✅ Ver proyectos y su información</li>
                <li>✅ Ver gastos y facturas</li>
                <li>✅ Ver presupuestos</li>
                <li>✅ Ver tareas</li>
                <li>✅ Ver reportes básicos</li>
                <li>❌ No puede crear nada</li>
                <li>❌ No puede editar nada</li>
                <li>❌ No puede eliminar nada</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h5>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Solo los ADMIN pueden crear y gestionar usuarios</li>
              <li>• Los permisos se verifican en cada acción</li>
              <li>• No puedes cambiar tu propio rol</li>
              <li>• El sistema guarda quién realizó cada acción</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">🎯 Recomendaciones:</h5>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Asigna roles según las responsabilidades reales</li>
              <li>• Usa VISUALIZER para clientes o invitados</li>
              <li>• ACCOUNTANT es ideal para el equipo financiero</li>
              <li>• MANAGER para jefes de proyecto</li>
              <li>• Limita el número de ADMIN</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'advanced',
      title: 'Funciones Avanzadas',
      description: 'Características avanzadas para maximizar la eficiencia del sistema',
      icon: <Settings className="w-6 h-6" />,
      duration: '15 min',
      difficulty: 'Avanzado',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">⚙️ Configuración avanzada</h4>
            <p className="gray-800">Personaliza el sistema según las necesidades específicas de tu empresa.</p>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium">🔧 Características avanzadas:</h5>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Gestión de usuarios:</strong> Control de acceso por roles y permisos</li>
              <li>• <strong>Configuración de moneda:</strong> Tasa de cambio automática</li>
              <li>• <strong>Backups automáticos:</strong> Protección de datos</li>
              <li>• <strong>Integración API:</strong> Conexión con otros sistemas</li>
              <li>• <strong>Notificaciones personalizadas:</strong> Alertas configurables</li>
              <li>• <strong>Historial de auditoría:</strong> Registro de todas las acciones</li>
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h5 className="font-semibold text-green-900 mb-2">💱 Configuración de Tasa de Cambio:</h5>
            <p className="text-green-800 mb-2">Administra la conversión entre HNL y USD:</p>
            <ul className="text-green-800 text-sm space-y-1">
              <li>✅ Ve a <strong>Configuración</strong> en el menú lateral</li>
              <li>✅ Encuentra la sección <strong>"Tasa de Cambio"</strong></li>
              <li>✅ Ingresa la tasa actual del dólar (ej: 24.75)</li>
              <li>✅ Guarda los cambios</li>
              <li>✅ El sistema aplicará la nueva tasa automáticamente</li>
              <li>💡 La tasa se usa en todos los cálculos de conversión</li>
              <li>💡 Actualízala regularmente para mantener precisión</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">🌐 Acceso remoto:</h5>
            <p className="text-blue-800">Accede al sistema desde cualquier dispositivo con conexión a internet.</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h5 className="font-semibold text-purple-900 mb-2">🔒 Seguridad:</h5>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Solo usuarios ADMIN pueden cambiar la configuración</li>
              <li>• Todos los cambios quedan registrados</li>
              <li>• Los datos están protegidos con Supabase</li>
              <li>• Autenticación segura en cada sesión</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante':
        return 'bg-green-100 text-green-800';
      case 'Intermedio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Avanzado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const mockData = {
    projects: [
      { name: 'Edificio Aurora', status: 'En Progreso', budget: 'L 5,000,000', progress: 65 },
      { name: 'Plaza Central', status: 'Planificación', budget: 'L 8,000,000', progress: 15 },
      { name: 'Residencial Los Pinos', status: 'Completado', budget: 'L 3,000,000', progress: 100 }
    ],
    stats: {
      totalProjects: 12,
      activeProjects: 5,
      totalBudget: 'L 45,000,000',
      totalExpenses: 'L 28,500,000',
      pendingInvoices: 8,
      completedTasks: 127
    },
    recentActivities: [
      'Nuevo proyecto "Torre Central" creado',
      'Factura PRO-2024-045 marcada como pagada',
      'Tarea "Instalación eléctrica" completada',
      'Presupuesto excedido en Edificio Aurora',
      'Nuevo proveedor "Materiales S.A." agregado'
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutorial Interactivo</h1>
          <p className="text-gray-500 mt-1">Aprende a usar ProXis paso a paso</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Vista Previa del Sistema
                </DialogTitle>
                <DialogDescription>
                  Así se vería tu sistema con datos reales
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Stats Preview */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">{mockData.stats.totalProjects}</div>
                    <div className="text-sm text-blue-700">Proyectos Totales</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">{mockData.stats.activeProjects}</div>
                    <div className="text-sm text-green-700">Activos</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-lg font-bold text-purple-900">{mockData.stats.totalBudget}</div>
                    <div className="text-sm text-purple-700">Presupuesto</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-lg font-bold text-orange-900">{mockData.stats.totalExpenses}</div>
                    <div className="text-sm text-orange-700">Gastado</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-900">{mockData.stats.pendingInvoices}</div>
                    <div className="text-sm text-red-700">Facturas Pendientes</div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-teal-900">{mockData.stats.completedTasks}</div>
                    <div className="text-sm text-teal-700">Tareas Completadas</div>
                  </div>
                </div>

                {/* Projects Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Proyectos Activos</h3>
                  <div className="grid gap-3">
                    {mockData.projects.map((project, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-gray-500">{project.status}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{project.budget}</div>
                            <div className="text-sm text-gray-500">{project.progress}% completado</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Actividad Reciente</h3>
                  <div className="space-y-2">
                    {mockData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Preview */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Características Principales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-medium">Gestión de Proyectos</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Calculator className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="font-medium">Control de Presupuestos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="font-medium">Seguimiento de Gastos</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <div className="font-medium">Gestión de Facturas</div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setSelectedStep('getting-started')}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Comenzar Tutorial
          </Button>
        </div>
      </div>

      {/* Tutorial Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorialSteps.map((step) => (
          <Card key={step.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {step.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getDifficultyColor(step.difficulty)}>
                        {step.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {step.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm mb-4">
                {step.description}
              </CardDescription>
              
              <Dialog 
                open={selectedStep === step.id} 
                onOpenChange={(open) => !open && setSelectedStep(null)}
              >
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Ver Contenido
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      {step.icon}
                      <span className="ml-2">{step.title}</span>
                    </DialogTitle>
                    <DialogDescription>
                      {step.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {step.content}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(step.difficulty)}>
                        {step.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500">{step.duration}</span>
                    </div>
                    <Button 
                      onClick={() => {
                        const currentIndex = tutorialSteps.findIndex(s => s.id === step.id);
                        if (currentIndex < tutorialSteps.length - 1) {
                          setSelectedStep(tutorialSteps[currentIndex + 1].id);
                        } else {
                          setSelectedStep(null);
                        }
                      }}
                    >
                      {tutorialSteps.findIndex(s => s.id === step.id) < tutorialSteps.length - 1 ? (
                        <>
                          Siguiente
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completar
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Características Principales
          </CardTitle>
          <CardDescription>
            Todo lo que necesitas para gestionar tus proyectos de construcción
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-lg inline-block mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h5 className="font-medium">Seguro</h5>
              <p className="text-xs text-gray-500">Protección de datos</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-lg inline-block mb-2">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <h5 className="font-medium">Multi-moneda</h5>
              <p className="text-xs text-gray-500">HNL/USD soporte</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-lg inline-block mb-2">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <h5 className="font-medium">Responsive</h5>
              <p className="text-xs text-gray-500">Funciona en cualquier dispositivo</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-orange-100 rounded-lg inline-block mb-2">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <h5 className="font-medium">Backup</h5>
              <p className="text-xs text-gray-500">Respaldo automático</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-red-100 rounded-lg inline-block mb-2">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <h5 className="font-medium">Privado</h5>
              <p className="text-xs text-gray-500">Control de acceso</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-teal-100 rounded-lg inline-block mb-2">
                <Zap className="w-6 h-6 text-teal-600" />
              </div>
              <h5 className="font-medium">Rápido</h5>
              <p className="text-xs text-gray-500">Alto rendimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            ¿Listo para Comenzar?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Sigue estos pasos rápidos para empezar a usar ProXis de inmediato:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  1
                </div>
                <h5 className="font-medium">Crea tu primer proyecto</h5>
                <p className="text-xs text-gray-600">Establece la base</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  2
                </div>
                <h5 className="font-medium">Define el presupuesto</h5>
                <p className="text-xs text-gray-600">Planifica los costos</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  3
                </div>
                <h5 className="font-medium">Registra gastos</h5>
                <p className="text-xs text-gray-600">Controla el flujo</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2">
                  4
                </div>
                <h5 className="font-medium">Monitorea el progreso</h5>
                <p className="text-xs text-gray-600">Toma decisiones</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  toast.success('¡Perfecto! Usa el menú lateral para navegar al Dashboard');
                }}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Ir al Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}