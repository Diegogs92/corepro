// ============================================================================
// FIREBASE SERVICE - CLUB CANNABICO THE GARDEN BOYS
// Servicio completo para todas las colecciones del nuevo modelo de datos
// ============================================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Inversor,
  GastoInversion,
  Socio,
  Empleado,
  CategoriaProducto,
  Producto,
  Venta,
  ItemVenta,
  Pago,
  CategoriaGasto,
  Gasto,
  PagoSueldo,
  MovimientoStock,
  Cosecha,
  MovimientoCaja,
} from './types';

// ============================================================================
// NOMBRES DE COLECCIONES
// ============================================================================

export const COLLECTIONS = {
  INVERSORES: 'inversores',
  GASTOS_INVERSION: 'gastosInversion',
  SOCIOS: 'socios',
  EMPLEADOS: 'empleados',
  CATEGORIAS_PRODUCTOS: 'categoriasProductos',
  PRODUCTOS: 'productos',
  VENTAS: 'ventas',
  ITEMS_VENTA: 'itemsVenta',
  PAGOS: 'pagos',
  CATEGORIAS_GASTOS: 'categoriasGastos',
  GASTOS: 'gastos',
  PAGOS_SUELDOS: 'pagosSueldos',
  MOVIMIENTOS_STOCK: 'movimientosStock',
  COSECHAS: 'cosechas',
  MOVIMIENTOS_CAJA: 'movimientosCaja',
} as const;

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Convierte Date a Timestamp de Firebase
 */
function dateToTimestamp(date: Date | string | null | undefined): Timestamp | null {
  if (!date) return null;
  if (date instanceof Date) return Timestamp.fromDate(date);
  if (typeof date === 'string') return Timestamp.fromDate(new Date(date));
  return null;
}

/**
 * Convierte Timestamp a Date
 */
function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp.toDate) return timestamp.toDate();
  return null;
}

/**
 * Prepara objeto para guardar en Firebase (convierte Dates a Timestamps)
 */
function prepareForFirebase(data: any): any {
  const prepared: any = { ...data };

  Object.keys(prepared).forEach((key) => {
    if (prepared[key] instanceof Date) {
      prepared[key] = dateToTimestamp(prepared[key]);
    } else if (prepared[key] === undefined) {
      delete prepared[key];
    }
  });

  return prepared;
}

/**
 * Convierte documento de Firebase a objeto (Timestamps a Dates)
 */
function fromFirebase<T>(doc: DocumentData): T {
  const data = { ...doc };

  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Timestamp) {
      data[key] = timestampToDate(data[key]);
    }
  });

  return data as T;
}

// ============================================================================
// CLASE BASE GENÉRICA PARA CRUD
// ============================================================================

class FirebaseCollection<T extends { id: string }> {
  constructor(private collectionName: string) {}

  /**
   * Obtener todos los documentos
   */
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db, this.collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...fromFirebase<Omit<T, 'id'>>(doc.data()),
    } as T));
  }

  /**
   * Obtener un documento por ID
   */
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...fromFirebase<Omit<T, 'id'>>(docSnap.data()),
    } as T;
  }

  /**
   * Crear un nuevo documento
   */
  async create(data: Omit<T, 'id'>): Promise<T> {
    const prepared = prepareForFirebase(data);
    const docRef = await addDoc(collection(db, this.collectionName), prepared);
    return { id: docRef.id, ...data } as T;
  }

  /**
   * Actualizar un documento
   */
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const prepared = prepareForFirebase(data);
    await updateDoc(docRef, prepared);
  }

  /**
   * Eliminar un documento
   */
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  /**
   * Buscar con query personalizada
   */
  async query(constraints: QueryConstraint[]): Promise<T[]> {
    return this.getAll(constraints);
  }
}

// ============================================================================
// SERVICIOS POR ENTIDAD
// ============================================================================

export const inversoresService = new FirebaseCollection<Inversor>(COLLECTIONS.INVERSORES);
export const gastosInversionService = new FirebaseCollection<GastoInversion>(COLLECTIONS.GASTOS_INVERSION);
export const sociosService = new FirebaseCollection<Socio>(COLLECTIONS.SOCIOS);
export const empleadosService = new FirebaseCollection<Empleado>(COLLECTIONS.EMPLEADOS);
export const categoriasProductosService = new FirebaseCollection<CategoriaProducto>(COLLECTIONS.CATEGORIAS_PRODUCTOS);
export const productosService = new FirebaseCollection<Producto>(COLLECTIONS.PRODUCTOS);
export const ventasService = new FirebaseCollection<Venta>(COLLECTIONS.VENTAS);
export const itemsVentaService = new FirebaseCollection<ItemVenta>(COLLECTIONS.ITEMS_VENTA);
export const pagosService = new FirebaseCollection<Pago>(COLLECTIONS.PAGOS);
export const categoriasGastosService = new FirebaseCollection<CategoriaGasto>(COLLECTIONS.CATEGORIAS_GASTOS);
export const gastosService = new FirebaseCollection<Gasto>(COLLECTIONS.GASTOS);
export const pagosSueldosService = new FirebaseCollection<PagoSueldo>(COLLECTIONS.PAGOS_SUELDOS);
export const movimientosStockService = new FirebaseCollection<MovimientoStock>(COLLECTIONS.MOVIMIENTOS_STOCK);
export const cosechasService = new FirebaseCollection<Cosecha>(COLLECTIONS.COSECHAS);
export const movimientosCajaService = new FirebaseCollection<MovimientoCaja>(COLLECTIONS.MOVIMIENTOS_CAJA);

