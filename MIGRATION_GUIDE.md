# Guía de Migración: Firebase → Supabase

## 📋 Resumen

Esta guía documenta el proceso completo de migración de **Firebase Firestore** a **Supabase PostgreSQL** para el sistema TGB (The Garden Boys).

## 🎯 Estado Actual

### ✅ Completado

1. **Esquema de Base de Datos** (`supabase/migrations/001_initial_schema.sql`)
   - 18 tablas completas con todas las relaciones
   - Triggers automáticos para `updated_at`
   - Funciones para secuencias (ventas, gastos, cosechas)
   - Generación automática de códigos de cultivos
   - Vistas optimizadas (socios_con_deuda, productos_stock_bajo, etc.)

2. **Políticas de Seguridad** (`supabase/migrations/002_rls_policies.sql`)
   - Row Level Security (RLS) habilitado en todas las tablas
   - Funciones helper para roles y permisos
   - Políticas por tabla replicando reglas de Firestore

3. **Capa de Servicios** (`lib/supabaseService.ts`)
   - API compatible con firebaseService.ts existente
   - Conversión automática camelCase ↔ snake_case
   - Servicios extendidos con lógica de negocio
   - Soporte para transacciones complejas

4. **Sistema de Autenticación** (`contexts/AuthContextSupabase.tsx`)
   - Migrado a Supabase Auth
   - Mantiene sistema de emails virtuales
   - Compatible con código existente

## 🚀 Pasos de Deployment

### Paso 1: Ejecutar Migraciones SQL en Supabase

1. Ir al dashboard de Supabase: https://supabase.com/dashboard/project/skpcllqbhljlmpqpkmbn
2. Navegar a **SQL Editor**
3. Ejecutar en orden:

#### a) Schema Inicial
```sql
-- Copiar y ejecutar todo el contenido de:
-- supabase/migrations/001_initial_schema.sql
```

#### b) Políticas RLS
```sql
-- Copiar y ejecutar todo el contenido de:
-- supabase/migrations/002_rls_policies.sql
```

### Paso 2: Configurar Variables de Entorno

Actualizar `.env.local`:

```bash
# Reemplazar variables de Firebase por Supabase
NEXT_PUBLIC_SUPABASE_URL=https://skpcllqbhljlmpqpkmbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcGNsbHFiaGxqbG1wcXBrbWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDU4ODEsImV4cCI6MjA4NDcyMTg4MX0.2-hC3BFKdtTeBeF6UV2xn2Q0N6Vl05Y1V1_VnXYHqrU
```

### Paso 3: Actualizar Imports en el Código

Necesitas actualizar las importaciones en todos los archivos que usen Firebase:

#### Cambios Globales de Importación

**Antes (Firebase):**
```typescript
import { firebaseService, sociosService, ventasService } from '@/lib/firebaseService'
```

**Después (Supabase):**
```typescript
import { sociosService, ventasService } from '@/lib/supabaseService'
```

#### Archivos a Actualizar

Buscar y reemplazar en estos archivos:

1. **Todas las páginas del dashboard:**
   - `app/(dashboard)/socios/page.tsx`
   - `app/(dashboard)/ventas/page.tsx`
   - `app/(dashboard)/productos/page.tsx`
   - `app/(dashboard)/stock/page.tsx`
   - `app/(dashboard)/gastos/page.tsx`
   - `app/(dashboard)/usuarios/page.tsx`
   - `app/(dashboard)/cultivos/page.tsx`
   - `app/(dashboard)/dashboard/page.tsx`

2. **Layout del dashboard:**
   - `app/(dashboard)/layout.tsx` - Cambiar import de AuthContext

3. **Root layout:**
   - `app/layout.tsx` - Cambiar import de AuthContext

**Comando de búsqueda y reemplazo:**
```bash
# Buscar archivos que importen firebaseService
grep -r "from.*firebaseService" app/

# Buscar archivos que importen AuthContext
grep -r "from.*AuthContext" app/
```

### Paso 4: Actualizar AuthContext

En `app/layout.tsx` y cualquier archivo que importe AuthContext:

**Antes:**
```typescript
import { AuthProvider } from '@/contexts/AuthContext'
```

**Después:**
```typescript
import { AuthProvider } from '@/contexts/AuthContextSupabase'
```

### Paso 5: Migrar Datos de Firebase a Supabase

Crear un script de migración de datos (ver `scripts/migrate-data.ts` abajo).

## 📁 Estructura de Archivos Nuevos

```
TGB/
├── lib/
│   ├── supabase.ts                    # Cliente de Supabase
│   ├── database.types.ts              # Tipos TypeScript generados
│   ├── supabaseService.ts             # Servicios CRUD + extendidos
│   └── firebase.ts                    # ❌ Deprecated (mantener para migración)
├── contexts/
│   ├── AuthContextSupabase.tsx        # ✅ Nuevo AuthContext
│   └── AuthContext.tsx                # ❌ Deprecated
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql     # Schema completo
│       └── 002_rls_policies.sql       # Políticas de seguridad
└── scripts/
    └── migrate-data.ts                # Script de migración de datos
```

