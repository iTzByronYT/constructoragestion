#!/bin/bash

# Script de Despliegue - Constructora Pro
# Este script facilita el despliegue del sistema en producción

echo "🚀 Iniciando despliegue de Constructora Pro..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18 o superior."
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Configurar base de datos
echo "🗄️ Configurando base de datos..."
npm run db:push

# Construir para producción
echo "🏗️ Construyendo para producción..."
npm run build

# Crear directorio de uploads si no existe
echo "📁 Creando directorios necesarios..."
mkdir -p public/uploads
mkdir -p public/uploads/invoices
mkdir -p public/uploads/receipts

# Establecer permisos
echo "🔐 Configurando permisos..."
chmod 755 public/uploads
chmod 755 public/uploads/invoices
chmod 755 public/uploads/receipts

echo "✅ Despliegue completado exitosamente!"
echo ""
echo "🎯 Para iniciar el servidor en producción:"
echo "   npm start"
echo ""
echo "🌐 El sistema estará disponible en:"
echo "   http://localhost:3000"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Crea una cuenta de administrador"
echo "   2. Configura la tasa de cambio HNL/USD"
echo "   3. Agrega tus primeros proyectos"
echo "   4. Configura el backup automático"
echo ""
echo "📞 Para soporte, contacta a soporte@constructorapro.hn"