# 🚀 Deployment CorePro - Diego García

## ✅ Estado Actual

### GitHub
- **Repositorio:** https://github.com/Diegogs92/corepro
- **Estado:** ✅ Código subido correctamente
- **Rama:** main

### Vercel
- **Proyecto:** https://vercel.com/dgarciasantillan-7059s-projects/corepro
- **Estado:** ⏳ Pendiente de configurar variables de entorno

---

## 📋 Próximos Pasos

### Paso 1: Configurar Firebase (15 minutos)

#### 1.1 Crear Proyecto Firebase

1. **Ir a:** https://console.firebase.google.com/

2. **Crear nuevo proyecto:**
   ```
   Nombre: corepro
   Google Analytics: Deshabilitado (opcional)
   ```

3. **Esperar** que se cree el proyecto

#### 1.2 Configurar Authentication

1. Click en **Authentication** → **Get started**

2. Habilitar **Email/Password**:
   - Sign-in method → Email/Password → Enable
   - Guardar

3. **Crear usuario administrador:**
   - Users → Add user
   ```
   Email:     admin@corepro.com
   Password:  [Crear una segura, ej: CorePro2024!]
   ```
   **⚠️ Guardar estas credenciales!**

#### 1.3 Crear Firestore Database

1. Click en **Firestore Database** → **Create database**

2. Seleccionar:
   ```
   Mode: Production mode
   Location: southamerica-east1 (São Paulo)
   ```

3. **Esperar** 1-2 minutos

