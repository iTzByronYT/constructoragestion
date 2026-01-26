# Constructora Pro - Sistema de Gestión de Obras y Proyectos

Un software contable especializado en la gestión de presupuestos para obras y proyectos de construcción, diseñado para empresas del sector construcción en Honduras.

## 🚀 Características Principales

### Gestión de Proyectos
- Creación y edición de proyectos con información completa
- Control de estados (Planificación, En Progreso, Pausado, Completado, Cancelado)
- Seguimiento de presupuesto vs gastos reales
- Soporte para múltiples monedas (Lempiras y Dólares)

### Control de Presupuestos
- Creación detallada de presupuestos por categorías
- Items de presupuesto con cantidades y precios unitarios
- Conversión automática Lempira/Dólar
- Análisis de desviaciones presupuestarias

### Gestión de Gastos
- Registro de gastos con soporte para imágenes de facturas
- Categorización automática
- Vinculación con items de presupuesto
- Control de proveedores y fechas

### Facturas Recibidas
- Gestión completa de facturas de proveedores
- Control de estados (Pendiente, Pagada, Vencida, Cancelada)
- Sistema de recordatorios de vencimiento
- Exportación de reportes

### Directorio de Contactos
- **Clientes**: Gestión de información de clientes
- **Proveedores**: Directorio completo de proveedores
- **Trabajadores**: Gestión de personal y contratistas
- Soporte para RTN y datos fiscales

### Tareas y Pendientes
- Sistema de gestión de tareas por proyecto
- Prioridades (Baja, Media, Alta, Urgente)
- Asignación de responsables
- Seguimiento de fechas límite

### Reportes y Análisis
- Dashboard con indicadores clave
- Reportes financieros detallados
- Análisis de rendimiento por proyecto
- Exportación a PDF y Excel
- Gráficos interactivos de tendencias

### Configuración Avanzada
- Gestión de usuarios con roles (Administrador, Gerente, Contador, Visualizador)
- Configuración de idioma (Español/Inglés)
- Personalización de monedas y tasas de cambio
- Sistema de backup automático
- Notificaciones personalizables

## 🏗️ Arquitectura del Sistema

### Roles de Usuario
- **Administrador**: Acceso completo a todas las funciones
- **Gerente**: Gestión de proyectos, presupuestos y gastos
- **Contador**: Acceso a finanzas, facturas y reportes
- **Visualizador**: Solo puede ver reportes y dashboard

### Tecnologías Utilizadas
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Base de Datos**: Prisma ORM con SQLite
- **Estado**: Zustand para estado del cliente
- **Autenticación**: Sistema propio con roles
- **Gráficos**: Recharts para visualizaciones

## 📋 Requisitos del Sistema

### Para Desarrollo
- Node.js 18 o superior
- npm o yarn
- Navegador web moderno

### Para Producción
- Servidor web compatible con Node.js
- Base de datos (SQLite incluida)
- Almacenamiento para archivos de facturas

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <repositorio>
cd constructora-pro
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
```bash
npm run db:push
```

### 4. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```

### 5. Acceder al Sistema
Abrir http://localhost:3000 en tu navegador

## 🎯 Guía de Uso Rápido

### 1. Crear Cuenta de Administrador
1. Accede a la aplicación
2. Haz clic en "Registrarse"
3. Selecciona "Administrador" como tipo de cuenta
4. Completa tus datos y crea la cuenta

### 2. Configurar tu Primer Proyecto
1. Desde el dashboard, haz clic en "Nuevo Proyecto"
2. Ingresa los datos básicos (nombre, ubicación, fechas)
3. Establece el presupuesto inicial
4. Selecciona la moneda y tasa de cambio

### 3. Crear Presupuesto Detallado
1. Ve a la sección "Presupuestos"
2. Selecciona tu proyecto
3. Agrega items por categoría (Mano de Obra, Materiales, etc.)
4. Define cantidades y precios unitarios

### 4. Registrar Gastos
1. Ve a la sección "Gastos"
2. Selecciona el proyecto y categoría
3. Ingresa el monto y descripción
4. Adjunta la imagen de la factura
5. Vincula con el item de presupuesto correspondiente

### 5. Gestionar Facturas
1. En la sección "Facturas", registra las facturas recibidas
2. Establece fechas de vencimiento
3. Actualiza estados cuando se paguen
4. Recibe notificaciones de vencimiento

### 6. Directorio de Contactos
1. Agrega clientes, proveedores y trabajadores
2. Incluye información fiscal (RTN)
3. Vincula contactos con proyectos

### 7. Generar Reportes
1. Ve a la sección "Reportes"
2. Selecciona el tipo de reporte y rango de fechas
3. Exporta a PDF o Excel
4. Analiza gráficos y tendencias

## 💡 Funcionalidades Especiales

### Conversión Automática de Moneda
- Soporte nativo para Lempiras (HNL) y Dólares (USD)
- Tasa de cambio configurable y actualizable
- Conversión automática en todos los reportes

### Sistema de Notificaciones
- Alertas de presupuesto excedido
- Recordatorios de facturas por vencer
- Notificaciones de tareas críticas
- Alertas por email personalizables

### Backup y Seguridad
- Backup automático configurable
- Exportación de datos completa
- Roles y permisos por usuario
- Registro de actividad

### Reportes Avanzados
- Análisis de rentabilidad por proyecto
- Control de flujo de caja
- Reportes de costos por categoría
- Comparación presupuesto vs real

## 🔧 Configuración Personalizada

### Tasa de Cambio
1. Ve a Configuración → Sistema
2. Actualiza la tasa HNL/USD
3. Se aplicará automáticamente a todas las transacciones

### Backup Automático
1. Configuración → Backup y Datos
2. Activa "Backup Automático"
3. Selecciona frecuencia (diario, semanal, mensual)

### Notificaciones
1. Configuración → Notificaciones
2. Personaliza qué alertas recibir
3. Configura delivery por email

## 📊 Migración de Datos

### Importar Datos Existente
1. Configuración → Backup y Datos
2. Usa "Importar Datos"
3. Formatos soportados: CSV, Excel

### Exportar Datos
1. Selecciona el módulo a exportar
2. Elige formato (PDF, Excel, CSV)
3. Descarga el archivo generado

## 🆘 Soporte y Mantenimiento

### Problemas Comunes
- **No puedo iniciar sesión**: Verifica que el usuario esté creado y activo
- **Los datos no se guardan**: Revisa la conexión a la base de datos
- **Las imágenes no cargan**: Verifica los permisos de la carpeta de uploads

### Mantenimiento Recomendado
- Backup semanal de la base de datos
- Actualización de tasas de cambio mensual
- Revisión de usuarios y permisos trimestral
- Limpieza de archivos temporales

## 📄 Licencia

Este software es propiedad de [Tu Empresa] y está protegido por las leyes de propiedad intelectual.

## 📞 Contacto de Soporte

- Email: soporte@constructorapro.hn
- Teléfono: +504 XXXX-XXXX
- Horario: Lunes a Viernes 8:00 AM - 5:00 PM

---

**Constructora Pro** - La solución completa para la gestión de proyectos de construcción en Honduras.