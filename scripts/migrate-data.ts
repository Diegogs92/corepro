/**
 * Script de Migración de Datos: Firebase Firestore → Supabase PostgreSQL
 *
 * Uso:
 *   npx tsx scripts/migrate-data.ts
 *
 * Requisitos:
 *   - Firebase y Supabase configurados en .env.local
 *   - Migraciones SQL ya ejecutadas en Supabase
 *   - npm install tsx (si no está instalado)
 */

import { createClient } from '@supabase/supabase-js'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import type { Database } from '../lib/database.types'

// =====================================================
// CONFIGURACIÓN
// =====================================================

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY! // Necesitas esta key

// Initialize clients
const firebaseApp = initializeApp(FIREBASE_CONFIG)
const firestore = getFirestore(firebaseApp)
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// =====================================================
// HELPERS
// =====================================================

function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

function transformKeys(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(transformKeys)

  const transformed: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key)
    if (value && typeof value === 'object' && 'toDate' in value) {
      // Firebase Timestamp
      transformed[snakeKey] = (value as any).toDate().toISOString()
    } else if (value instanceof Date) {
      transformed[snakeKey] = value.toISOString()
    } else {
      transformed[snakeKey] = value
    }
  }
  return transformed
}

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function migrateCollection(
  firebaseCollectionName: string,
  supabaseTableName: string,
  transform?: (doc: any) => any
) {
  console.log(`\n📦 Migrando ${firebaseCollectionName} → ${supabaseTableName}...`)

  try {
    // Get all documents from Firestore
    const snapshot = await getDocs(collection(firestore, firebaseCollectionName))
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log(`   Encontrados ${documents.length} documentos`)

    if (documents.length === 0) {
      console.log(`   ⏭️  Colección vacía, saltando...`)
      return { success: 0, errors: 0 }
    }

    // Transform and insert into Supabase
    let success = 0
    let errors = 0

    for (const doc of documents) {
      try {
        // Apply custom transform if provided
        let transformed = transform ? transform(doc) : doc

        // Convert camelCase to snake_case
        transformed = transformKeys(transformed)

        // Insert into Supabase
        const { error } = await supabase
          .from(supabaseTableName as any)
          .insert(transformed)

        if (error) {
          console.error(`   ❌ Error insertando ${doc.id}:`, error.message)
          errors++
        } else {
          success++
          if (success % 10 === 0) {
            console.log(`   ✓ ${success} registros migrados...`)
          }
        }
      } catch (err: any) {
        console.error(`   ❌ Error procesando ${doc.id}:`, err.message)
        errors++
      }
    }

    console.log(`   ✅ Completado: ${success} exitosos, ${errors} errores`)
    return { success, errors }
  } catch (err: any) {
    console.error(`   ❌ Error migrando colección:`, err.message)
    return { success: 0, errors: -1 }
  }
}

// =====================================================
// MAIN MIGRATION
// =====================================================