// ============================================================================
// SERVICIOS ESPECIALIZADOS CON LÓGICA DE NEGOCIO
// ============================================================================

/**
 * Servicio de Ventas - Con lógica de negocio completa
 */
export const ventasServiceExtended = {
  ...ventasService,

  /**
   * Crear venta completa (venta + items + movimientos stock + caja)
   */
  async createVentaCompleta(
    venta: Omit<Venta, 'id' | 'numero'>,
    items: Omit<ItemVenta, 'id' | 'ventaId'>[]
  ): Promise<{ venta: Venta; items: ItemVenta[] }> {
    // Obtener siguiente número de venta
    const ventas = await ventasService.getAll([orderBy('numero', 'desc'), limit(1)]);
    const siguienteNumero = ventas.length > 0 ? ventas[0].numero + 1 : 1;

    // Crear venta
    const nuevaVenta = await ventasService.create({
      ...venta,
      numero: siguienteNumero,
    });

    // Crear items
    const nuevosItems: ItemVenta[] = [];
    for (const item of items) {
      const nuevoItem = await itemsVentaService.create({
        ...item,
        ventaId: nuevaVenta.id,
      });
      nuevosItems.push(nuevoItem);

      // Actualizar stock del producto
      const producto = await productosService.getById(item.productoId);
      if (producto) {
        const nuevoStock = producto.stockActual - item.cantidad;
        await productosService.update(item.productoId, {
          stockActual: nuevoStock,
        });

        // Crear movimiento de stock
        await movimientosStockService.create({
          productoId: item.productoId,
          fecha: nuevaVenta.fecha,
          tipo: 'EGRESO',
          cantidad: -item.cantidad,
          stockAnterior: producto.stockActual,
          stockNuevo: nuevoStock,
          motivo: `Venta #${nuevaVenta.numero}`,
          referenciaId: nuevaVenta.id,
          referenciaTabla: 'ventas',
        } as Omit<MovimientoStock, 'id'>);
      }
    }

    // Crear movimiento de caja si está pagado
    if (nuevaVenta.estadoPago === 'PAGADO' && nuevaVenta.montoPagado > 0) {
      await movimientosCajaService.create({
        fecha: nuevaVenta.fecha,
        tipo: 'INGRESO',
        categoria: 'VENTA',
        monto: nuevaVenta.montoPagado,
        metodoPago: nuevaVenta.metodoPago || 'EFECTIVO',
        concepto: `Venta #${nuevaVenta.numero}`,
        referenciaId: nuevaVenta.id,
        referenciaTabla: 'ventas',
        saldoAnterior: 0, // Calcular en frontend
        saldoNuevo: 0, // Calcular en frontend
      } as Omit<MovimientoCaja, 'id'>);
    }

    return { venta: nuevaVenta, items: nuevosItems };
  },

  /**
   * Obtener ventas con items
   */
  async getVentasConItems(ventaId: string): Promise<{ venta: Venta; items: ItemVenta[] } | null> {
    const venta = await ventasService.getById(ventaId);
    if (!venta) return null;

    const items = await itemsVentaService.query([where('ventaId', '==', ventaId)]);
    return { venta, items };
  },

  /**
   * Obtener ventas de un socio
   */
  async getVentasPorSocio(socioId: string): Promise<Venta[]> {
    return ventasService.query([
      where('socioId', '==', socioId),
      orderBy('fecha', 'desc'),
    ]);
  },
};

/**
 * Servicio de Productos - Con control de stock
 */