## 🔄 Diferencias Clave: Firebase vs Supabase

### 1. Nomenclatura de Campos

| Firebase (camelCase) | Supabase (snake_case) |
|---------------------|----------------------|
| `montoInvertidoUSD` | `monto_invertido_usd` |
| `fechaIngreso`      | `fecha_ingreso`      |
| `stockActual`       | `stock_actual`       |

**Solución:** El servicio convierte automáticamente con `dbToApp()` y `appToDb()`

### 2. Timestamps

| Firebase | Supabase |
|----------|----------|
| `Timestamp` object | ISO 8601 string |
| `serverTimestamp()` | `NOW()` (SQL) |
| `new Date()` → Timestamp | `new Date()` → ISO string |

**Solución:** Conversión automática en helpers

### 3. IDs

| Firebase | Supabase |
|----------|----------|
| Auto-generated string | UUID v4 |
| `doc().id` | `uuid_generate_v4()` |

### 4. Queries

**Firebase:**
```typescript
const q = query(
  collection(db, 'socios'),
  where('activo', '==', true),
  orderBy('nombre')
)
const snapshot = await getDocs(q)
```

**Supabase:**
```typescript
const { data } = await supabase
  .from('socios')
  .select('*')
  .eq('activo', true)
  .order('nombre')
```

**Con el servicio:**
```typescript
// Ambos funcionan igual
const socios = await sociosService.query({ activo: true })
```

### 5. Transacciones

**Firebase:**
```typescript
await runTransaction(db, async (transaction) => {
  // operaciones
})
```

**Supabase:**
```typescript
// Manejado manualmente con try/catch y rollback
// Ver ventasServiceExtended.createVentaCompleta()
```

## 🔐 Migración de Usuarios

### Crear Usuario Admin Inicial en Supabase

```sql
-- 1. Crear usuario en Supabase Auth (Dashboard → Authentication → Add User)
-- Email: admin@thegardenboys.local
-- Password: [tu contraseña]

-- 2. Copiar el UUID generado y ejecutar:
INSERT INTO usuarios (id, username, nombre, rol, activo, fecha_creacion)
VALUES (
  '[UUID del usuario creado]',
  'admin',
  'Administrador',
  'ADMIN',
  true,
  NOW()
);
```

### Migrar Usuarios Existentes

Ver script `scripts/migrate-users.ts` (pendiente de crear).

## 📊 Validación Post-Migración

### Checklist de Verificación

- [ ] Todas las migraciones SQL ejecutadas sin errores
- [ ] Usuario admin puede iniciar sesión
- [ ] Variables de entorno configuradas
- [ ] Todas las páginas cargan sin errores
- [ ] CRUD de socios funciona
- [ ] CRUD de productos funciona
- [ ] Creación de ventas funciona
- [ ] Stock se actualiza correctamente
- [ ] Cuenta corriente se actualiza
- [ ] Cultivos se crean con código automático
- [ ] Políticas RLS funcionan correctamente

### Queries de Verificación

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar funciones
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION';

-- Verificar vistas
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public';

-- Verificar secuencias inicializadas
SELECT * FROM secuencias;
```

## 🚨 Problemas Comunes y Soluciones

### Error: "relation does not exist"

**Problema:** No se ejecutaron las migraciones SQL.

**Solución:** Ejecutar `001_initial_schema.sql` en Supabase SQL Editor.

### Error: "new row violates row-level security policy"

**Problema:** RLS habilitado pero sin políticas correctas.

**Solución:** Ejecutar `002_rls_policies.sql`.

### Error: "Could not find the public schema"

**Problema:** Proyecto de Supabase sin schema público.

**Solución:** Verificar que el proyecto esté correctamente inicializado.

### Error de autenticación

**Problema:** Usuario no existe en tabla `usuarios`.

**Solución:** Crear usuario en Supabase Auth Y en tabla usuarios.

## 📝 Notas Importantes

1. **No eliminar Firebase inmediatamente:** Mantener configuración de Firebase hasta confirmar que todo funciona en Supabase.

2. **Backup:** Exportar todos los datos de Firestore antes de la migración.

3. **Testing:** Probar exhaustivamente en ambiente de desarrollo antes de producción.

4. **Rollback Plan:** Tener plan de rollback a Firebase si algo sale mal.

## 🔜 Próximos Pasos

1. Crear script de migración de datos (`scripts/migrate-data.ts`)
2. Ejecutar migración en ambiente de prueba
3. Validar todos los flujos críticos
4. Migrar datos de producción
5. Actualizar código de producción
6. Monitorear logs y errores
7. Desactivar Firebase tras 30 días de operación exitosa

## 📞 Soporte

Si encuentras problemas durante la migración:
- Revisar logs de Supabase: Dashboard → Logs
- Revisar errores de RLS: Dashboard → SQL Editor → Explain
- Consultar documentación: https://supabase.com/docs
