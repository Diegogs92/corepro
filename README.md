# CorePro - Sistema de Gestión Administrativa

Sistema web de gestión interna diseñado para ONGs y organizaciones de salud. Permite administrar ventas, stock, gastos y visualizar información clave desde un único sistema centralizado.

## Características Principales

- **Dashboard**: Resumen general con métricas clave del mes
- **Ventas/Ingresos**: Registro de ventas con diferentes medios de pago
- **Stock**: Control de inventario con alertas de stock bajo
- **Gastos**: Seguimiento de gastos operativos por categoría
- **Autenticación**: Sistema de login seguro con Firebase

## Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Despliegue**: Vercel

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd tony
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar **Authentication** con Email/Password
3. Crear una base de datos **Firestore**
4. Obtener las credenciales del proyecto

### 4. Variables de Entorno

Crear un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 5. Estructura de Firestore

El sistema crea automáticamente las siguientes colecciones:

#### Colección: `ventas`
```
{
  fecha: Timestamp,
  concepto: string,
  monto: number,
  medioPago: "efectivo" | "transferencia" | "debito" | "credito",
  createdAt: Timestamp
}
```

#### Colección: `productos`
```
{
  nombre: string,
  descripcion: string,
  cantidadActual: number,
  stockMinimo: number,
  precioUnitario: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Colección: `gastos`
```
{
  fecha: Timestamp,
  categoria: "servicios" | "suministros" | "personal" | "mantenimiento" | "otros",
  concepto: string,
  monto: number,
  createdAt: Timestamp
}
```

### 6. Crear Usuario Administrador

En Firebase Console, ir a **Authentication** > **Users** > **Add user** y crear el primer usuario administrador.

### 7. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Despliegue en Vercel

### 1. Conectar con Vercel

1. Crear cuenta en [Vercel](https://vercel.com)
2. Importar el repositorio desde GitHub
3. Vercel detectará automáticamente que es un proyecto Next.js

### 2. Configurar Variables de Entorno

En el dashboard de Vercel, ir a **Settings** > **Environment Variables** y agregar:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### 3. Desplegar

```bash
npm run build
```

O hacer push a la rama principal para que Vercel despliegue automáticamente.

## Uso del Sistema

### Login

1. Acceder a la URL del sistema
2. Ingresar email y contraseña del administrador
3. Click en "Iniciar Sesión"

### Dashboard

Vista principal que muestra:
- Ingresos del mes
- Gastos del mes
- Saldo neto
- Productos con stock crítico
- Últimas transacciones

### Registrar una Venta

1. Ir a **Ventas** en el menú lateral
2. Click en **Nueva Venta**
3. Completar el formulario:
   - Fecha (por defecto: hoy)
   - Concepto
   - Monto
   - Medio de pago
4. Click en **Guardar Venta**

### Gestionar Stock

1. Ir a **Stock** en el menú lateral
2. Click en **Agregar Producto** para crear uno nuevo
3. Completar los datos del producto
4. El sistema mostrará alertas automáticas cuando el stock esté bajo

### Registrar un Gasto

1. Ir a **Gastos** en el menú lateral
2. Click en **Nuevo Gasto**
3. Completar:
   - Fecha
   - Categoría
   - Concepto
   - Monto
4. Click en **Guardar Gasto**

## Características de Diseño

- **Responsive**: Funciona en desktop, tablet y móvil
- **Interfaz limpia**: Diseño profesional y sobrio
- **Navegación intuitiva**: Menú lateral siempre visible
- **Feedback visual**: Mensajes de confirmación y error
- **Indicadores de estado**: Colores para identificar niveles de stock

## Soporte y Contacto

Para soporte técnico o consultas sobre el sistema, contactar al administrador del proyecto.

## Seguridad

- Autenticación requerida para todas las funciones
- Variables de entorno protegidas
- Reglas de seguridad de Firestore configurables
- Validación de datos en cliente y servidor

## Licencia

Uso interno exclusivo para la organización.
