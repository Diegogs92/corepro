# 🔥 Script de Inicialización de Firebase

Este script automatiza completamente la configuración inicial de Firebase para The Garden Boys.

## ✅ Requisitos Previos

Antes de ejecutar el script, debes completar estos pasos en Firebase Console:

### 1. Habilitar Firebase Authentication
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **corepro-16ca3**
3. Click en **"Authentication"** → **"Get Started"**
4. Pestaña **"Sign-in method"** → Habilitar **"Email/Password"**

### 2. Crear Firestore Database
1. Click en **"Firestore Database"** → **"Create database"**
2. Modo: **"Production mode"**
3. Región: **us-central1** (o la más cercana)
4. Click en **"Enable"**

### 3. Configurar Reglas de Firestore
1. En Firestore, pestaña **"Rules"**
2. Reemplazar con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click en **"Publish"**

## 🚀 Ejecutar el Script

Una vez completados los pasos anteriores:

```bash
# Ejecutar el script de inicialización
npx tsx scripts/init-firebase.ts
```

## 📦 ¿Qué hace el script?

El script crea automáticamente:

### 1. Usuario Administrador
- **Usuario:** admin
- **Contraseña:** admin123
- **Email:** admin@thegardenboys.local
- Documento en Firestore con todos los datos

### 2. Categorías de Productos (3)
- Flores
- Resinas
- Extractos

### 3. Tipos de Socio (3)
- Regular (cuota: $5000, límite: 20g)
- Premium (cuota: $8000, límite: 40g)
- VIP (cuota: $12000, límite: 60g)

### 4. Categorías de Gastos (5)
- Suministros
- Servicios
- Mantenimiento
- Personal
- Otros

### 5. Colecciones Vacías (5)
- productos
- socios
- ventas
- gastos
- movimientosStock

## ✅ Después de ejecutar el script

1. Deberías ver un mensaje de éxito con el resumen
2. Ve a `http://localhost:3000/login`
3. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123`

## 🔍 Verificación

Puedes verificar que todo se creó correctamente en Firebase Console:

- **Authentication → Users:** Deberías ver el usuario admin@thegardenboys.local
- **Firestore Database → Data:** Deberías ver las colecciones:
  - usuarios (1 documento)
  - categoriasProductos (3 documentos)
  - tiposSocio (3 documentos)
  - categoriasGastos (5 documentos)
  - productos, socios, ventas, gastos, movimientosStock (con placeholders)

## ⚠️ Notas Importantes

- El script es **idempotente**: Si el usuario admin ya existe, lo omite
- Puedes ejecutarlo múltiples veces sin problemas
- Los placeholders en las colecciones vacías se pueden eliminar manualmente después

## ❌ Solución de Problemas

### Error: "auth/configuration-not-found"
→ No completaste el Paso 1 (Habilitar Authentication)

### Error: "Missing or insufficient permissions"
→ No completaste el Paso 3 (Configurar reglas de Firestore)

### Error: "auth/email-already-in-use"
→ El usuario admin ya existe, puedes ignorar este error e intentar hacer login

### Error: Cannot find module '../lib/firebase'
→ Asegúrate de ejecutar el comando desde la raíz del proyecto
