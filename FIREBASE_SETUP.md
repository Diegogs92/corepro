# Configuración de Firebase para CorePro

## Paso 1: Crear Proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre del proyecto: `corepro` (o el nombre que prefieras)
4. Deshabilitar Google Analytics (opcional)
5. Click en "Crear proyecto"

## Paso 2: Habilitar Authentication

1. En el menú lateral, ir a **Build** > **Authentication**
2. Click en "Comenzar"
3. En la pestaña "Sign-in method", habilitar:
   - **Correo electrónico/Contraseña** → Habilitar
4. Click en "Guardar"

## Paso 3: Crear Base de Datos Firestore

1. En el menú lateral, ir a **Build** > **Firestore Database**
2. Click en "Crear base de datos"
3. Seleccionar modo:
   - **Modo de producción** (recomendado)
   - Ubicación: Elegir la más cercana (ej: `southamerica-east1`)
4. Click en "Habilitar"

## Paso 4: Configurar Reglas de Seguridad

En la pestaña "Reglas" de Firestore, reemplazar con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }

    // Ventas: solo lectura/escritura para usuarios autenticados
    match /ventas/{ventaId} {
      allow read, write: if isAuthenticated();
    }

    // Productos: solo lectura/escritura para usuarios autenticados
    match /productos/{productoId} {
      allow read, write: if isAuthenticated();
    }

    // Gastos: solo lectura/escritura para usuarios autenticados
    match /gastos/{gastoId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

Click en "Publicar"

## Paso 5: Obtener Credenciales

1. Click en el ícono de configuración ⚙️ > **Configuración del proyecto**
2. En la sección "Tus apps", click en el ícono **Web** `</>`
3. Nombre de la app: `CorePro Web`
4. No habilitar Firebase Hosting
5. Click en "Registrar app"
6. Copiar las credenciales del objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "corepro-xxx.firebaseapp.com",
  projectId: "corepro-xxx",
  storageBucket: "corepro-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Paso 6: Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_apiKey_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_authDomain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_projectId_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storageBucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messagingSenderId_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_appId_aqui
```

## Paso 7: Crear Usuario Administrador

1. En Firebase Console, ir a **Authentication** > **Users**
2. Click en "Agregar usuario"
3. Ingresar:
   - Email: `admin@corepro.com` (o el email que prefieras)
   - Contraseña: crear una contraseña segura (mínimo 6 caracteres)
4. Click en "Agregar usuario"

**IMPORTANTE**: Guardar estas credenciales en un lugar seguro, las necesitarás para iniciar sesión.

## Paso 8: Verificar Configuración

1. Ejecutar el proyecto localmente: `npm run dev`
2. Ir a `http://localhost:3000`
3. Intentar iniciar sesión con las credenciales creadas
4. Si funciona correctamente, verás el Dashboard

## Paso 9: Configuración para Producción (Vercel)

Al desplegar en Vercel, agregar las mismas variables de entorno en:

**Vercel Dashboard** > **Tu Proyecto** > **Settings** > **Environment Variables**

Agregar cada variable:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Seguridad Adicional (Recomendado)

### Limitar Dominios Autorizados

1. En Firebase Console, ir a **Authentication** > **Settings** > **Dominios autorizados**
2. Agregar tu dominio de producción (ej: `corepro.vercel.app`)
3. Eliminar dominios no utilizados

### Habilitar App Check (Opcional)

Para proteger contra abuso:

1. Ir a **Build** > **App Check**
2. Registrar tu app web
3. Configurar reCAPTCHA v3
4. Aplicar App Check a Firestore

## Troubleshooting

### Error: "Firebase App named '[DEFAULT]' already exists"
- Solución: Reiniciar el servidor de desarrollo

### Error: "Missing or insufficient permissions"
- Verificar que las reglas de Firestore estén publicadas
- Verificar que el usuario esté autenticado

### Error: "Auth domain not whitelisted"
- Agregar el dominio en **Authentication** > **Settings** > **Dominios autorizados**

## Respaldo de Datos

Para hacer respaldo de tu base de datos:

1. En Firestore, ir a la pestaña **Data**
2. Usar la consola de Firebase CLI:

```bash
firebase init
firebase firestore:export backup-folder
```

## Monitoreo

Revisar regularmente:
- **Authentication** > **Users**: Usuarios activos
- **Firestore Database** > **Usage**: Lecturas/escrituras
- **Firestore Database** > **Usage**: Almacenamiento utilizado

---

**Nota**: Firebase ofrece un plan gratuito (Spark Plan) que incluye:
- 50,000 lecturas/día
- 20,000 escrituras/día
- 1 GB de almacenamiento

Para la mayoría de ONGs pequeñas, esto es suficiente. Si necesitas más, puedes actualizar al plan Blaze (pago por uso).