async function main() {
  console.log('🚀 Iniciando migración de datos...\n')
  console.log('Firebase → Supabase')
  console.log('=' .repeat(50))

  const results: Record<string, { success: number; errors: number }> = {}

  // Orden de migración (respetando foreign keys)

  // 1. Tablas independientes
  results.inversores = await migrateCollection('inversores', 'inversores')
  results.categorias_productos = await migrateCollection('categoriasProductos', 'categorias_productos')
  results.categorias_gastos = await migrateCollection('categoriasGastos', 'categorias_gastos')
  results.empleados = await migrateCollection('empleados', 'empleados')
  results.socios = await migrateCollection('socios', 'socios')
  results.geneticas = await migrateCollection('geneticas', 'geneticas')
  results.camas = await migrateCollection('camas', 'camas')

  // 2. Tablas con una dependencia
  results.gastos_inversion = await migrateCollection('gastosInversion', 'gastos_inversion')
  results.productos = await migrateCollection('productos', 'productos')
  results.gastos = await migrateCollection('gastos', 'gastos', (doc) => {
    // Obtener siguiente número de secuencia
    // Por ahora mantener el número existente si existe
    return doc
  })
  results.macetas = await migrateCollection('macetas', 'macetas')
  results.pagos_sueldos = await migrateCollection('pagosSueldos', 'pagos_sueldos')
  results.cosechas = await migrateCollection('cosechas', 'cosechas')

  // 3. Tablas con múltiples dependencias
  results.cultivos = await migrateCollection('cultivos', 'cultivos')
  results.ventas = await migrateCollection('ventas', 'ventas')
  results.pagos = await migrateCollection('pagos', 'pagos')

  // 4. Tablas de relación y logs
  results.items_venta = await migrateCollection('itemsVenta', 'items_venta')
  results.movimientos_stock = await migrateCollection('movimientosStock', 'movimientos_stock')
  results.movimientos_cuenta_corriente = await migrateCollection(
    'movimientosCuentaCorriente',
    'movimientos_cuenta_corriente'
  )
  results.movimientos_caja = await migrateCollection('movimientosCaja', 'movimientos_caja')
  results.registros_cultivo = await migrateCollection('registrosCultivo', 'registros_cultivo', (doc) => {
    // Payload debe ser JSON, asegurar que esté en formato correcto
    if (doc.payload && typeof doc.payload !== 'object') {
      try {
        doc.payload = JSON.parse(doc.payload)
      } catch {
        doc.payload = {}
      }
    }
    return doc
  })

  // 5. Actualizar secuencias
  console.log(`\n📊 Actualizando secuencias...`)

  // Get max numero from ventas
  const { data: maxVenta } = await (supabase
    .from('ventas') as any)
    .select('numero')
    .order('numero', { ascending: false })
    .limit(1)
    .single()

  if (maxVenta) {
    await (supabase
      .from('secuencias') as any)
      .update({ numero: maxVenta.numero })
      .eq('nombre', 'ventas')
    console.log(`   ✓ Secuencia ventas: ${maxVenta.numero}`)
  }

  // Get max numero from gastos
  const { data: maxGasto } = await (supabase
    .from('gastos') as any)
    .select('numero')
    .order('numero', { ascending: false })
    .limit(1)
    .single()

  if (maxGasto) {
    await (supabase
      .from('secuencias') as any)
      .update({ numero: maxGasto.numero })
      .eq('nombre', 'gastos')
    console.log(`   ✓ Secuencia gastos: ${maxGasto.numero}`)
  }

  // Get max numero from cosechas
  const { data: maxCosecha } = await (supabase
    .from('cosechas') as any)
    .select('numero')
    .order('numero', { ascending: false })
    .limit(1)
    .single()

  if (maxCosecha) {
    await (supabase
      .from('secuencias') as any)
      .update({ numero: maxCosecha.numero })
      .eq('nombre', 'cosechas')
    console.log(`   ✓ Secuencia cosechas: ${maxCosecha.numero}`)
  }

  // Resumen final
  console.log('\n' + '='.repeat(50))
  console.log('📈 RESUMEN DE MIGRACIÓN\n')

  let totalSuccess = 0
  let totalErrors = 0

  for (const [table, result] of Object.entries(results)) {
    const status = result.errors === 0 ? '✅' : result.errors === -1 ? '❌' : '⚠️'
    console.log(`${status} ${table.padEnd(30)} ${result.success} exitosos, ${result.errors} errores`)
    totalSuccess += result.success
    totalErrors += result.errors === -1 ? 0 : result.errors
  }

  console.log('\n' + '='.repeat(50))
  console.log(`Total: ${totalSuccess} registros migrados, ${totalErrors} errores`)
  console.log('\n✨ Migración completada!')

  if (totalErrors > 0) {
    console.log('\n⚠️  Revisa los errores arriba y ejecuta nuevamente si es necesario.')
    console.log('   Puedes ejecutar la migración múltiples veces de forma segura.')
  }
}

// =====================================================
// EXECUTE
// =====================================================

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
