# ✅ Checklist de Migración Firebase → Supabase

## 📦 Preparación (Antes de Comenzar)

- [ ] Backup completo de Firestore exportado
- [ ] Proyecto Supabase creado y configurado
- [ ] Variables de entorno documentadas
- [ ] Equipo notificado del mantenimiento

## 🗄️ Database Setup

### Ejecutar Migraciones SQL

- [ ] Conectado a Supabase Dashboard
- [ ] Ejecutado `001_initial_schema.sql` sin errores
- [ ] Ejecutado `002_rls_policies.sql` sin errores
- [ ] Verificadas 18 tablas creadas
- [ ] Verificados índices creados
- [ ] Verificadas funciones SQL creadas
- [ ] Verificadas vistas creadas
- [ ] Verificada tabla de secuencias inicializada

### Validación de Schema

```sql
-- Ejecutar para validar
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Debería retornar 22 (18 tablas + 4 tablas del sistema)

SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public';
-- Debería retornar 4 (socios_con_deuda, productos_stock_bajo, ventas_resumen, cultivos_activos)
```

- [ ] 18+ tablas existentes
- [ ] 4 vistas creadas
- [ ] RLS habilitado en todas las tablas
- [ ] Funciones y triggers funcionando

## 🔐 Autenticación

### Setup Inicial

- [ ] Usuario admin creado en Supabase Auth
  - Email: `admin@thegardenboys.local`
  - Password: [configurado]
- [ ] Usuario admin insertado en tabla `usuarios`
- [ ] Login funciona con usuario admin
- [ ] Rol ADMIN asignado correctamente

### Validación

```sql
-- Verificar usuario admin
SELECT * FROM usuarios WHERE username = 'admin';
```

- [ ] Usuario existe en tabla usuarios
- [ ] Rol es 'ADMIN'
- [ ] activo = true

## ⚙️ Configuración del Proyecto

### Variables de Entorno

- [ ] Archivo `.env.local` actualizado con:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://skpcllqbhljlmpqpkmbn.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_anon_key]
  ```
- [ ] Variables antiguas de Firebase comentadas (no eliminadas aún)
- [ ] Archivo `.env.local.example` actualizado

### Dependencias

- [ ] `@supabase/supabase-js` instalado
  ```bash
  npm install @supabase/supabase-js
  ```
- [ ] Sin errores de compilación TypeScript
- [ ] `npm run build` exitoso

## 📝 Código

### Archivos Nuevos Creados

- [ ] `lib/supabase.ts` - Cliente Supabase
- [ ] `lib/database.types.ts` - Tipos TypeScript
- [ ] `lib/supabaseService.ts` - Servicios CRUD
- [ ] `contexts/AuthContextSupabase.tsx` - Auth con Supabase
- [ ] `supabase/migrations/001_initial_schema.sql`
- [ ] `supabase/migrations/002_rls_policies.sql`
- [ ] `scripts/migrate-data.ts` - Script de migración

### Actualizar Imports

**⚠️ CRÍTICO: Actualizar imports en todos los archivos**

#### Layout Principal
- [ ] `app/layout.tsx`
  - Cambiar: `import { AuthProvider } from '@/contexts/AuthContext'`
  - Por: `import { AuthProvider } from '@/contexts/AuthContextSupabase'`

#### Dashboard Layout
- [ ] `app/(dashboard)/layout.tsx`
  - Cambiar import de AuthContext

#### Páginas del Dashboard

- [ ] `app/(dashboard)/dashboard/page.tsx`
  - Actualizar imports de servicios

- [ ] `app/(dashboard)/socios/page.tsx`
  - Cambiar: `import { sociosService, ... } from '@/lib/firebaseService'`
  - Por: `import { sociosService, ... } from '@/lib/supabaseService'`

- [ ] `app/(dashboard)/ventas/page.tsx`
  - Actualizar imports de servicios
  - Usar `ventasServiceExtended.createVentaCompleta`

- [ ] `app/(dashboard)/productos/page.tsx`
  - Actualizar imports de servicios

- [ ] `app/(dashboard)/stock/page.tsx`
  - Actualizar imports de servicios
  - Usar `productosServiceExtended`

- [ ] `app/(dashboard)/gastos/page.tsx`
  - Actualizar imports de servicios

- [ ] `app/(dashboard)/usuarios/page.tsx`
  - Actualizar imports de servicios

- [ ] `app/(dashboard)/cultivos/page.tsx`
  - Actualizar imports de servicios
  - Usar `cultivosServiceExtended.createCultivoConCodigo`

### Verificar Compilación

```bash
npm run build
```

- [ ] Build exitoso sin errores
- [ ] Sin warnings críticos de TypeScript
- [ ] Todas las rutas generadas correctamente

## 📊 Migración de Datos

### Preparación

- [ ] Script `migrate-data.ts` revisado
- [ ] Service role key de Supabase obtenida
- [ ] Variable `SUPABASE_SERVICE_ROLE_KEY` configurada

### Ejecución

```bash
npx tsx scripts/migrate-data.ts
```

- [ ] Script ejecutado sin errores fatales
- [ ] Inversores migrados
- [ ] Socios migrados
- [ ] Empleados migrados
- [ ] Categorías de productos migradas
- [ ] Productos migrados
- [ ] Categorías de gastos migradas
- [ ] Gastos migrados
- [ ] Ventas migradas
- [ ] Items de venta migrados
- [ ] Movimientos de stock migrados
- [ ] Movimientos de cuenta corriente migrados
- [ ] Movimientos de caja migrados
- [ ] Cultivos migrados
- [ ] Registros de cultivo migrados
- [ ] Genéticas migradas
- [ ] Camas y macetas migradas
- [ ] Cosechas migradas
- [ ] Secuencias actualizadas

### Validación de Datos

```sql
-- Contar registros migrados
SELECT 'inversores' as tabla, COUNT(*) as total FROM inversores
UNION ALL
SELECT 'socios', COUNT(*) FROM socios
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'ventas', COUNT(*) FROM ventas
UNION ALL
SELECT 'cultivos', COUNT(*) FROM cultivos;
```

- [ ] Conteos coinciden con Firebase
- [ ] Datos críticos verificados manualmente
- [ ] Fechas convertidas correctamente
- [ ] Relaciones (FKs) íntegras

## 🧪 Testing Funcional

### Autenticación

- [ ] Login con usuario admin funciona
- [ ] Logout funciona
- [ ] Redirección a login cuando no autenticado
- [ ] Redirección a dashboard cuando autenticado

### CRUD Socios

- [ ] Listar socios
- [ ] Crear nuevo socio
- [ ] Editar socio existente
- [ ] Ver saldo correcto
- [ ] Filtros funcionan

### CRUD Productos

- [ ] Listar productos
- [ ] Crear nuevo producto
- [ ] Editar producto
- [ ] Stock se muestra correctamente
- [ ] Alertas de stock bajo funcionan

### Ventas

- [ ] Crear venta simple
- [ ] Crear venta con múltiples items
- [ ] Stock se descuenta automáticamente
- [ ] Cuenta corriente se actualiza
- [ ] Número de venta auto-incrementa
- [ ] Estado de pago se calcula correctamente

### Cultivos

- [ ] Crear cultivo
- [ ] Código se genera automáticamente (C0001, C0002...)
- [ ] Soft delete funciona
- [ ] Registros de cultivo se crean

### Dashboard

- [ ] Estadísticas se calculan correctamente
- [ ] Gráficas se renderizan
- [ ] Datos en tiempo real (después de crear/editar)

## 🔒 Seguridad (RLS)

### Políticas Básicas

- [ ] Usuario no autenticado no puede leer datos
- [ ] Usuario autenticado puede leer todas las tablas
- [ ] Usuario ADMIN puede modificar inversores
- [ ] Usuario normal NO puede modificar inversores
- [ ] Movimientos de stock son solo INSERT
- [ ] Movimientos de caja son solo INSERT

### Testing Manual

```sql
-- Como usuario autenticado
SELECT * FROM socios; -- ✅ Debería funcionar

