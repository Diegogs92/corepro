// ============================================================================
// TIPOS DEL NUEVO MODELO DE DATOS - CLUB CANNABICO THE GARDEN BOYS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. INVERSORES Y GASTOS DE INVERSIÓN
// ----------------------------------------------------------------------------

export interface Inversor {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  montoInvertidoUSD: number;
  montoInvertidoPesos: number;
  porcentajeParticipacion: number;
  fechaIngreso: Date;
  activo: boolean;
  notas?: string;
}

export type CategoriaGastoInversion =
  | 'EQUIPAMIENTO'
  | 'CONSTRUCCION'
  | 'INSUMOS_INICIALES'
  | 'LEGAL'
  | 'OTROS';

export interface GastoInversion {
  id: string;
  inversorId: string;
  fecha: Date;
  detalle: string;
  categoria: CategoriaGastoInversion;
  montoUSD: number;
  montoPesos: number;
  precioDolar: number;
  comprobante?: string;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 2. SOCIOS / CLIENTES
// ----------------------------------------------------------------------------

export type TipoSocio =
  | 'SOCIO_PLENO'
  | 'SOCIO_ADHERENTE'
  | 'CLIENTE_FRECUENTE'
  | 'CLIENTE_OCASIONAL';

export interface Socio {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  dni?: string;
  fechaRegistro: Date;
  tipo: TipoSocio;
  activo: boolean;
  saldo: number; // Cuenta corriente (+ a favor del socio, - debe)
  limiteCredito: number;
  notas?: string;
}

export interface MovimientoCuentaCorriente {
  id: string;
  socioId: string;
  fecha: Date;
  tipo: 'CARGO' | 'PAGO';
  concepto: string;
  monto: number;
  saldoAnterior: number;
  saldoNuevo: number;
  referenciaId?: string;
  referenciaTabla?: string;
}

// ----------------------------------------------------------------------------
// 3. EMPLEADOS Y SUELDOS
// ----------------------------------------------------------------------------

export interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  puesto: string;
  sueldoMensual: number;
  fechaIngreso: Date;
  fechaEgreso?: Date;
  activo: boolean;
  email?: string;
  telefono?: string;
  notas?: string;
}

export type MetodoPago =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'MERCADOPAGO'
  | 'DEBITO'
  | 'CREDITO'
  | 'CUENTA_CORRIENTE'
  | 'MIXTO';