export const productosServiceExtended = {
  ...productosService,

  /**
   * Obtener productos con stock bajo
   */
  async getProductosStockBajo(): Promise<Producto[]> {
    const productos = await productosService.getAll();
    return productos.filter((p) => p.stockActual <= p.stockMinimo);
  },

  /**
   * Obtener historial de movimientos de un producto
   */
  async getHistorialStock(productoId: string): Promise<MovimientoStock[]> {
    return movimientosStockService.query([
      where('productoId', '==', productoId),
      orderBy('fecha', 'desc'),
    ]);
  },

  /**
   * Ajustar stock manualmente
   */
  async ajustarStock(
    productoId: string,
    nuevaCantidad: number,
    motivo: string
  ): Promise<void> {
    const producto = await productosService.getById(productoId);
    if (!producto) throw new Error('Producto no encontrado');

    const diferencia = nuevaCantidad - producto.stockActual;

    await productosService.update(productoId, {
      stockActual: nuevaCantidad,
    });

    await movimientosStockService.create({
      productoId,
      fecha: new Date(),
      tipo: 'AJUSTE',
      cantidad: diferencia,
      stockAnterior: producto.stockActual,
      stockNuevo: nuevaCantidad,
      motivo,
    } as Omit<MovimientoStock, 'id'>);
  },
};

/**
 * Servicio de Socios - Con cuenta corriente
 */
export const sociosServiceExtended = {
  ...sociosService,

  /**
   * Obtener socios activos
   */
  async getSociosActivos(): Promise<Socio[]> {
    return sociosService.query([where('activo', '==', true), orderBy('nombre')]);
  },

  /**
   * Obtener socios con deuda
   */
  async getSociosConDeuda(): Promise<Socio[]> {
    const socios = await sociosService.getAll();
    return socios.filter((s) => s.saldo < 0);
  },

  /**
   * Actualizar saldo de socio
   */
  async actualizarSaldo(socioId: string, monto: number): Promise<void> {
    const socio = await sociosService.getById(socioId);
    if (!socio) throw new Error('Socio no encontrado');

    const nuevoSaldo = socio.saldo + monto;
    await sociosService.update(socioId, { saldo: nuevoSaldo });
  },
};

/**
 * Servicio de Gastos - Con categorización
 */
export const gastosServiceExtended = {
  ...gastosService,

  /**
   * Obtener gastos fijos
   */
  async getGastosFijos(): Promise<Gasto[]> {
    return gastosService.query([where('esRecurrente', '==', true)]);
  },

  /**
   * Obtener gastos variables
   */
  async getGastosVariables(): Promise<Gasto[]> {
    return gastosService.query([where('esRecurrente', '==', false)]);
  },

  /**
   * Obtener gastos por categoría
   */
  async getGastosPorCategoria(categoriaId: string): Promise<Gasto[]> {
    return gastosService.query([
      where('categoriaId', '==', categoriaId),
      orderBy('fecha', 'desc'),
    ]);
  },

  /**
   * Obtener gastos pendientes de pago
   */
  async getGastosPendientes(): Promise<Gasto[]> {
    return gastosService.query([where('pagado', '==', false)]);
  },
};

// ============================================================================
// SERVICIO DE IMPORTACIÓN MASIVA
// ============================================================================

export const importService = {
  /**
   * Importar datos en lote usando batch
   */
  async importarLote<T extends { id: string }>(
    collectionName: string,
    datos: T[]
  ): Promise<void> {
    const batch = writeBatch(db);

    datos.forEach((item) => {
      const { id, ...data } = item;
      const docRef = doc(db, collectionName, id);
      batch.set(docRef, prepareForFirebase(data));
    });

    await batch.commit();
    console.log(`✅ ${datos.length} documentos importados a ${collectionName}`);
  },

  /**
   * Importar todos los datos del JSON migrado
   */
  async importarTodosDatos(datosMigrados: any): Promise<void> {
    console.log('Iniciando importación masiva...');

    // Importar en orden (respetando dependencias)
    if (datosMigrados.inversores) {
      await this.importarLote(COLLECTIONS.INVERSORES, datosMigrados.inversores);
    }

    if (datosMigrados.gastosInversion) {
      await this.importarLote(COLLECTIONS.GASTOS_INVERSION, datosMigrados.gastosInversion);
    }

    if (datosMigrados.socios) {
      await this.importarLote(COLLECTIONS.SOCIOS, datosMigrados.socios);
    }

    if (datosMigrados.ventas) {
      await this.importarLote(COLLECTIONS.VENTAS, datosMigrados.ventas);
    }

    if (datosMigrados.itemsVenta) {
      await this.importarLote(COLLECTIONS.ITEMS_VENTA, datosMigrados.itemsVenta);
    }

    if (datosMigrados.gastosOperativos) {
      await this.importarLote(COLLECTIONS.GASTOS, datosMigrados.gastosOperativos);
    }

    if (datosMigrados.gastosFijos) {
      await this.importarLote(COLLECTIONS.GASTOS, datosMigrados.gastosFijos);
    }

    console.log('✅ Importación completada!');
  },
};