-- Como anónimo (cerrar sesión)
SELECT * FROM socios; -- ❌ Debería fallar
```

- [ ] Políticas RLS aplicadas correctamente
- [ ] Sin bypass de seguridad

## 📱 UX/UI

- [ ] Todas las páginas cargan sin errores
- [ ] Sin errores en consola del navegador
- [ ] Tiempos de carga aceptables
- [ ] Modales se abren/cierran correctamente
- [ ] Formularios validan correctamente
- [ ] Mensajes de éxito/error se muestran

## 🚀 Deployment

### Pre-deployment

- [ ] Todas las pruebas pasadas
- [ ] Código commiteado a git
- [ ] Tag de versión creado
- [ ] Changelog actualizado

### Variables de Producción

- [ ] Variables de Supabase configuradas en Vercel
- [ ] Variables antiguas de Firebase eliminadas
- [ ] Build de producción exitoso

### Post-deployment

- [ ] Aplicación en producción funciona
- [ ] Login en producción funciona
- [ ] Datos visibles en producción
- [ ] Sin errores en logs de Vercel
- [ ] Sin errores en logs de Supabase

## 📊 Monitoreo (Primeras 24h)

- [ ] Revisar logs de Supabase cada 2 horas
- [ ] Revisar logs de Vercel cada 2 horas
- [ ] Verificar queries lentas en Supabase Dashboard
- [ ] Verificar uso de recursos
- [ ] Feedback de usuarios recopilado

## 🗑️ Limpieza (Después de 30 días exitosos)

- [ ] Exportar backup final de Firebase
- [ ] Eliminar dependencias de Firebase
  ```bash
  npm uninstall firebase
  ```
- [ ] Eliminar archivos deprecated:
  - `lib/firebase.ts`
  - `lib/firebaseService.ts`
  - `contexts/AuthContext.tsx` (original)
- [ ] Renombrar `AuthContextSupabase.tsx` → `AuthContext.tsx`
- [ ] Actualizar imports tras renombrar
- [ ] Eliminar proyecto de Firebase (opcional)
- [ ] Actualizar README con nueva arquitectura

## 📚 Documentación

- [ ] README actualizado con setup de Supabase
- [ ] Diagrama de arquitectura actualizado
- [ ] Documentación de API actualizada
- [ ] Onboarding de nuevos desarrolladores actualizado

## ✅ Sign-off

- [ ] Tech Lead aprueba migración
- [ ] QA completo realizado
- [ ] Cliente/Stakeholder notificado
- [ ] Documentación entregada
- [ ] Migración declarada exitosa

---

## 🆘 Rollback Plan (Si algo sale mal)

### Paso 1: Detectar Problema Crítico
- Pérdida de datos
- Funcionalidad crítica rota
- Performance inaceptable

### Paso 2: Rollback de Código
```bash
git revert [commit-hash]
git push origin main
```

### Paso 3: Restaurar Variables de Firebase
- Reactivar variables de Firebase en Vercel
- Eliminar variables de Supabase

### Paso 4: Verificar Funcionamiento
- Login funciona con Firebase
- Datos visibles desde Firestore
- Todas las funciones críticas operativas

### Paso 5: Post-mortem
- Documentar causa del rollback
- Planear correcciones
- Programar nueva fecha de migración

---

**Fecha de inicio:** _____________

**Fecha de completado:** _____________

**Responsable:** _____________

**Aprobado por:** _____________
