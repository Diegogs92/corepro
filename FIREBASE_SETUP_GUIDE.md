# 🔥 Guía Paso a Paso: Configuración de Firebase Console

## Paso 1: Habilitar Firebase Authentication

### 1.1 - Ir a Authentication
1. Abre [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **corepro-16ca3**
3. En el menú lateral izquierdo, busca y click en **"Authentication"**
4. Si es la primera vez, click en el botón **"Get started"**

### 1.2 - Habilitar Email/Password
1. Click en la pestaña **"Sign-in method"** (segunda pestaña)
2. En la lista de proveedores, busca **"Email/Password"**
3. Click en **"Email/Password"**
4. En el modal que aparece:
   - **Activar** el primer toggle (Email/Password)
   - El segundo toggle (Email link) déjalo **desactivado**
5. Click en **"Save"**

✅ **Verificación:** Deberías ver "Email/Password" con estado "Enabled"

---

## Paso 2: Crear Firestore Database

### 2.1 - Ir a Firestore
1. En el menú lateral izquierdo, busca y click en **"Firestore Database"**
2. Click en el botón **"Create database"**

### 2.2 - Configurar modo de seguridad
1. Selecciona **"Start in production mode"** (recomendado)
   - Esto requiere reglas de seguridad (configuraremos en el Paso 3)
2. Click en **"Next"**

### 2.3 - Seleccionar ubicación
1. Selecciona la región más cercana a ti:
   - **Sudamérica:** `southamerica-east1 (São Paulo)`
   - **USA:** `us-central1 (Iowa)`
   - **Europa:** `europe-west1 (Belgium)`
2. ⚠️ **IMPORTANTE:** La ubicación no se puede cambiar después
3. Click en **"Enable"**

⏳ **Espera:** La creación puede tardar 1-2 minutos

✅ **Verificación:** Deberías ver la interfaz de Firestore con pestañas "Data", "Rules", "Indexes", etc.

---

## Paso 3: Configurar Reglas de Seguridad

### 3.1 - Ir a Rules
1. En Firestore Database, click en la pestaña **"Rules"**
2. Verás un editor de texto con las reglas actuales

### 3.2 - Reemplazar reglas
1. **Borra todo** el contenido del editor
2. Copia y pega este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click en **"Publish"**

✅ **Verificación:** Deberías ver "Rules published successfully"

---

## Paso 4: Crear Usuario Admin Manualmente (Método Manual)

Si la página `/setup-admin` no funciona, puedes crear el usuario manualmente:

### 4.1 - Crear en Authentication
1. Ve a **Authentication** → pestaña **"Users"**
2. Click en **"Add user"**
3. Ingresa:
   - **Email:** `admin@thegardenboys.local`
   - **Password:** `GardenBoys2024!`
4. Click en **"Add user"**
5. **IMPORTANTE:** Copia el **UID** del usuario (algo como `kH8vFx2Pm9...`)

### 4.2 - Crear documento en Firestore
1. Ve a **Firestore Database** → pestaña **"Data"**
2. Click en **"Start collection"**
3. **Collection ID:** `usuarios`
4. Click en **"Next"**
5. **Document ID:** Pega el UID que copiaste en el paso 4.1
6. Click en **"Auto-ID"** si quieres uno automático, o pega el UID manualmente
7. Agrega estos campos uno por uno:

   | Campo | Tipo | Valor |
   |-------|------|-------|
   | `username` | string | `admin` |
   | `nombre` | string | `Admin` |
   | `apellido` | string | `Sistema` |
   | `email` | string | `admin@thegardenboys.com` |
   | `rol` | string | `ADMIN` |
   | `activo` | boolean | `true` |
   | `fechaCreacion` | timestamp | (click en reloj → "Set to current time") |
   | `telefono` | null | `null` |
   | `avatar` | null | `null` |
   | `notas` | string | `Usuario administrador del sistema` |

8. Click en **"Save"**

✅ **Verificación:** Deberías ver el documento en la colección "usuarios"

---

## Paso 5: Probar el Sistema

### 5.1 - Reiniciar servidor local
```bash
# Detén el servidor (Ctrl+C) y reinícialo
npm run dev
```

### 5.2 - Intentar login
1. Ve a: `http://localhost:3000/login`
2. Ingresa:
   - **Usuario:** `admin`
   - **Contraseña:** `GardenBoys2024!`
3. Click en **"Iniciar Sesión"**

✅ **Éxito:** Deberías entrar al dashboard

---

## Paso 6: Verificar Persistencia de Datos

### 6.1 - Crear un usuario de prueba
1. En el dashboard, ve a **Usuarios**
2. Click en **"Nuevo Usuario"**
3. Completa el formulario
4. Guarda el usuario

### 6.2 - Refrescar la página
1. Presiona **F5** o refresca el navegador
2. ✅ El usuario debería seguir ahí (NO desaparecer)

---

## ❌ Solución de Problemas

### Error: "Firebase: Error (auth/configuration-not-found)"
**Causa:** Authentication no está habilitado  
**Solución:** Revisa el Paso 1

### Error: "Missing or insufficient permissions"
**Causa:** Reglas de Firestore incorrectas  
**Solución:** Revisa el Paso 3

### Error: "auth/email-already-in-use"
**Causa:** El usuario admin ya existe  
**Solución:** Sáltate el Paso 4 e intenta hacer login directamente

### Error: "auth/invalid-credential"
**Causa:** Usuario o contraseña incorrectos  
**Solución:** Verifica que creaste el usuario con:
- Email: `admin@thegardenboys.local`
- Password: `GardenBoys2024!`

### Los cambios no persisten después de refrescar
**Causa:** Firestore no está configurado o las reglas bloquean las escrituras  
**Solución:** 
1. Verifica que completaste el Paso 2
2. Verifica las reglas del Paso 3
3. Abre la consola del navegador (F12) y busca errores

---

## 📋 Checklist Final

- [ ] Authentication habilitado con Email/Password
- [ ] Firestore Database creado
- [ ] Reglas de seguridad configuradas
- [ ] Usuario admin creado en Authentication
- [ ] Documento de usuario admin en Firestore
- [ ] Servidor reiniciado
- [ ] Login exitoso
- [ ] Datos persisten después de refrescar

---

## 🎉 ¡Listo!

Tu sistema está completamente configurado con Firebase. Ahora:

1. ✅ Los usuarios pueden iniciar sesión con username/password
2. ✅ Los datos se guardan en Firestore
3. ✅ Los cambios persisten después de refrescar
4. ✅ Múltiples usuarios pueden usar el sistema simultáneamente

**Próximos pasos:**
- Cambiar la contraseña del admin
- Crear más usuarios desde la interfaz
- Configurar productos, socios, etc.
