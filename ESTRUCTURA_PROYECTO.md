# Estructura del Proyecto CorePro

## Árbol de Archivos

```
corepro/
│
├── app/                                    # Next.js App Router
│   ├── (auth)/                            # Grupo de rutas de autenticación
│   │   └── login/
│   │       └── page.tsx                   # Página de login
│   │
│   ├── (dashboard)/                       # Grupo de rutas protegidas
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Dashboard principal
│   │   ├── ventas/
│   │   │   └── page.tsx                   # Módulo de ventas
│   │   ├── stock/
│   │   │   └── page.tsx                   # Módulo de stock
│   │   ├── gastos/
│   │   │   └── page.tsx                   # Módulo de gastos
│   │   └── layout.tsx                     # Layout del dashboard (con sidebar)
│   │
│   ├── layout.tsx                         # Layout raíz (con AuthProvider)
│   ├── page.tsx                           # Página de inicio (redirección)
│   └── globals.css                        # Estilos globales
│
├── components/                            # Componentes reutilizables
│   ├── ui/                                # Componentes UI básicos
│   │   ├── Button.tsx                     # Botón personalizado
│   │   ├── Card.tsx                       # Tarjetas
│   │   ├── Input.tsx                      # Input de formulario
│   │   ├── Select.tsx                     # Select de formulario
│   │   ├── Badge.tsx                      # Badges/etiquetas
│   │   └── Table.tsx                      # Tabla
│   │
│   ├── layout/                            # Componentes de layout
│   │   ├── Sidebar.tsx                    # Menú lateral
│   │   └── Header.tsx                     # Encabezado de páginas
│   │
│   └── dashboard/                         # Componentes del dashboard
│       └── StatCard.tsx                   # Tarjeta de estadística
│
├── contexts/                              # Contextos de React
│   └── AuthContext.tsx                    # Contexto de autenticación
│
├── lib/                                   # Utilidades y configuraciones
│   ├── firebase.ts                        # Configuración de Firebase
│   ├── types.ts                           # Tipos TypeScript
│   └── utils.ts                           # Funciones auxiliares
│
├── public/                                # Archivos estáticos
│
├── .env.local                             # Variables de entorno (NO commitear)
├── .env.local.example                     # Ejemplo de variables de entorno
├── .eslintrc.json                         # Configuración ESLint
├── .gitignore                             # Archivos ignorados por Git
├── next.config.mjs                        # Configuración de Next.js
├── package.json                           # Dependencias del proyecto
├── postcss.config.mjs                     # Configuración de PostCSS
├── tailwind.config.ts                     # Configuración de Tailwind
├── tsconfig.json                          # Configuración de TypeScript
├── vercel.json                            # Configuración de Vercel
│
├── README.md                              # Documentación principal
├── FIREBASE_SETUP.md                      # Guía de configuración Firebase
├── GUIA_USUARIO.md                        # Guía para usuarios finales
└── ESTRUCTURA_PROYECTO.md                 # Este archivo
```

---

## Descripción de Directorios

### `/app`

Contiene todas las páginas y rutas de la aplicación usando Next.js App Router.

**Grupos de rutas:**
- `(auth)`: Rutas públicas de autenticación
- `(dashboard)`: Rutas protegidas que requieren login

### `/components`

Componentes reutilizables organizados por categoría:

**`/ui`**: Componentes de interfaz básicos (botones, inputs, tablas)
**`/layout`**: Componentes estructurales (sidebar, header)
**`/dashboard`**: Componentes específicos del dashboard

### `/contexts`

Contextos de React para estado global:
- `AuthContext`: Manejo de autenticación y estado del usuario

### `/lib`

Librerías y utilidades:
- `firebase.ts`: Inicialización de Firebase
- `types.ts`: Definiciones de tipos TypeScript
- `utils.ts`: Funciones auxiliares (formateo, validaciones)

---

## Flujo de Datos

```
Usuario → Login (AuthContext) → Firebase Auth
                                      ↓
                              Usuario Autenticado
                                      ↓
                              Dashboard Layout
                                      ↓
                    ┌─────────────────┼─────────────────┐
                    ↓                 ↓                 ↓
                 Ventas            Stock            Gastos
                    ↓                 ↓                 ↓
                Firestore         Firestore         Firestore
               (ventas)         (productos)         (gastos)
```

