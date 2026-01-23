// =====================================================
// Supabase Service Layer
// Replaces lib/firebaseService.ts with Supabase
// Maintains same API for minimal code changes
// =====================================================

import { supabase } from './supabase'
import type { Database } from './database.types'
import type * as Types from './types'

// =====================================================
// HELPER FUNCTIONS - Data Conversion
// =====================================================

// Convert snake_case DB fields to camelCase TypeScript
function dbToApp<T = any>(data: any): T {
  if (!data) return data
  if (Array.isArray(data)) return data.map(dbToApp) as T

  const converted: any = {}
  for (const [key, value] of Object.entries(data)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    converted[camelKey] = value instanceof Date ? value :
                           (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) ?
                           new Date(value) : value
  }
  return converted as T
}

// Convert camelCase TypeScript to snake_case DB
function appToDb(data: any): any {
  if (!data) return data
  if (Array.isArray(data)) return data.map(appToDb)

  const converted: any = {}
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
    converted[snakeKey] = value instanceof Date ? value.toISOString() : value
  }
  return converted
}

// =====================================================
// GENERIC COLLECTION SERVICE
// =====================================================

type TableRow<TTable extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TTable]['Row']

type TableInsert<TTable extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TTable]['Insert']

type TableUpdate<TTable extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TTable]['Update']

export class SupabaseCollection<TApp, TTable extends keyof Database['public']['Tables']> {
  constructor(private tableName: TTable) {}

  async getAll(): Promise<TApp[]> {
    const { data, error } = await supabase
      .from(this.tableName as string)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(dbToApp<TApp>)
  }

  async getById(id: string): Promise<TApp | null> {
    const { data, error } = await supabase
      .from(this.tableName as string)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return dbToApp<TApp>(data)
  }

  async create(item: Partial<TApp>): Promise<TApp> {
    const dbData = appToDb(item)
    const { data, error } = await (supabase
      .from(this.tableName as string)
      .insert(dbData as any) as any)
      .select()
      .single()

    if (error) throw error
    return dbToApp<TApp>(data)
  }

