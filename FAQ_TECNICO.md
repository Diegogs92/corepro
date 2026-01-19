# FAQ Técnico - CorePro

Preguntas frecuentes sobre desarrollo, configuración y mantenimiento del sistema.

---

## Instalación y Configuración

### ¿Por qué elegir Next.js en lugar de Create React App?

**Ventajas de Next.js**:
- Server-Side Rendering (SSR) para mejor SEO
- App Router moderno con layouts anidados
- Optimización automática de imágenes
- Rutas basadas en archivos
- Mejor performance out-of-the-box
- Integración perfecta con Vercel

### ¿Por qué Firebase y no una base de datos tradicional?

**Ventajas de Firebase**:
- Setup inmediato, sin configuración de servidor
- Autenticación integrada
- Escalabilidad automática
- Plan gratuito generoso
- Actualizaciones en tiempo real
- SDKs bien documentados

**Alternativas consideradas**:
- PostgreSQL + Supabase
- MongoDB + Atlas
- MySQL + PlanetScale

Firebase es ideal para el MVP y para organizaciones sin equipo técnico.

### ¿Por qué Tailwind CSS y no Bootstrap o Material-UI?

**Ventajas de Tailwind**:
- Diseño personalizado sin limitaciones
- Tamaño final del bundle más pequeño
- Mejor performance
- Mayor flexibilidad
- Curva de aprendizaje moderada

---

## Desarrollo

### ¿Cómo agregar un nuevo campo a las ventas?

1. **Actualizar el tipo en `lib/types.ts`**:

```typescript
export interface Venta {
  // ... campos existentes
  nuevoCampo: string; // Agregar aquí
}
```

2. **Actualizar el formulario en `app/(dashboard)/ventas/page.tsx`**:

```typescript
const [formData, setFormData] = useState({
  // ... campos existentes
  nuevoCampo: "",
});

// En el JSX del formulario:
<Input
  label="Nuevo Campo"
  value={formData.nuevoCampo}
  onChange={(e) => setFormData({ ...formData, nuevoCampo: e.target.value })}
/>
```

3. **Actualizar la función de guardar**:

```typescript
const nuevaVenta = {
  // ... campos existentes
  nuevoCampo: formData.nuevoCampo,
};
```

4. **Actualizar la tabla para mostrar el nuevo campo**:

```typescript
<TableCell>{venta.nuevoCampo}</TableCell>
```

### ¿Cómo agregar una nueva página/módulo?

1. Crear el archivo en `app/(dashboard)/nuevo-modulo/page.tsx`
2. Agregar la ruta al sidebar en `components/layout/Sidebar.tsx`:

```typescript
const menuItems = [
  // ... items existentes
  {
    name: "Nuevo Módulo",
    href: "/nuevo-modulo",
    icon: IconComponent,
  },
];
```

### ¿Cómo crear un nuevo componente reutilizable?

1. Crear archivo en `components/ui/NuevoComponente.tsx`
2. Implementar el componente:

```typescript
import { cn } from "@/lib/utils";

interface NuevoComponenteProps {
  // Props aquí
}

export default function NuevoComponente({ ...props }: NuevoComponenteProps) {
  return (
    // JSX aquí
  );
}
```

3. Exportar e importar donde sea necesario.

---

## Firebase

### ¿Cómo crear índices en Firestore para consultas complejas?

Si Firebase devuelve un error pidiendo un índice:

1. Click en el link del error en la consola
2. Te llevará a Firebase Console
3. Click en "Crear índice"
4. Esperar 1-2 minutos

O crear manualmente:
- Firebase Console → Firestore → Indexes
- Definir colección y campos

### ¿Cómo hacer backup de Firestore?

**Opción 1: Exportar manualmente**
1. Firebase Console → Firestore → Data
2. Usar Firebase CLI:

```bash
firebase firestore:export backup-folder
```

**Opción 2: Backup automático (requiere plan Blaze)**
- Configurar en Firebase Console → Backups

### ¿Cómo cambiar las reglas de seguridad de Firestore?