4. **Configurar reglas de seguridad:**

   - Ir a pestaña **Rules**
   - Reemplazar con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }

    match /ventas/{ventaId} {
      allow read, write: if isAuthenticated();
    }

    match /productos/{productoId} {
      allow read, write: if isAuthenticated();
    }

    match /gastos/{gastoId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

   - Click en **Publish**

#### 1.4 Obtener Credenciales

1. Click en ⚙️ **Project Settings**

2. Scroll hasta **Your apps**

3. Click en el icono **Web** `</>`

4. Registrar app:
   ```
   App nickname: CorePro Web
   ```

5. **Copiar las credenciales:**

```javascript
// Estas las necesitarás para Vercel
const firebaseConfig = {
  apiKey: "AIza...",                                    // ← Copiar
  authDomain: "corepro-xxxxx.firebaseapp.com",         // ← Copiar
  projectId: "corepro-xxxxx",                          // ← Copiar
  storageBucket: "corepro-xxxxx.appspot.com",          // ← Copiar
  messagingSenderId: "123456789",                       // ← Copiar
  appId: "1:123456789:web:abc123..."                   // ← Copiar
};
```

**📝 Guardar estas 6 credenciales en un archivo de texto temporal**

---

### Paso 2: Configurar Variables de Entorno en Vercel (5 minutos)

#### 2.1 Ir a Configuración de Vercel

1. **Ir a:** https://vercel.com/dgarciasantillan-7059s-projects/corepro

2. Click en **Settings** (arriba)

3. En el menú lateral, click en **Environment Variables**

#### 2.2 Agregar Variables (una por una)

**Variable 1:**
```
Name:  NEXT_PUBLIC_FIREBASE_API_KEY
Value: [Pegar tu apiKey de Firebase]
Environment: Production, Preview, Development (marcar las 3)
```
Click en **Save**

**Variable 2:**
```
Name:  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: [Pegar tu authDomain]
Environment: Production, Preview, Development
```
Click en **Save**

**Variable 3:**
```
Name:  NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [Pegar tu projectId]
Environment: Production, Preview, Development
```
Click en **Save**

**Variable 4:**
```
Name:  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [Pegar tu storageBucket]
Environment: Production, Preview, Development
```
Click en **Save**

**Variable 5:**
```
Name:  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [Pegar tu messagingSenderId]
Environment: Production, Preview, Development
```
Click en **Save**

**Variable 6:**
```
Name:  NEXT_PUBLIC_FIREBASE_APP_ID
Value: [Pegar tu appId]
Environment: Production, Preview, Development
```
Click en **Save**

---

### Paso 3: Activar Modo Producción (3 minutos)

Ahora necesitamos cambiar el código del modo demo a Firebase real.

#### 3.1 Actualizar archivo firebase.ts

En tu computadora:

```bash
cd c:\Users\diego\OneDrive\Documentos\tony
```

Abre el archivo `lib/firebase.ts` y reemplaza TODO el contenido con:

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

#### 3.2 Actualizar AuthContext.tsx

Abre `contexts/AuthContext.tsx` y reemplaza TODO el contenido con:

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### 3.3 Subir Cambios a GitHub

```bash
git add .
git commit -m "Activar modo producción con Firebase"
git push
```

**Vercel detectará el cambio y redesplegará automáticamente (2-3 minutos)**

---

### Paso 4: Configurar Dominio Autorizado en Firebase (1 minuto)

1. **Ir a** Firebase Console

2. **Authentication** → **Settings** → **Authorized domains**

3. Vercel te dará una URL como: `corepro-abc123.vercel.app`

4. **Agregar esa URL** a los dominios autorizados:
   - Click en **Add domain**
   - Pegar: `tu-url.vercel.app` (sin https://)
   - Save

---

### Paso 5: Crear .env.local para Desarrollo Local

En tu computadora, crea el archivo `.env.local`:

```bash
cd c:\Users\diego\OneDrive\Documentos\tony
```

Crea el archivo con este contenido (reemplaza con tus valores de Firebase):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id_aqui
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id_aqui
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id_aqui
```

**NO subir este archivo a GitHub** (ya está en .gitignore)

---

## 🎉 ¡Listo!

### Verificar que Todo Funciona

1. **Ir a tu URL de Vercel**
   - Encontrarla en: https://vercel.com/dgarciasantillan-7059s-projects/corepro
   - Click en "Visit" o en el dominio mostrado

2. **Iniciar sesión:**
   ```
   Email:     admin@corepro.com
   Password:  [La que creaste en Firebase]
   ```

3. **Probar funcionalidades:**
   - ✅ Ver Dashboard
   - ✅ Agregar una venta
   - ✅ Editar un producto en Stock
   - ✅ Registrar un gasto
   - ✅ Cerrar sesión y volver a entrar

4. **Verificar en Firebase:**
   - Ir a Firestore Database
   - Ver que se crearon las colecciones automáticamente
   - Ver los documentos que agregaste

---

## 📊 URLs de tu Sistema

```
GitHub:     https://github.com/Diegogs92/corepro
Vercel:     https://vercel.com/dgarciasantillan-7059s-projects/corepro
Firebase:   https://console.firebase.google.com/project/corepro
Producción: https://corepro-[tu-hash].vercel.app
```

---

## 🔄 Flujo de Trabajo para Cambios Futuros

```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run dev

# 3. Subir a GitHub
git add .
git commit -m "Descripción del cambio"
git push

# 4. Vercel despliega automáticamente
# Esperar 2-3 minutos y refrescar la URL de producción
```

---

## 🚨 Troubleshooting

### Error: "Auth domain not whitelisted"
**Solución:** Agregar tu dominio de Vercel en Firebase Authentication → Settings → Authorized domains

### Error: Variables de entorno no funcionan
**Solución:**
1. Verificar que todas las 6 variables estén en Vercel
2. Redeploy manual: Vercel → Deployments → Latest → ⋯ → Redeploy

### Error de login
**Solución:**
1. Verificar credenciales en Firebase Authentication → Users
2. Resetear password si es necesario

---

## ✅ Checklist Final

- [ ] Firebase proyecto creado
- [ ] Authentication habilitado
- [ ] Usuario admin creado
- [ ] Firestore Database creado
- [ ] Reglas de seguridad configuradas
- [ ] Credenciales copiadas
- [ ] Variables en Vercel configuradas
- [ ] Código actualizado a modo producción
- [ ] Push a GitHub realizado
- [ ] Dominio autorizado en Firebase
- [ ] .env.local creado localmente
- [ ] Sistema probado en producción

---

**¡Tu sistema CorePro está listo para usar en producción!** 🎊