  async update(id: string, item: Partial<TApp>): Promise<void> {
    const dbData = appToDb(item)
    const { error } = await (supabase
      .from(this.tableName as string) as any)
      .update(dbData as any)
      .eq('id', id)

    if (error) throw error
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName as string)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async query(filters: Record<string, any>): Promise<TApp[]> {
    let query = supabase.from(this.tableName as string).select('*')

    for (const [key, value] of Object.entries(filters)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
      query = query.eq(snakeKey, value)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(dbToApp<TApp>)
  }
}

// =====================================================
// SERVICE INSTANCES - Base CRUD for all collections
// =====================================================

export const inversoresService = new SupabaseCollection<Types.Inversor, 'inversores'>('inversores')
export const gastosInversionService = new SupabaseCollection<Types.GastoInversion, 'gastos_inversion'>('gastos_inversion')
export const sociosService = new SupabaseCollection<Types.Socio, 'socios'>('socios')
export const movimientosCuentaCorrienteService = new SupabaseCollection<Types.MovimientoCuentaCorriente, 'movimientos_cuenta_corriente'>('movimientos_cuenta_corriente')
export const pagosService = new SupabaseCollection<Types.Pago, 'pagos'>('pagos')
export const empleadosService = new SupabaseCollection<Types.Empleado, 'empleados'>('empleados')
export const pagosSueldosService = new SupabaseCollection<Types.PagoSueldo, 'pagos_sueldos'>('pagos_sueldos')
export const categoriasProductosService = new SupabaseCollection<Types.CategoriaProducto, 'categorias_productos'>('categorias_productos')
export const productosService = new SupabaseCollection<Types.Producto, 'productos'>('productos')
export const movimientosStockService = new SupabaseCollection<Types.MovimientoStock, 'movimientos_stock'>('movimientos_stock')
export const ventasService = new SupabaseCollection<Types.Venta, 'ventas'>('ventas')
export const itemsVentaService = new SupabaseCollection<Types.ItemVenta, 'items_venta'>('items_venta')
export const categoriasGastosService = new SupabaseCollection<Types.CategoriaGasto, 'categorias_gastos'>('categorias_gastos')
export const gastosService = new SupabaseCollection<Types.Gasto, 'gastos'>('gastos')
export const movimientosCajaService = new SupabaseCollection<Types.MovimientoCaja, 'movimientos_caja'>('movimientos_caja')
export const cosechasService = new SupabaseCollection<Types.Cosecha, 'cosechas'>('cosechas')
export const geneticasService = new SupabaseCollection<Types.Genetica, 'geneticas'>('geneticas')
export const camasService = new SupabaseCollection<Types.Cama, 'camas'>('camas')
export const macetasService = new SupabaseCollection<Types.Maceta, 'macetas'>('macetas')
export const cultivosService = new SupabaseCollection<Types.Cultivo, 'cultivos'>('cultivos')
export const registrosCultivoService = new SupabaseCollection<Types.RegistroCultivo, 'registros_cultivo'>('registros_cultivo')
export const usuariosService = new SupabaseCollection<Types.Usuario, 'usuarios'>('usuarios')

// =====================================================
// EXTENDED SERVICES - Business Logic
// =====================================================

// Get next sequence number (replaces Firestore counter logic)
async function getNextSequence(name: string): Promise<number> {
  const { data, error } = await (supabase.rpc as any)('get_next_sequence', { sequence_name: name })
  if (error) throw error
  return data as number
}

// =====================================================
// CULTIVOS SERVICE EXTENDED
// =====================================================

export const cultivosServiceExtended = {
  ...cultivosService,

  async createCultivoConCodigo(cultivo: Omit<Types.Cultivo, 'id'>): Promise<Types.Cultivo> {
    // El trigger en PostgreSQL genera el código automáticamente
    return cultivosService.create(cultivo)
  },

  async getCultivosActivos(): Promise<Types.Cultivo[]> {
    const { data, error } = await supabase
      .from('cultivos')
      .select('*')
      .eq('estado', 'ACTIVO')
      .is('deleted_at', null)

    if (error) throw error
    return (data || []).map(dbToApp<Types.Cultivo>)
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await (supabase
      .from('cultivos') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }
}

// =====================================================
// SOCIOS SERVICE EXTENDED
// =====================================================

export const sociosServiceExtended = {
  ...sociosService,

  async getSociosActivos(): Promise<Types.Socio[]> {
    return sociosService.query({ activo: true })
  },

  async getSociosConDeuda(): Promise<Types.Socio[]> {
    const { data, error } = await supabase
      .from('socios_con_deuda')
      .select('*')

    if (error) throw error
    return (data || []).map(dbToApp<Types.Socio>)
  },

  async actualizarSaldo(socioId: string, nuevoSaldo: number): Promise<void> {
    await sociosService.update(socioId, { saldo: nuevoSaldo } as Partial<Types.Socio>)
  }
}

// =====================================================
// PRODUCTOS SERVICE EXTENDED
// =====================================================

export const productosServiceExtended = {
  ...productosService,

  async getProductosStockBajo(): Promise<Types.Producto[]> {
    const { data, error} = await supabase
      .from('productos_stock_bajo')
      .select('*')

    if (error) throw error
    return (data || []).map(dbToApp<Types.Producto>)
  },

  async getHistorialStock(productoId: string): Promise<Types.MovimientoStock[]> {
    const { data, error } = await supabase
      .from('movimientos_stock')
      .select('*')
      .eq('producto_id', productoId)
      .order('fecha', { ascending: false })

    if (error) throw error
    return (data || []).map(dbToApp<Types.MovimientoStock>)
  },

  async ajustarStock(
    productoId: string,
    cantidad: number,
    motivo: string,
    usuarioId?: string
  ): Promise<void> {
    // Get current product
    const producto = await productosService.getById(productoId)
    if (!producto) throw new Error('Producto no encontrado')

    const stockAnterior = producto.stockActual
    const stockNuevo = stockAnterior + cantidad

    // Update product stock
    await productosService.update(productoId, {
      stockActual: stockNuevo
    } as Partial<Types.Producto>)

    // Log movement
    await movimientosStockService.create({
      productoId,
      tipo: cantidad > 0 ? 'INGRESO' : 'AJUSTE',
      cantidad: Math.abs(cantidad),
      stockAnterior,
      stockNuevo,
      motivo,
      usuarioId,
      fecha: new Date()
    } as Partial<Types.MovimientoStock>)
  }
}

// =====================================================
// GASTOS SERVICE EXTENDED
// =====================================================

export const gastosServiceExtended = {
  ...gastosService,

  async getGastosFijos(): Promise<Types.Gasto[]> {
    const { data, error } = await supabase
      .from('gastos')
      .select('*, categorias_gastos!inner(*)')
      .eq('categorias_gastos.tipo', 'FIJO')

    if (error) throw error
    return (data || []).map(dbToApp<Types.Gasto>)
  },

  async getGastosVariables(): Promise<Types.Gasto[]> {
    const { data, error } = await supabase
      .from('gastos')
      .select('*, categorias_gastos!inner(*)')
      .eq('categorias_gastos.tipo', 'VARIABLE')

    if (error) throw error
    return (data || []).map(dbToApp<Types.Gasto>)
  },

  async getGastosPorCategoria(categoriaId: string): Promise<Types.Gasto[]> {
    return gastosService.query({ categoriaId })
  },

  async getGastosPendientes(): Promise<Types.Gasto[]> {
    return gastosService.query({ pagado: false })
  }
}

// =====================================================
// VENTAS SERVICE EXTENDED - Complex Transactions
// =====================================================

export interface VentaCompleta {
  venta: Omit<Types.Venta, 'id' | 'numero'>
  items: Omit<Types.ItemVenta, 'id' | 'ventaId'>[]
}

export const ventasServiceExtended = {
  ...ventasService,

  async createVentaCompleta(ventaData: VentaCompleta): Promise<Types.Venta> {
    // Get next venta number
    const numero = await getNextSequence('ventas')

    // Start transaction using Supabase RPC or manual handling
    const { venta, items } = ventaData

    // 1. Create venta
    const ventaCreada = await ventasService.create({
      ...venta,
      numero,
      fecha: venta.fecha || new Date()
    } as Partial<Types.Venta>)

    try {
      // 2. Create items and update stock
      for (const item of items) {
        // Create item
        await itemsVentaService.create({
          ...item,
          ventaId: ventaCreada.id
        } as Partial<Types.ItemVenta>)

        // Update product stock
        const producto = await productosService.getById(item.productoId)
        if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`)

        const stockAnterior = producto.stockActual
        const stockNuevo = stockAnterior - item.cantidad

        if (stockNuevo < 0) {
          throw new Error(`Stock insuficiente para ${producto.nombre}`)
        }

        await productosService.update(item.productoId, {
          stockActual: stockNuevo
        } as Partial<Types.Producto>)

        // Log stock movement
        await movimientosStockService.create({
          productoId: item.productoId,
          tipo: 'EGRESO',
          cantidad: item.cantidad,
          stockAnterior,
          stockNuevo,
          motivo: `Venta #${numero}`,
          referenciaId: ventaCreada.id,
          referenciaTabla: 'ventas',
          fecha: new Date()
        } as Partial<Types.MovimientoStock>)
      }

      // 3. If payment made, create cash movement
      if (venta.montoPagado > 0 && venta.metodoPago) {
        // Get current cash balance (simplified - should get from actual balance)
        const saldoAnterior = 0 // TODO: implement cash balance tracking
        const saldoNuevo = saldoAnterior + venta.montoPagado

        await movimientosCajaService.create({
          tipo: 'INGRESO',
          categoria: 'VENTA',
          monto: venta.montoPagado,
          metodoPago: venta.metodoPago,
          concepto: `Venta #${numero}`,
          referenciaId: ventaCreada.id,
          referenciaTabla: 'ventas',
          saldoAnterior,
          saldoNuevo,
          fecha: new Date()
        } as Partial<Types.MovimientoCaja>)
      }

      // 4. Update socio balance if cuenta corriente
      if (venta.saldoPendiente > 0) {
        const socio = await sociosService.getById(venta.socioId)
        if (!socio) throw new Error('Socio no encontrado')

        const saldoAnterior = socio.saldo
        const saldoNuevo = saldoAnterior - venta.saldoPendiente

        await sociosService.update(venta.socioId, {
          saldo: saldoNuevo
        } as Partial<Types.Socio>)

        // Log cuenta corriente movement
        await movimientosCuentaCorrienteService.create({
          socioId: venta.socioId,
          tipo: 'CARGO',
          concepto: `Venta #${numero}`,
          monto: venta.saldoPendiente,
          saldoAnterior,
          saldoNuevo,
          referenciaId: ventaCreada.id,
          referenciaTabla: 'ventas',
          fecha: new Date()
        } as Partial<Types.MovimientoCuentaCorriente>)
      }

      return ventaCreada
    } catch (error) {
      // Rollback: delete created venta
      await ventasService.delete(ventaCreada.id)
      throw error
    }
  },

