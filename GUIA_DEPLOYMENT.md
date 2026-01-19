# 🚀 Guía Completa de Deployment - CorePro

## Paso a Paso: GitHub → Firebase → Vercel

Esta guía te llevará desde el código local hasta tener el sistema funcionando en producción.

---

## 📋 Requisitos Previos

- [ ] Git instalado
- [ ] Cuenta de GitHub (gratis)
- [ ] Cuenta de Google (para Firebase)
- [ ] Cuenta de Vercel (gratis, puedes usar tu cuenta de GitHub)

---

# PARTE 1: Subir a GitHub

## Paso 1.1: Crear Repositorio en GitHub

### En tu navegador:

1. **Ve a**: https://github.com/new

2. **Completa el formulario:**
   ```
   Repository name:    corepro
   Description:        Sistema de Gestión Administrativa para ONGs
   Visibility:         ✓ Public (o Private si prefieres)

   NO marcar:
   [ ] Add a README file
   [ ] Add .gitignore
   [ ] Choose a license
   ```
   *(Ya tienes estos archivos localmente)*

3. **Click en**: `Create repository`

4. **Copia la URL** que aparece (algo como):
   ```
   https://github.com/TU-USUARIO/corepro.git
   ```

## Paso 1.2: Conectar y Subir el Código

### En tu terminal (CMD o PowerShell):

```bash
cd c:\Users\diego\OneDrive\Documentos\tony

# Conectar con GitHub (reemplaza TU-USUARIO con tu username)
git remote add origin https://github.com/TU-USUARIO/corepro.git

# Cambiar a rama main (opcional, pero recomendado)
git branch -M main

# Subir el código
git push -u origin main
```

**Si te pide credenciales:**
- Username: tu usuario de GitHub
- Password: usa un **Personal Access Token** (no tu password normal)

### Crear Personal Access Token (si no tienes):

1. Ve a: https://github.com/settings/tokens
2. Click en "Generate new token (classic)"
3. Selecciona scope: `repo` (full control)
4. Genera y copia el token
5. Úsalo como password

## Paso 1.3: Verificar

**Refresca tu repositorio en GitHub**
Deberías ver todos los archivos subidos.

✅ **Parte 1 Completada** - Código en GitHub

---

# PARTE 2: Configurar Firebase

## Paso 2.1: Crear Proyecto Firebase

1. **Ve a**: https://console.firebase.google.com/

2. **Click en** `Agregar proyecto` (o `Create a project`)

3. **Paso 1 - Nombre del proyecto:**
   ```
   Nombre: corepro-ong
   ```
   Click `Continuar`

4. **Paso 2 - Google Analytics:**
   ```
   Deshabilitar Google Analytics (opcional)
   ```
   Click `Crear proyecto`

5. **Espera 30-60 segundos** mientras se crea

6. **Click en** `Continuar`

## Paso 2.2: Configurar Authentication

1. En el menú lateral, click en **Authentication**

2. Click en `Comenzar` (o `Get started`)

3. En la pestaña **Sign-in method**, click en `Email/Password`

4. **Habilitar**:
   - ✓ `Correo electrónico/Contraseña`
   - Dejar deshabilitado "Email link"

5. Click en `Guardar`

## Paso 2.3: Crear Usuario Administrador

1. Ir a pestaña **Users**

2. Click en `Agregar usuario` (o `Add user`)

3. **Completa:**
   ```
   Email:     admin@corepro.com
   Contraseña: [Crea una contraseña segura, ej: Admin123!]
   ```

4. Click en `Agregar usuario`

**⚠️ IMPORTANTE:** Guarda estas credenciales en un lugar seguro.

## Paso 2.4: Crear Base de Datos Firestore

1. En el menú lateral, click en **Firestore Database**

2. Click en `Crear base de datos` (o `Create database`)

3. **Seleccionar modo:**
   ```
   ○ Modo de producción  ← Selecciona este
   ○ Modo de prueba
   ```

4. **Ubicación:**
   ```
   Selecciona la más cercana:
   - southamerica-east1 (São Paulo) - para Sudamérica
   - us-central1 - para norteamérica
   ```

5. Click en `Habilitar` (Enable)

6. **Espera** 1-2 minutos mientras se crea

## Paso 2.5: Configurar Reglas de Seguridad

1. En Firestore, ve a la pestaña **Reglas** (Rules)

