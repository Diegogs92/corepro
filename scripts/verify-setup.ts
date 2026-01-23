/**
 * Script de Verificación de Setup de Supabase
 *
 * Verifica que:
 * - Conexión a Supabase funciona
 * - Todas las tablas existen
 * - RLS está habilitado
 * - Funciones existen
 * - Vistas existen
 *
 * Uso:
 *   npx tsx scripts/verify-setup.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.log('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const EXPECTED_TABLES = [
  'inversores',
  'gastos_inversion',
  'socios',
  'movimientos_cuenta_corriente',
  'pagos',
  'empleados',
  'pagos_sueldos',
  'categorias_productos',
  'productos',
  'movimientos_stock',
  'ventas',
  'items_venta',
  'categorias_gastos',
  'gastos',
  'movimientos_caja',
  'cosechas',
  'geneticas',
  'camas',
  'macetas',
  'cultivos',
  'registros_cultivo',
  'usuarios',
  'secuencias'
]

const EXPECTED_VIEWS = [
  'socios_con_deuda',
  'productos_stock_bajo',
  'cultivos_activos'
]

async function main() {
  console.log('🔍 Verificando setup de Supabase...\n')
  console.log('URL:', SUPABASE_URL)
  console.log('=' .repeat(60))

  let allGood = true

  // 1. Test connection
  console.log('\n📡 1. Probando conexión...')
  try {
    const { error } = await supabase.from('secuencias').select('count', { count: 'exact', head: true })
    if (error && error.code === '42P01') {
      console.log('   ⚠️  Tablas no encontradas - necesitas ejecutar las migraciones SQL')
      allGood = false
    } else if (error) {
      console.log('   ❌ Error de conexión:', error.message)
      allGood = false
    } else {
      console.log('   ✅ Conexión exitosa')
    }
  } catch (err: any) {
    console.log('   ❌ Error:', err.message)
    allGood = false
  }

  // 2. Check tables
  console.log('\n📊 2. Verificando tablas...')
  let tablesFound = 0
  for (const table of EXPECTED_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })

      if (error && error.code === '42P01') {
        console.log(`   ❌ ${table} - NO EXISTE`)
        allGood = false
      } else if (error) {
        console.log(`   ⚠️  ${table} - Error: ${error.message}`)
        allGood = false
      } else {
        tablesFound++
      }
    } catch (err: any) {
      console.log(`   ❌ ${table} - Error: ${err.message}`)
      allGood = false
    }
  }
  console.log(`   ✅ ${tablesFound}/${EXPECTED_TABLES.length} tablas encontradas`)

  // 3. Check views
  console.log('\n👁️  3. Verificando vistas...')
  let viewsFound = 0
  for (const view of EXPECTED_VIEWS) {
    try {
      const { error } = await supabase
        .from(view)
        .select('count', { count: 'exact', head: true })

      if (error && error.code === '42P01') {
        console.log(`   ❌ ${view} - NO EXISTE`)
        allGood = false
      } else if (error) {
        console.log(`   ⚠️  ${view} - Error: ${error.message}`)
      } else {
        viewsFound++
      }
    } catch (err: any) {
      console.log(`   ❌ ${view} - Error: ${err.message}`)
    }
  }
  console.log(`   ✅ ${viewsFound}/${EXPECTED_VIEWS.length} vistas encontradas`)

  // 4. Check RPC functions
  console.log('\n⚙️  4. Verificando funciones RPC...')
  try {
    const { data, error } = await supabase.rpc('get_next_sequence', { sequence_name: 'ventas' })
    if (error) {
      console.log('   ❌ get_next_sequence() - Error:', error.message)
      allGood = false
    } else {
      console.log('   ✅ get_next_sequence() funciona')
    }
  } catch (err: any) {
    console.log('   ❌ get_next_sequence() - Error:', err.message)
    allGood = false
  }

  // 5. Check secuencias table
  console.log('\n🔢 5. Verificando secuencias inicializadas...')
  try {
    const { data, error } = await supabase
      .from('secuencias')
      .select('*')

    if (error) {
      console.log('   ❌ Error:', error.message)
      allGood = false
    } else if (!data || data.length === 0) {
      console.log('   ⚠️  Tabla secuencias vacía - deberías tener ventas, gastos, cosechas')
      allGood = false
    } else {
      console.log('   ✅ Secuencias encontradas:')
      data.forEach((seq: any) => {
        console.log(`      - ${seq.nombre}: ${seq.numero}`)
      })
    }
  } catch (err: any) {
    console.log('   ❌ Error:', err.message)
    allGood = false
  }

  // 6. Check RLS
  console.log('\n🔒 6. Verificando RLS (sin autenticar)...')
  try {
    // Intentar leer como usuario no autenticado
    const { data, error } = await supabase.from('socios').select('*').limit(1)

    if (error && (error.code === 'PGRST301' || error.message.includes('row-level security'))) {
      console.log('   ✅ RLS bloqueando correctamente usuarios no autenticados')
    } else if (error) {
      console.log('   ⚠️  Error inesperado:', error.message)
    } else if (data && data.length > 0) {
      console.log('   ❌ RLS NO está bloqueando - esto es un problema de seguridad!')
      allGood = false
    } else {
      console.log('   ✅ RLS configurado correctamente')
    }
  } catch (err: any) {
    console.log('   ⚠️  Error:', err.message)
  }

  // Final summary
  console.log('\n' + '='.repeat(60))
  if (allGood) {
    console.log('✅ TODO CORRECTO! Setup completo y funcionando.\n')
    console.log('Próximos pasos:')
    console.log('1. Crear usuario admin en Supabase Dashboard')
    console.log('2. Actualizar imports en el código')
    console.log('3. Ejecutar migrate-data.ts para migrar datos')
  } else {
    console.log('❌ HAY PROBLEMAS - revisar arriba.\n')
    console.log('Pasos para resolver:')
    console.log('1. Ejecutar supabase/migrations/001_initial_schema.sql')
    console.log('2. Ejecutar supabase/migrations/002_rls_policies.sql')
    console.log('3. Ejecutar este script nuevamente')
  }
  console.log()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