  async getVentasConItems(): Promise<(Types.Venta & { items: Types.ItemVenta[] })[]> {
    const { data, error } = await (supabase
      .from('ventas') as any)
      .select('*, items_venta(*)')
      .order('fecha', { ascending: false })

    if (error) throw error

    return (data || []).map((venta: any) => ({
      ...dbToApp<Types.Venta>(venta),
      items: (venta.items_venta || []).map(dbToApp<Types.ItemVenta>)
    }))
  },

  async getVentasPorSocio(socioId: string): Promise<Types.Venta[]> {
    return ventasService.query({ socioId })
  },

  async updateVentaCompleta(
    ventaId: string,
    ventaData: Partial<Types.Venta>,
    items: Omit<Types.ItemVenta, 'id' | 'ventaId'>[]
  ): Promise<void> {
    await ventasService.update(ventaId, ventaData)
    // @ts-ignore
    const { error } = await supabase.from('items_venta').delete().eq('venta_id', ventaId)
    if (error) throw error
    for (const item of items) {
      await itemsVentaService.create({ ...item, ventaId } as Partial<Types.ItemVenta>)
    }
  },

  async deleteVentaCompleta(ventaId: string): Promise<void> {
    await ventasService.delete(ventaId)
  }
}

// =====================================================
// EXPORT ALL SERVICES
// =====================================================

export default {
  // Base services
  inversores: inversoresService,
  gastosInversion: gastosInversionService,
  socios: sociosService,
  movimientosCuentaCorriente: movimientosCuentaCorrienteService,
  pagos: pagosService,
  empleados: empleadosService,
  pagosSueldos: pagosSueldosService,
  categoriasProductos: categoriasProductosService,
  productos: productosService,
  movimientosStock: movimientosStockService,
  ventas: ventasService,
  itemsVenta: itemsVentaService,
  categoriasGastos: categoriasGastosService,
  gastos: gastosService,
  movimientosCaja: movimientosCajaService,
  cosechas: cosechasService,
  geneticas: geneticasService,
  camas: camasService,
  macetas: macetasService,
  cultivos: cultivosService,
  registrosCultivo: registrosCultivoService,
  usuarios: usuariosService,

  // Extended services
  cultivosExtended: cultivosServiceExtended,
  sociosExtended: sociosServiceExtended,
  productosExtended: productosServiceExtended,
  gastosExtended: gastosServiceExtended,
  ventasExtended: ventasServiceExtended
}
