// ============================================================================
// SCRIPT DE IMPORTACIÓN A FIREBASE
// Importa datos_migrados.json a Firebase
// ============================================================================

import { readFileSync } from 'fs';
import { join } from 'path';
import { importService, COLLECTIONS } from '../lib/firebaseService';
import {
  mockInversores,
  mockGastosInversion,
  mockEmpleados,
  mockSocios,
  mockCategoriasProductos,
  mockProductos,
  mockVentas,
  mockItemsVenta,
  mockCategoriasGastos,
  mockGastosFijos,
  mockPagosSueldos,
  mockCosechas,
  mockMovimientosStock,
} from '../lib/mockData';

async function main() {
  console.log('=' .repeat(100));
  console.log('IMPORTACIÓN DE DATOS A FIREBASE');
  console.log('=' .repeat(100));

  try {
    // Opción 1: Importar datos de mockData.ts (datos de ejemplo)
    console.log('\n📦 Importando datos de ejemplo (mockData.ts)...\n');

    await importService.importarLote(COLLECTIONS.INVERSORES, mockInversores);
    await importService.importarLote(COLLECTIONS.GASTOS_INVERSION, mockGastosInversion);
    await importService.importarLote(COLLECTIONS.EMPLEADOS, mockEmpleados);
    await importService.importarLote(COLLECTIONS.SOCIOS, mockSocios);
    await importService.importarLote(COLLECTIONS.CATEGORIAS_PRODUCTOS, mockCategoriasProductos);
    await importService.importarLote(COLLECTIONS.PRODUCTOS, mockProductos);
    await importService.importarLote(COLLECTIONS.CATEGORIAS_GASTOS, mockCategoriasGastos);
    await importService.importarLote(COLLECTIONS.GASTOS, mockGastosFijos);
    await importService.importarLote(COLLECTIONS.VENTAS, mockVentas);
    await importService.importarLote(COLLECTIONS.ITEMS_VENTA, mockItemsVenta);
    await importService.importarLote(COLLECTIONS.PAGOS_SUELDOS, mockPagosSueldos);
    await importService.importarLote(COLLECTIONS.COSECHAS, mockCosechas);
    await importService.importarLote(COLLECTIONS.MOVIMIENTOS_STOCK, mockMovimientosStock);

    console.log('\n✅ IMPORTACIÓN COMPLETADA CON ÉXITO!\n');

    // Opción 2: Si quieren importar el JSON completo migrado
    console.log('\n💡 Para importar los datos completos del Excel:');
    console.log('   1. Lee el archivo datos_migrados.json');
    console.log('   2. Usa importService.importarTodosDatos(datosMigrados)');
    console.log('   3. O descomenta el código de abajo\n');

    /*
    // DESCOMENTAR PARA IMPORTAR DATOS MIGRADOS DEL EXCEL
    const datosPath = join(process.cwd(), 'datos_migrados.json');
    const datosMigrados = JSON.parse(readFileSync(datosPath, 'utf-8'));
    await importService.importarTodosDatos(datosMigrados);
    */

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('🎉 Script completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