export interface PagoSueldo {
  id: string;
  empleadoId: string;
  fecha: Date;
  periodo: string; // "2025-01", "2025-02"
  montoBase: number;
  bonos: number;
  descuentos: number;
  total: number;
  metodoPago: MetodoPago;
  pagado: boolean;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 4. PRODUCTOS Y STOCK
// ----------------------------------------------------------------------------

export type TipoProducto =
  | 'FLOR'
  | 'ESQUEJE'
  | 'KIT'
  | 'SEMILLA'
  | 'INSUMO'
  | 'OTRO';

export interface CategoriaProducto {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: TipoProducto;
  activo: boolean;
}

export type UnidadMedida = 'GRAMOS' | 'UNIDADES' | 'KITS';

export interface Producto {
  id: string;
  categoriaId: string;
  nombre: string;
  variedad?: string; // Para flores: "Gellato", "OG Kush", etc.
  descripcion?: string;
  unidadMedida: UnidadMedida;
  precioBase: number;
  stockMinimo: number;
  stockActual: number;
  activo: boolean;
  imagenUrl?: string;
  thc?: number; // % THC para flores
  cbd?: number; // % CBD para flores
  notas?: string;
}

export type TipoMovimientoStock = 'INGRESO' | 'EGRESO' | 'AJUSTE' | 'COSECHA';

export interface MovimientoStock {
  id: string;
  productoId: string;
  fecha: Date;
  tipo: TipoMovimientoStock;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  referenciaId?: string; // ID de venta, compra, etc.
  referenciaTabla?: string; // Nombre de la tabla de referencia
  lote?: string;
  pesoHumedo?: number; // Para cosechas
  pesoSeco?: number; // Para cosechas
  usuarioId?: string;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 5. VENTAS
// ----------------------------------------------------------------------------

export type EstadoPagoVenta = 'PENDIENTE' | 'PARCIAL' | 'PAGADO';

export interface Venta {
  id: string;
  numero: number; // Número secuencial de venta
  fecha: Date;
  socioId: string;
  vendedorId?: string; // EmpleadoId de quien entregó
  subtotal: number;
  descuento: number;
  total: number;
  estadoPago: EstadoPagoVenta;
  montoPagado: number;
  saldoPendiente: number;
  metodoPago?: MetodoPago;
  entregado: boolean;
  fechaEntrega?: Date;
  notas?: string;
}

export interface ItemVenta {
  id: string;
  ventaId: string;
  productoId: string;
  descripcion: string; // Copia del nombre del producto
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  descuento: number;
  total: number;
}

export interface Pago {
  id: string;
  fecha: Date;
  socioId: string;
  ventaId?: string; // Puede ser pago a cuenta (sin venta específica)
  monto: number;
  metodoPago: MetodoPago;
  referencia?: string; // Número de transferencia, etc.
  concepto: string;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 6. GASTOS OPERATIVOS
// ----------------------------------------------------------------------------

export type TipoGasto = 'FIJO' | 'VARIABLE';

export interface CategoriaGasto {
  id: string;
  nombre: string;
  tipo: TipoGasto;
  descripcion?: string;
  activo: boolean;
}

export type FrecuenciaGasto = 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'ANUAL';

export interface Gasto {
  id: string;
  numero: number; // Número secuencial
  fecha: Date;
  categoriaId: string;
  detalle: string;
  proveedor?: string;
  monto: number;
  metodoPago: MetodoPago;
  pagado: boolean;
  fechaPago?: Date;
  comprobante?: string;
  esRecurrente: boolean;
  frecuencia?: FrecuenciaGasto;
  vencimiento?: Date;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 7. CAJA Y MOVIMIENTOS
// ----------------------------------------------------------------------------

export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO';

export type CategoriaMovimientoCaja =
  | 'VENTA'
  | 'GASTO'
  | 'SUELDO'
  | 'RETIRO'
  | 'APORTE'
  | 'OTRO';

export interface MovimientoCaja {
  id: string;
  fecha: Date;
  tipo: TipoMovimientoCaja;
  categoria: CategoriaMovimientoCaja;
  monto: number;
  metodoPago: MetodoPago;
  concepto: string;
  referenciaId?: string;
  referenciaTabla?: string;
  saldoAnterior: number;
  saldoNuevo: number;
  responsable?: string;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 8. COSECHAS
// ----------------------------------------------------------------------------

export type Sala = 'SALA_1' | 'SALA_2';
export type CalidadCosecha = 'A' | 'B' | 'C';

export interface Cosecha {
  id: string;
  numero: number;
  fecha: Date;
  sala: Sala;
  variedad: string;
  cantidadPlantas: number;
  pesoHumedo: number;
  pesoSeco: number;
  rendimiento: number; // %
  fechaSecado?: Date;
  fechaCurado?: Date;
  calidad: CalidadCosecha;
  lote: string;
  notas?: string;
}

// ----------------------------------------------------------------------------
// 9. REPORTES Y VISTAS
// ----------------------------------------------------------------------------

export interface BalanceGeneral {
  periodo: string;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  ingresosPorVentas: number;
  ingresosPorAportes: number;
  egresosPorGastos: number;
  egresosPorSueldos: number;
  stockValorizado: number;
  cuentasPorCobrar: number;
  cuentasPorPagar: number;
}

export interface EstadoCuentaSocio {
  socioId: string;
  nombreSocio: string;
  saldoActual: number;
  totalCompras: number;
  totalPagos: number;
  ultimaCompra?: Date;
  ultimoPago?: Date;
  movimientos: MovimientoCuentaCorriente[];
}

export interface ReporteStock {
  productoId: string;
  nombreProducto: string;
  variedad?: string;
  stockActual: number;
  stockMinimo: number;
  alerta: boolean;
  valorizado: number;
  ultimoMovimiento?: Date;
}

export interface ReporteVentas {
  periodo: string;
  cantidadVentas: number;
  totalVendido: number;
  promedioVenta: number;
  ventasPorProducto: {
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    total: number;
  }[];
  ventasPorSocio: {
    socioId: string;
    nombreSocio: string;
    cantidadCompras: number;
    total: number;
  }[];
}

export interface ReporteGastos {
  periodo: string;
  totalGastos: number;
  gastosFijos: number;
  gastosVariables: number;
  gastosPorCategoria: {
    categoriaId: string;
    nombreCategoria: string;
    total: number;
  }[];
}

// ----------------------------------------------------------------------------
// 10. UTILIDADES
// ----------------------------------------------------------------------------

export interface Periodo {
  desde: Date;
  hasta: Date;
  label: string;
}

export interface FiltrosReporte {
  periodo?: Periodo;
  socioId?: string;
  productoId?: string;
  categoriaGastoId?: string;
  empleadoId?: string;
}

// ----------------------------------------------------------------------------
// 11. DATOS LEGACY (para migración)
// ----------------------------------------------------------------------------

export interface DatosExcelLegacy {
  inversionGastos: {
    tony: GastoInversion[];
    facu: GastoInversion[];
  };
  stockYVentas: any[]; // Datos sin procesar del Excel
  gastosFijos: Gasto[];
}

// ----------------------------------------------------------------------------
// 12. TIPOS LEGACY (compatibilidad con código existente)
// ----------------------------------------------------------------------------

export type StockStatus = 'critico' | 'bajo' | 'ok';

export interface DashboardStats {
  ingresosMes: number;
  gastosMes: number;
  saldoNeto: number;
  productosStockCritico: number;
}
