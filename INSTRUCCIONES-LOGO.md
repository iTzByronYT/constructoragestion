# Instrucciones para Actualizar el Logo del Dashboard

## 📋 Pasos a Seguir:

### 1. Guardar el Nuevo Logo
- Guarda la imagen del logo nuevo (el que tiene el ícono morado con "ProXis") como:
  ```
  public/logo-dashboard.png
  ```

### 2. Verificar Configuración Actual

El sistema ya está configurado para usar dos logos diferentes:

- **Login**: Usa `/logo.png` (logo actual/original)
- **Dashboard**: Usa `/logo-dashboard.png` (logo nuevo con ícono morado)

### 3. Archivos Modificados

#### `src/components/layout/dashboard-layout.tsx`
```typescript
const [logoSrc, setLogoSrc] = useState('/logo-dashboard.png');
```

#### `src/components/auth/login-form.tsx`
```typescript
const [logoSrc, setLogoSrc] = useState('/logo.png');
```

### 4. Ubicación de los Logos

```
public/
├── logo.png              ← Logo original (para login)
└── logo-dashboard.png    ← Logo nuevo (para dashboard) ⚠️ CREAR ESTE ARCHIVO
```

### 5. Características del Logo Nuevo

Según la imagen proporcionada:
- **Ícono**: Tres chevrones morados apilados (estilo construcción/capas)
- **Texto**: "ProXis" en color oscuro (azul marino)
- **Estilo**: Moderno, profesional, minimalista
- **Colores**: Morado (#7C3AED aproximadamente) y azul marino oscuro

### 6. Recomendaciones de Tamaño

Para mejor calidad en el dashboard:
- **Ancho**: 800-1200px
- **Alto**: Proporcional (mantener aspect ratio)
- **Formato**: PNG con transparencia
- **Resolución**: 2x o 3x para pantallas retina

### 7. Verificar Funcionamiento

Después de guardar el logo:
1. Recarga el navegador (F5)
2. Verifica que el **login** muestre el logo original
3. Verifica que el **dashboard** muestre el logo nuevo
4. Prueba en móvil (menú hamburguesa)

## ✅ Estado Actual

- ✅ Código actualizado para usar dos logos diferentes
- ⚠️ Pendiente: Guardar archivo `public/logo-dashboard.png`

## 🎯 Resultado Esperado

- **Pantalla de Login**: Logo original (actual)
- **Dashboard (sidebar)**: Logo nuevo con ícono morado
- **Dashboard (header móvil)**: Logo nuevo con ícono morado
- **Dashboard (menú hamburguesa)**: Logo nuevo con ícono morado
