# 🚀 Migración a Supabase - TGB

## 📖 Inicio Rápido

### Documentos Principales

Leer en este orden:

1. **[SUPABASE_MIGRATION_SUMMARY.md](./SUPABASE_MIGRATION_SUMMARY.md)** ⭐ START HERE
   - Resumen ejecutivo completo
   - Arquitectura y decisiones técnicas
   - Métricas y estimaciones

2. **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**
   - Guía técnica paso a paso
   - Diferencias Firebase vs Supabase
   - Troubleshooting

3. **[MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)**
   - Checklist de 100+ items
   - Para ejecutar durante la migración
   - Incluye rollback plan

---

## 🎯 Quick Start (Para Desarrolladores)

### 1. Instalar Dependencia

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Variables de Entorno

Copiar `.env.local.new` a `.env.local`:

```bash
cp .env.local.new .env.local
```

O manualmente crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://skpcllqbhljlmpqpkmbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrcGNsbHFiaGxqbG1wcXBrbWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNDU4ODEsImV4cCI6MjA4NDcyMTg4MX0.2-hC3BFKdtTeBeF6UV2xn2Q0N6Vl05Y1V1_VnXYHqrU
```

### 3. Ejecutar Migraciones SQL

Ir a: https://supabase.com/dashboard/project/skpcllqbhljlmpqpkmbn/sql

Ejecutar en orden:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

### 4. Verificar Setup

```bash
npx tsx scripts/verify-setup.ts
```

Deberías ver:
```
✅ TODO CORRECTO! Setup completo y funcionando.
```

### 5. Crear Usuario Admin

En Supabase Dashboard → Authentication → Add User:
- Email: `admin@thegardenboys.local`
- Password: [tu contraseña]

Luego ejecutar SQL:
```sql
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

### 6. Migrar Datos (Opcional en dev)

```bash
npx tsx scripts/migrate-data.ts
```

### 7. Actualizar Código

Ver sección "Actualizar Imports" en [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### 8. Probar

```bash
npm run dev
```

Ir a http://localhost:3000/login y probar con el usuario admin.

---

## 📁 Estructura de Archivos

```
TGB/
├── 📚 Documentación
│   ├── README_SUPABASE.md              ← Este archivo
│   ├── SUPABASE_MIGRATION_SUMMARY.md   ← Leer primero
│   ├── MIGRATION_GUIDE.md              ← Guía técnica
│   └── MIGRATION_CHECKLIST.md          ← Checklist deployment
│
├── 🗄️ Migraciones SQL
│   └── supabase/migrations/
│       ├── 001_initial_schema.sql      ← Esquema completo
│       └── 002_rls_policies.sql        ← Seguridad RLS
│
├── 💻 Código TypeScript
│   └── lib/
│       ├── supabase.ts                 ← Cliente Supabase
│       ├── database.types.ts           ← Tipos generados
│       └── supabaseService.ts          ← Servicios CRUD
│
├── 🔐 Autenticación
│   └── contexts/
│       └── AuthContextSupabase.tsx     ← Auth con Supabase
│
└── 🛠️ Scripts
    └── scripts/
        ├── verify-setup.ts             ← Verificar configuración
        └── migrate-data.ts             ← Migrar datos
```

---

## 🔧 Comandos Útiles

### Desarrollo

```bash
# Verificar setup de Supabase
npx tsx scripts/verify-setup.ts

# Migrar datos de Firebase
npx tsx scripts/migrate-data.ts

# Iniciar dev server
npm run dev

# Build para producción
npm run build
```

### SQL Útiles (Ejecutar en Supabase Dashboard)

```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Contar registros en todas las tablas
SELECT 'inversores' as tabla, COUNT(*) as total FROM inversores
UNION ALL SELECT 'socios', COUNT(*) FROM socios
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'ventas', COUNT(*) FROM ventas;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public';

-- Verificar secuencias
SELECT * FROM secuencias;

-- Ver últimas ventas
SELECT * FROM ventas ORDER BY created_at DESC LIMIT 10;
```

---

## ❓ FAQ

### ¿Qué pasa con Firebase?

Firebase NO se elimina inmediatamente. El código puede funcionar con ambos durante el período de transición. Solo eliminar Firebase después de 30 días exitosos en Supabase.

### ¿Puedo revertir a Firebase?

Sí, el rollback plan está documentado en [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md). Básicamente:
1. Revertir commits de git
2. Restaurar variables de entorno de Firebase
3. Deploy anterior

### ¿Los datos se migran automáticamente?

No. Debes ejecutar `scripts/migrate-data.ts` manualmente. El script es reintentable y seguro.

### ¿Qué pasa con los usuarios?

Los usuarios de Firebase Auth deben recrearse en Supabase Auth. El script de migración NO migra usuarios (por seguridad). Ver sección de usuarios en la guía.

### ¿Funciona en local?

Sí, todo funciona en local. Supabase se conecta vía API, no necesitas PostgreSQL local.

### ¿Cuánto cuesta Supabase?

- **Gratis:** 500MB DB, 1GB bandwidth, 50K API calls/mes
- **Pro ($25/mes):** 8GB DB, 50GB bandwidth, 5M API calls/mes
- Ver: https://supabase.com/pricing

Para este proyecto, el plan gratuito debería ser suficiente inicialmente.

---

## 🆘 Problemas Comunes

### "relation does not exist"

**Solución:** Ejecutar las migraciones SQL en Supabase Dashboard.

### "row-level security policy"

**Solución:** Ejecutar `002_rls_policies.sql` o verificar que estás autenticado.

### "Could not find module '@supabase/supabase-js'"

**Solución:** `npm install @supabase/supabase-js`

### Build falla con errores de tipos

**Solución:** Verificar que `lib/database.types.ts` existe y está bien importado.

---

## 📞 Soporte

- **Documentación Supabase:** https://supabase.com/docs
- **Dashboard del Proyecto:** https://supabase.com/dashboard/project/skpcllqbhljlmpqpkmbn
- **Discord Supabase:** https://discord.supabase.com
- **Stack Overflow:** Tag `supabase`

---

## ✅ Checklist Pre-Deployment

Antes de deploy a producción, verificar:

- [ ] Todas las migraciones SQL ejecutadas
- [ ] Usuario admin creado y funcionando
- [ ] `verify-setup.ts` pasa sin errores
- [ ] Todos los imports actualizados
- [ ] Build exitoso (`npm run build`)
- [ ] Testing funcional completo
- [ ] Datos migrados (si aplica)
- [ ] Variables de entorno en Vercel configuradas
- [ ] Rollback plan revisado y entendido

Ver checklist completo en [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md)

---

**Última actualización:** 2026-01-23
**Versión:** 1.0
**Proyecto:** TGB - The Garden Boys Management System