1. Firebase Console → Firestore → Rules
2. Editar las reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ejemplo: Solo lectura para todos autenticados
    match /ventas/{ventaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click en "Publicar"

### ¿Cómo limitar el acceso por email?

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email.matches('.*@corepro.com$');
    }

    match /ventas/{ventaId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## Autenticación

### ¿Cómo agregar más proveedores de autenticación?

**Para Google Sign-In**:

1. Firebase Console → Authentication → Sign-in method
2. Habilitar Google
3. Actualizar `app/(auth)/login/page.tsx`:

```typescript
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

// En el JSX:
<Button onClick={signInWithGoogle}>
  Iniciar con Google
</Button>
```

### ¿Cómo implementar "Olvidé mi contraseña"?

1. Crear componente de reseteo:

```typescript
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const handleReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
  alert("Email enviado");
};
```

2. Agregar link en la página de login.

### ¿Cómo agregar roles de usuario?

**Opción 1: Custom Claims (requiere Cloud Functions)**

```typescript
// En una Cloud Function
admin.auth().setCustomUserClaims(uid, { role: 'admin' });

// En el frontend
const token = await user.getIdTokenResult();
const role = token.claims.role;
```

**Opción 2: Colección de usuarios en Firestore**

```typescript
// Crear colección "users"
{
  uid: "user_id",
  email: "user@example.com",
  role: "admin" | "vendedor" | "contador"
}

// Verificar en el frontend
const userDoc = await getDoc(doc(db, "users", user.uid));
const role = userDoc.data()?.role;
```

---

## Despliegue

### ¿Cómo ver los logs de errores en producción?

**En Vercel**:
1. Dashboard → Tu Proyecto → Logs
2. Ver errores en tiempo real

**Alternativa: Sentry**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### ¿Cómo hacer rollback a una versión anterior?

**En Vercel**:
1. Dashboard → Deployments
2. Seleccionar deployment anterior
3. Click en `⋯` → "Promote to Production"

### ¿Cómo configurar un dominio personalizado?

**En Vercel**:
1. Settings → Domains
2. Agregar dominio: `corepro.com`
3. Configurar DNS según instrucciones
4. Esperar propagación (1-48 horas)

**En Firebase**:
1. Authentication → Settings → Authorized domains
2. Agregar el nuevo dominio

### ¿Cómo habilitar HTTPS?

Vercel provee HTTPS automáticamente con Let's Encrypt. No requiere configuración adicional.

---

## Performance

### ¿Cómo reducir el tamaño del bundle?

1. **Analizar el bundle**:

```bash
npm install @next/bundle-analyzer

# En next.config.mjs:
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Ejecutar:
ANALYZE=true npm run build
```

2. **Lazy loading de componentes**:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

### ¿Cómo optimizar las consultas a Firestore?

1. **Limitar resultados**:

```typescript
const q = query(collection(db, "ventas"), limit(50));
```

2. **Usar índices compuestos**
3. **Cachear datos con React Query**:

```bash
npm install @tanstack/react-query

# Implementar en layout:
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

### ¿Cómo implementar paginación?

```typescript
const [lastDoc, setLastDoc] = useState(null);

const loadMore = async () => {
  const q = query(
    collection(db, "ventas"),
    orderBy("fecha", "desc"),
    startAfter(lastDoc),
    limit(20)
  );

  const snapshot = await getDocs(q);
  setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
};
```

---

## Debugging

### Error: "Hydration failed"

**Causa**: Diferencia entre HTML del servidor y cliente.

**Solución**:
```typescript
// Usar cliente-only para componentes que dependen del browser
"use client";

// O usar useEffect para contenido dinámico
useEffect(() => {
  // Código que depende del browser
}, []);
```

### Error: "Module not found: Can't resolve '@/...'"

**Solución**: Verificar `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Solución**:
1. Verificar que `.env.local` existe
2. Las variables empiezan con `NEXT_PUBLIC_`
3. Reiniciar el servidor de desarrollo

---

## Testing

### ¿Cómo agregar tests unitarios?

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Crear jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
};

# Crear tests/__tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from '@/components/ui/Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### ¿Cómo testear componentes con Firebase?

Usar mocks:

```typescript
jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
}));
```

---

## Seguridad

### ¿Cómo proteger las API keys?

Las `NEXT_PUBLIC_*` variables son públicas por diseño. Firebase usa reglas de seguridad para proteger los datos.

**NO exponer**:
- API keys de servicios de pago
- Claves privadas
- Tokens de acceso

**SÍ está bien exponer**:
- Firebase config (protegido por reglas)
- API keys de servicios públicos

### ¿Cómo prevenir SQL Injection?

Firestore no es vulnerable a SQL injection porque no usa SQL. Usa NoSQL con validación de tipos.

### ¿Cómo implementar rate limiting?

**Opción 1: Firebase App Check**
1. Firebase Console → App Check
2. Configurar reCAPTCHA v3

**Opción 2: Vercel Edge Middleware**
```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Implementar lógica de rate limiting
}
```

---

## Monitoreo

### ¿Cómo monitorear el uso de Firebase?

1. Firebase Console → Usage and billing
2. Ver:
   - Reads/Writes por día
   - Storage usado
   - Bandwidth

### ¿Cómo recibir alertas de errores?

**Con Sentry**:
```bash
npm install @sentry/nextjs
```

**Con Vercel Log Drains**:
- Settings → Log Drains
- Conectar con servicio de logging

---

## Migración

### ¿Cómo migrar de Firebase a otra base de datos?

1. **Exportar datos**:

```bash
firebase firestore:export ./backup
```

2. **Transformar datos** al nuevo formato
3. **Adaptar código**:
   - Reemplazar imports de Firebase
   - Actualizar queries
   - Ajustar tipos TypeScript

### ¿Cómo migrar de Vercel a otro hosting?

Next.js es portable. Puedes deployar en:
- **Netlify**: `next export` para sitios estáticos
- **AWS Amplify**: Soporte nativo de Next.js
- **Self-hosted**: `next build` + `next start`

---

## Mejores Prácticas

### Estructura de archivos

```
✅ Bueno:
- Colocation (componentes cerca de donde se usan)
- Nombres descriptivos
- Separación de concerns

❌ Evitar:
- Archivos gigantes (> 500 líneas)
- Componentes muy anidados (> 4 niveles)
- Lógica en el JSX
```

### Gestión de estado

```
✅ Usar:
- useState para estado local
- Context para estado global ligero
- React Query para datos del servidor

❌ Evitar:
- Redux (overkill para este proyecto)
- Estado global para todo
```

### Performance

```
✅ Hacer:
- Memoización con useMemo/useCallback
- Lazy loading de rutas pesadas
- Optimizar imágenes con next/image

❌ Evitar:
- Re-renders innecesarios
- Consultas sin límite
- Imágenes sin optimizar
```

---

## Recursos Adicionales

### Documentación Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Comunidades
- [Next.js Discord](https://nextjs.org/discord)
- [Firebase Discord](https://discord.gg/firebase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

### Cursos Recomendados
- [Next.js Official Tutorial](https://nextjs.org/learn)
- [Firebase Web Codelab](https://firebase.google.com/codelabs)

---

**Última actualización**: Enero 2026
