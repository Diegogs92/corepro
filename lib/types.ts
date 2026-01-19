export interface Venta {
  id: string;
  fecha: Date;
  concepto: string;
  monto: number;
  medioPago: 'efectivo' | 'transferencia' | 'debito' | 'credito';
  productosAsociados?: { productoId: string; cantidad: number }[];
  createdAt: Date;
}

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  cantidadActual: number;
  stockMinimo: number;
  precioUnitario: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Gasto {
  id: string;
  fecha: Date;
  categoria: 'servicios' | 'suministros' | 'personal' | 'mantenimiento' | 'otros';
  concepto: string;
  monto: number;
  createdAt: Date;
}

export type StockStatus = 'critico' | 'bajo' | 'ok';

export interface DashboardStats {
  ingresosMes: number;
  gastosMes: number;
  saldoNeto: number;
  productosStockCritico: number;
}
