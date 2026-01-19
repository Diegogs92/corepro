# Guía de Instalación y Despliegue - CorePro

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.x o superior → [Descargar](https://nodejs.org/)
- **Git** → [Descargar](https://git-scm.com/)
- **Una cuenta de Firebase** → [Crear cuenta](https://firebase.google.com/)
- **Una cuenta de Vercel** → [Crear cuenta](https://vercel.com/)

---

## Instalación Local

### Paso 1: Clonar el Proyecto

```bash
# Si tienes el proyecto en Git
git clone <url-del-repositorio>
cd tony

# O si descargaste el proyecto como ZIP
cd tony
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias listadas en `package.json`:
- Next.js
- React
- Firebase
- Tailwind CSS
- TypeScript
- Y otras librerías necesarias

**Tiempo estimado**: 2-5 minutos dependiendo de tu conexión.

### Paso 3: Configurar Firebase

Seguir la guía completa en [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

**Resumen rápido**:

1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Obtener credenciales del proyecto

### Paso 4: Configurar Variables de Entorno

1. Copiar el archivo de ejemplo:

```bash
cp .env.local.example .env.local
```

2. Editar `.env.local` con tus credenciales de Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Paso 5: Crear Usuario Administrador

En Firebase Console:

1. Ir a **Authentication** → **Users**
2. Click en **Add user**
3. Email: `admin@corepro.com`
4. Password: crear una contraseña segura
5. Click en **Add user**

### Paso 6: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

### Paso 7: Probar el Sistema

1. Abrir `http://localhost:3000` en tu navegador
2. Deberías ver la pantalla de login
3. Ingresar con las credenciales creadas en el Paso 5
4. Si todo está correcto, verás el Dashboard

---

## Verificación de la Instalación

### Checklist

- [ ] El servidor inicia sin errores
- [ ] Puedo acceder a `http://localhost:3000`
- [ ] Veo la pantalla de login
- [ ] Puedo iniciar sesión con las credenciales
- [ ] Veo el Dashboard después de iniciar sesión
- [ ] Puedo navegar entre las secciones (Ventas, Stock, Gastos)

### Problemas Comunes

#### Error: "Cannot find module 'next'"

**Solución**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

#### Error: "Firebase: Error (auth/invalid-api-key)"

**Solución**:
- Verificar que el archivo `.env.local` existe
- Verificar que las credenciales sean correctas
- Reiniciar el servidor: `Ctrl+C` y luego `npm run dev`

#### Error: "Port 3000 is already in use"

**Solución**:
```bash
# Usar otro puerto
npm run dev -- -p 3001
```

O cerrar el proceso que está usando el puerto 3000.

---

## Despliegue en Producción (Vercel)

### Opción A: Desplegar desde GitHub (Recomendado)

#### Paso 1: Subir el Código a GitHub

```bash
# Inicializar Git (si no lo hiciste)
git init

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "Initial commit - CorePro v1.0"

# Conectar con GitHub
git remote add origin https://github.com/tu-usuario/corepro.git

# Subir código
git push -u origin main
```

#### Paso 2: Conectar Vercel con GitHub

1. Ir a [vercel.com](https://vercel.com)
2. Click en **Add New** → **Project**
3. **Import Git Repository**
4. Seleccionar tu repositorio `corepro`
5. Click en **Import**

#### Paso 3: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Next.js.

**Framework Preset**: Next.js ✓
**Build Command**: `next build` ✓
**Output Directory**: `.next` ✓

Click en **Deploy** (por ahora sin variables de entorno)

#### Paso 4: Configurar Variables de Entorno

1. Ir a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **Environment Variables**
3. Agregar una por una:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tu API Key de Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Tu Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Tu Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Tu Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Tu Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Tu App ID |

4. Seleccionar los tres ambientes: Production, Preview, Development
5. Click en **Save**

#### Paso 5: Redesplegar

1. Ir a **Deployments**
2. Click en el último deployment
3. Click en los tres puntos `⋯` → **Redeploy**
4. Marcar **Use existing Build Cache**
5. Click en **Redeploy**

#### Paso 6: Verificar el Despliegue

1. Esperar a que termine el deployment (1-2 minutos)
2. Click en **Visit** para ver tu sitio
3. La URL será algo como: `https://corepro-abc123.vercel.app`

### Opción B: Desplegar desde CLI

#### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso 2: Login en Vercel

```bash
vercel login
```

Seguir las instrucciones en pantalla.

#### Paso 3: Desplegar

```bash
vercel
```

Responder las preguntas:
- Set up and deploy? **Y**
- Which scope? Seleccionar tu cuenta
- Link to existing project? **N**
- Project name? `corepro`
- In which directory is your code located? `./`

#### Paso 4: Configurar Variables de Entorno

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Pegar el valor cuando lo pida
# Seleccionar: Production, Preview, Development

# Repetir para cada variable:
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

#### Paso 5: Redesplegar con Variables

```bash
vercel --prod
```

---

## Post-Despliegue

### Configurar Dominio Personalizado (Opcional)

#### En Vercel:

1. Ir a **Settings** → **Domains**
2. Agregar tu dominio (ej: `corepro.com`)
3. Seguir instrucciones para configurar DNS

#### En Firebase:

1. Ir a **Authentication** → **Settings** → **Authorized domains**
2. Agregar tu dominio de Vercel: `corepro-abc123.vercel.app`
3. Si tienes dominio personalizado, agregarlo también

### Crear Usuarios Adicionales

En Firebase Console:

1. **Authentication** → **Users** → **Add user**
2. Crear usuarios para cada persona que usará el sistema

### Backup Inicial

Recomendado hacer un backup de la configuración:

1. Guardar las credenciales de Firebase en un lugar seguro
2. Documentar los usuarios creados
3. Guardar la URL de producción

---

## Mantenimiento

### Actualizar el Sistema

#### Cambios en el Código:

```bash
# 1. Hacer cambios en el código
# 2. Probar localmente
npm run dev

# 3. Commitear cambios
git add .
git commit -m "Descripción de los cambios"

# 4. Subir a GitHub
git push

# 5. Vercel desplegará automáticamente
```

#### Actualizar Dependencias:

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas
npm update

# O actualizar una específica
npm install next@latest
```

### Monitorear el Sistema

#### En Vercel:

- **Analytics**: Ver visitantes y uso
- **Logs**: Ver errores del servidor
- **Deployments**: Historial de despliegues

#### En Firebase:

- **Authentication**: Ver usuarios activos
- **Firestore**: Ver uso de base de datos
- **Usage**: Controlar límites del plan gratuito

---

## Límites del Plan Gratuito

### Vercel (Hobby Plan)

- ✅ Despliegues ilimitados
- ✅ HTTPS automático
- ✅ 100 GB de ancho de banda/mes
- ✅ Dominios personalizados

### Firebase (Spark Plan)

- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día
- ✅ 1 GB de almacenamiento
- ✅ 10 GB de transferencia/mes

Para la mayoría de ONGs pequeñas (< 100 transacciones/día), el plan gratuito es suficiente.

---

## Próximos Pasos

1. [ ] Configurar backup automático de Firestore
2. [ ] Agregar reglas de seguridad más estrictas
3. [ ] Configurar monitoreo de errores (Sentry)
4. [ ] Documentar procesos internos
5. [ ] Capacitar usuarios en el sistema

---

## Soporte

### Documentación Disponible

- [README.md](./README.md) - Información general
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Configuración detallada de Firebase
- [GUIA_USUARIO.md](./GUIA_USUARIO.md) - Manual para usuarios finales
- [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) - Arquitectura del sistema

### Recursos Externos

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**¡Instalación completada!** 🎉

El sistema CorePro está listo para usar.