---

## Modelos de Datos (Firestore)

### Colección: `ventas`

```typescript
{
  id: string,                    // Auto-generado
  fecha: Timestamp,              // Fecha de la venta
  concepto: string,              // Descripción
  monto: number,                 // Importe
  medioPago: string,             // efectivo | transferencia | debito | credito
  createdAt: Timestamp           // Fecha de creación del registro
}
```

### Colección: `productos`

```typescript
{
  id: string,                    // Auto-generado
  nombre: string,                // Nombre del producto
  descripcion: string,           // Descripción opcional
  cantidadActual: number,        // Stock actual
  stockMinimo: number,           // Nivel de alerta
  precioUnitario: number,        // Precio por unidad
  createdAt: Timestamp,          // Fecha de creación
  updatedAt: Timestamp           // Última actualización
}
```

### Colección: `gastos`

```typescript
{
  id: string,                    // Auto-generado
  fecha: Timestamp,              // Fecha del gasto
  categoria: string,             // servicios | suministros | personal | mantenimiento | otros
  concepto: string,              // Descripción
  monto: number,                 // Importe
  createdAt: Timestamp           // Fecha de creación del registro
}
```

---

## Stack Tecnológico Detallado

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 14.1.0 | Framework React con SSR |
| React | 18.2.0 | Librería UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 3.4.1 | Estilos utility-first |

### Backend/Database

| Tecnología | Propósito |
|------------|-----------|
| Firebase Auth | Autenticación de usuarios |
| Firestore | Base de datos NoSQL |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| ESLint | Linting de código |
| PostCSS | Procesamiento de CSS |
| Autoprefixer | Prefijos CSS automáticos |

### Despliegue

| Plataforma | Propósito |
|------------|-----------|
| Vercel | Hosting y CI/CD |
| Firebase | Backend as a Service |

---

## Rutas de la Aplicación

### Rutas Públicas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Redirección automática |
| `/login` | `app/(auth)/login/page.tsx` | Página de inicio de sesión |

### Rutas Protegidas

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Dashboard principal |
| `/ventas` | `app/(dashboard)/ventas/page.tsx` | Módulo de ventas |
| `/stock` | `app/(dashboard)/stock/page.tsx` | Módulo de stock |
| `/gastos` | `app/(dashboard)/gastos/page.tsx` | Módulo de gastos |

---

## Componentes Principales

### Componentes UI

```typescript
Button          // Botón con variantes (primary, secondary, danger, ghost)
Card            // Contenedor con sombra y bordes
Input           // Input de formulario con label y validación
Select          // Select dropdown con opciones
Badge           // Etiqueta de estado (success, warning, danger)
Table           // Tabla responsive con header y body
```

### Componentes de Layout

```typescript
Sidebar         // Menú lateral de navegación
Header          // Encabezado con título y usuario
StatCard        // Tarjeta de estadística con icono
```

---

## Variables de Entorno

### Desarrollo Local (`.env.local`)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Producción (Vercel)

Las mismas variables deben configurarse en Vercel Dashboard.

---

## Scripts Disponibles

```bash
npm run dev         # Servidor de desarrollo (localhost:3000)
npm run build       # Compilar para producción
npm run start       # Iniciar servidor de producción
npm run lint        # Ejecutar ESLint
```

---

## Próximas Mejoras (Opcionales)

### Funcionalidades Sugeridas

1. **Reportes**
   - Exportar datos a Excel/PDF
   - Gráficos mensuales de ingresos vs gastos

2. **Gestión de Usuarios**
   - Múltiples roles (admin, vendedor, contador)
   - Permisos por módulo

3. **Notificaciones**
   - Email cuando el stock está bajo
   - Resumen mensual automático

4. **Mejoras en Stock**
   - Historial de movimientos
   - Integración con ventas para descuento automático

5. **Búsqueda y Filtros Avanzados**
   - Filtrar ventas por rango de fechas
   - Filtrar gastos por categoría

---

## Contacto y Soporte

Para consultas sobre la arquitectura del sistema, contactar al desarrollador.

**Versión**: 1.0
**Fecha**: Enero 2026
