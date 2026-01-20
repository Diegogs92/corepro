# 🔥 Instrucciones de Configuración de Firebase

## ✅ Configuración Completada

- ✓ Dependencias de Firebase instaladas
- ✓ Archivo de configuración creado (`lib/firebase.ts`)
- ✓ Variables de entorno configuradas (`.env.local`)
- ✓ AuthContext actualizado para usar Firebase Auth
- ✓ Funciones helper de Firestore creadas
- ✓ Página de login con manejo de errores
- ✓ Página de inicialización de admin creada

## 📋 Pasos Pendientes en Firebase Console

Debes completar estos 3 pasos en Firebase Console:

### **Paso 1: Habilitar Firebase Authentication**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **corepro-16ca3**
3. En el menú lateral, click en **"Authentication"**
4. Click en **"Get Started"** (si es la primera vez)
5. Ve a la pestaña **"Sign-in method"**
6. Click en **"Email/Password"**
7. **Habilita** la opción "Email/Password" (toggle en ON)
8. Click en **"Save"**

### **Paso 2: Crear Cloud Firestore Database**

1. En el menú lateral de Firebase Console, click en **"Firestore Database"**
2. Click en **"Create database"**
3. Selecciona modo **"production mode"**
4. Selecciona la región más cercana a ti (ej: `us-central1` o `southamerica-east1`)
5. Click en **"Enable"**

### **Paso 3: Configurar Reglas de Seguridad de Firestore**

1. En Firestore Database, ve a la pestaña **"Rules"**
2. Reemplaza las reglas con el siguiente código:

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

## 🚀 Inicializar el Sistema

Una vez completados los 3 pasos anteriores:

### 1. Reiniciar el servidor de desarrollo

```bash
npm run dev
```

### 2. Ir a la página de inicialización

Abre tu navegador y ve a:
```
http://localhost:3000/setup-admin
```

### 3. Crear usuario admin

- Click en el botón **"Crear Usuario Admin"**
- Se creará el usuario con estas credenciales:
  - **Usuario:** admin
  - **Contraseña:** GardenBoys2024!

### 4. Iniciar sesión

- Ve a `http://localhost:3000/login`
- Inicia sesión con:
  - Usuario: `admin`
  - Contraseña: `GardenBoys2024!`

### 5. Cambiar contraseña (Recomendado)

Por seguridad, debes cambiar la contraseña del admin después del primer inicio de sesión.

## 📂 Estructura de Colecciones en Firestore

El sistema creará automáticamente estas colecciones:

- **`usuarios`** - Usuarios del sistema
- **`productos`** - Productos/variedades de cannabis  
- **`categoriasProductos`** - Categorías de productos
- **`socios`** - Socios del club
- **`tiposSocio`** - Tipos de membresía
- **`ventas`** - Ventas realizadas
- **`gastos`** - Gastos del club
- **`categoriasGastos`** - Categorías de gastos
- **`movimientosStock`** - Historial de movimientos de stock

## 🔐 Sistema de Autenticación

El sistema usa **emails virtuales** para la autenticación:

- Cuando creas un usuario con username `juan`, Firebase crea `juan@thegardenboys.local`
- Los usuarios inician sesión con su username, no con el email virtual
- Firebase Auth maneja la autenticación de forma segura

## ✅ Verificación

Para verificar que todo funciona:

1. ✓ Puedes iniciar sesión con el usuario admin
2. ✓ Los datos NO se borran al refrescar la página
3. ✓ Puedes crear, editar y eliminar usuarios
4. ✓ Los cambios persisten después de refrescar

## 🆘 Solución de Problemas

### Error: "Firebase: Error (auth/configuration-not-found)"
→ No has habilitado Authentication en Firebase Console (Paso 1)

### Error: "Missing or insufficient permissions"
→ No has configurado las reglas de Firestore correctamente (Paso 3)

### Error: "auth/email-already-in-use"
→ El usuario admin ya existe. Puedes ir directo a login.

### Los cambios no persisten
→ Verifica que completaste el Paso 2 (Crear Firestore Database)

## 📞 Soporte

Si encuentras problemas, verifica:
1. Que las variables de entorno en `.env.local` sean correctas
2. Que Authentication esté habilitado en Firebase
3. Que Firestore Database esté creado
4. Que las reglas de Firestore permitan lectura/escritura a usuarios autenticados
5. Que reiniciaste el servidor después de crear `.env.local`

---

**Próximos Pasos:**
- Crear más usuarios desde la página de Usuarios
- Configurar productos, socios, etc.
- Personalizar el sistema según tus necesidades