2. **Reemplaza todo** con este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }

    // Ventas: solo usuarios autenticados
    match /ventas/{ventaId} {
      allow read, write: if isAuthenticated();
    }

    // Productos: solo usuarios autenticados
    match /productos/{productoId} {
      allow read, write: if isAuthenticated();
    }

    // Gastos: solo usuarios autenticados
    match /gastos/{gastoId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

3. Click en `Publicar` (Publish)

## Paso 2.6: Obtener Credenciales

1. Click en el ícono de **configuración ⚙️** (junto a "Descripción general del proyecto")

2. Selecciona `Configuración del proyecto` (Project settings)

3. Baja hasta la sección **Tus apps** (Your apps)

4. **Si no hay apps**, click en el ícono **Web** `</>`

5. **Registrar app:**
   ```
   Sobrenombre: CorePro Web

   [ ] No marcar Firebase Hosting
   ```

6. Click en `Registrar app`

7. **Copia las credenciales** que aparecen:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "corepro-ong.firebaseapp.com",
  projectId: "corepro-ong",
  storageBucket: "corepro-ong.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**⚠️ IMPORTANTE:** Guarda estas credenciales, las necesitarás en el siguiente paso.

✅ **Parte 2 Completada** - Firebase configurado

---

# PARTE 3: Desplegar en Vercel

## Paso 3.1: Conectar Vercel con GitHub

1. **Ve a**: https://vercel.com/signup

2. **Inicia sesión** con GitHub (recomendado)
   - Click en `Continue with GitHub`
   - Autoriza a Vercel

3. **Importar Proyecto:**
   - Click en `Add New...` → `Project`
   - Vercel mostrará tus repositorios de GitHub

4. **Busca** `corepro` en la lista

5. Click en `Import`

## Paso 3.2: Configurar Variables de Entorno

**ANTES de hacer deploy**, configura las variables:

1. Expande la sección `Environment Variables`

2. **Agrega una por una** (click en `Add` después de cada una):

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [Tu apiKey de Firebase]
```

```
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: [Tu authDomain de Firebase]
```

```
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [Tu projectId de Firebase]
```

```
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [Tu storageBucket de Firebase]
```

```
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [Tu messagingSenderId de Firebase]
```

```
Name: NEXT_PUBLIC_FIREBASE_APP_ID
Value: [Tu appId de Firebase]
```

**Ejemplo:**
```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: AIzaSyBnX1234567890abcdefghijklmnop
```

3. **Selecciona** para todos: Production, Preview, Development

## Paso 3.3: Desplegar

1. Una vez agregadas todas las variables, click en `Deploy`

2. **Espera** 2-3 minutos mientras Vercel:
   - Clona el repositorio
   - Instala dependencias
   - Compila el proyecto
   - Despliega a producción

3. **Verás el progreso** en tiempo real

4. Cuando termine, verás: ✅ `Ready`

## Paso 3.4: Obtener URL de Producción

1. Click en la imagen de vista previa o en `Visit`

2. Tu URL será algo como:
   ```
   https://corepro-abc123.vercel.app
   ```

3. **Copia esta URL**

✅ **Parte 3 Completada** - Desplegado en Vercel

---

# PARTE 4: Configuración Final

## Paso 4.1: Autorizar Dominio en Firebase

1. **Ve a** Firebase Console

2. **Authentication** → **Settings** → **Authorized domains**

3. Click en `Add domain`

4. **Agrega tu dominio de Vercel:**
   ```
   corepro-abc123.vercel.app
   ```

5. Click en `Add`

## Paso 4.2: Habilitar Modo Producción

Ahora necesitamos cambiar del modo demo a modo Firebase real.

### Opción A: En tu computadora local

1. **Abre** el archivo `lib/firebase.ts`

2. **Reemplaza** el contenido con:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

3. **Abre** el archivo `contexts/AuthContext.tsx`

4. **Reemplaza** con el código original de Firebase (está en el archivo backup)

5. **Guarda cambios** y **sube a GitHub:**

```bash
cd c:\Users\diego\OneDrive\Documentos\tony
git add .
git commit -m "Activar modo producción con Firebase"
git push
```

6. **Vercel automáticamente** detectará el cambio y redesplegará (2-3 min)

### Opción B: Usar el sistema tal como está (Modo Demo)

Si prefieres probar primero en modo demo online:
- El sistema ya funciona con localStorage
- Puedes probarlo en Vercel tal como está
- Más adelante activas Firebase cuando estés listo

## Paso 4.3: Crear Archivo .env.local (Para desarrollo local)

1. En tu computadora, crea el archivo `.env.local` en la raíz:

```bash
cd c:\Users\diego\OneDrive\Documentos\tony
```

2. Crea el archivo con este contenido:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui
```

3. **Reemplaza** con tus valores reales de Firebase

4. **Reinicia** el servidor local:

```bash
npm run dev
```

✅ **Parte 4 Completada** - Sistema en producción

---

# PARTE 5: Verificar Funcionamiento

## Paso 5.1: Probar el Sistema en Producción

1. **Abre** tu URL de Vercel en el navegador

2. **Inicia sesión** con:
   ```
   Email:     admin@corepro.com
   Contraseña: [La que creaste en Firebase]
   ```

3. **Prueba todas las funciones:**
   - ✅ Dashboard carga correctamente
   - ✅ Agregar una venta
   - ✅ Editar stock
   - ✅ Registrar un gasto
   - ✅ Cerrar sesión
   - ✅ Volver a iniciar sesión

## Paso 5.2: Verificar Datos en Firebase

1. **Ve a** Firebase Console → Firestore Database

2. **Verás colecciones** creadas automáticamente:
   - `ventas` (con tus ventas de prueba)
   - `productos` (si agregaste alguno)
   - `gastos` (con tus gastos de prueba)

3. **Click en cada colección** para ver los documentos

## Paso 5.3: Verificar Despliegues en Vercel

1. **Ve a** Vercel Dashboard

2. Click en tu proyecto `corepro`

3. Verás:
   - Último deploy
   - URL de producción
   - Analytics (visitantes, etc.)

---

# 🎉 ¡Listo! Sistema en Producción

Tu sistema CorePro está ahora:

✅ **En GitHub** - Código versionado y respaldado
✅ **Con Firebase** - Base de datos en la nube
✅ **En Vercel** - Accesible desde cualquier lugar
✅ **HTTPS automático** - Seguro y profesional
✅ **CI/CD configurado** - Cada push a GitHub = auto-deploy

---

# 📊 Resumen de URLs

Guarda estas URLs:

```
GitHub:    https://github.com/TU-USUARIO/corepro
Firebase:  https://console.firebase.google.com/project/corepro-ong
Vercel:    https://vercel.com/tu-usuario/corepro
Producción: https://corepro-abc123.vercel.app
```

---

# 🔄 Flujo de Trabajo Futuro

## Para hacer cambios:

```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run dev

# 3. Subir a GitHub
git add .
git commit -m "Descripción del cambio"
git push

# 4. Vercel despliega automáticamente (2-3 min)
# 5. Verificar en producción
```

---

# 🛠️ Comandos Útiles

## Desarrollo Local
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run lint     # Verificar código
```

## Git
```bash
git status       # Ver cambios
git log          # Ver historial
git pull         # Traer cambios de GitHub
```

## Vercel (desde CLI - opcional)
```bash
npm install -g vercel
vercel login
vercel          # Deploy manual
vercel --prod   # Deploy a producción
```

---

# 🚨 Troubleshooting

## Error: "Auth domain not whitelisted"

**Solución:**
1. Firebase Console → Authentication → Settings
2. Authorized domains → Agregar tu dominio de Vercel

## Error: Build falla en Vercel

**Solución:**
1. Verificar variables de entorno en Vercel
2. Revisar logs del build
3. Probar `npm run build` localmente primero

## Error: "Missing or insufficient permissions"

**Solución:**
1. Verificar reglas de Firestore
2. Verificar que el usuario esté autenticado
3. Revisar Firebase Console → Firestore → Rules

---

# 📞 Siguiente Nivel

## Mejoras Opcionales:

1. **Dominio Personalizado**
   - Vercel Settings → Domains
   - Conectar tu propio dominio (ej: corepro.com)

2. **Usuarios Adicionales**
   - Firebase → Authentication → Users
   - Agregar más usuarios administradores

3. **Backup Automático**
   - Configurar exportación programada de Firestore

4. **Analytics**
   - Habilitar Vercel Analytics
   - Ver estadísticas de uso

---

**¡Felicitaciones! 🎊**

Tu sistema CorePro está completamente desplegado y listo para usar en producción.
