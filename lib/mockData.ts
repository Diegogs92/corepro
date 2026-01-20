// ============================================================================
// DATOS DE EJEMPLO - CLUB CANNABICO THE GARDEN BOYS
// Basado en el análisis del Excel "Sheets actual 19-01-26.xlsx"
// ============================================================================

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
  Usuario,
} from './types';

// ============================================================================
// 1. INVERSORES
// ============================================================================

export const mockInversores: Inversor[] = [
  {
    id: 'inv-facu',
    nombre: 'Facu',
    email: 'facu@thegardenboys.com',
    montoInvertidoUSD: 22701.69688,
    montoInvertidoPesos: 20465181.68,
    porcentajeParticipacion: 58.0,
    fechaIngreso: new Date(2023, 10, 1), // Nov 2023
    activo: true,
    notas: 'Socio fundador',
  },
  {
    id: 'inv-tony',
    nombre: 'Tony',
    email: 'tony@thegardenboys.com',
    montoInvertidoUSD: 16425.35534,
    montoInvertidoPesos: 18336373.86,
    porcentajeParticipacion: 42.0,
    fechaIngreso: new Date(2023, 10, 1), // Nov 2023
    activo: true,
    notas: 'Socio fundador',
  },
];

// ============================================================================
// 2. GASTOS DE INVERSIÓN (Ejemplos del Excel)
// ============================================================================

export const mockGastosInversion: GastoInversion[] = [
  {
    id: 'gi-001',
    inversorId: 'inv-tony',
    fecha: new Date(2023, 10, 7),
    detalle: 'AIRE ACONDICIONADO',
    categoria: 'EQUIPAMIENTO',
    montoUSD: 505.62,
    montoPesos: 450000,
    precioDolar: 890,
  },
  {
    id: 'gi-002',
    inversorId: 'inv-facu',
    fecha: new Date(2023, 10, 10),
    detalle: 'COMPRA HIERROS',
    categoria: 'CONSTRUCCION',
    montoUSD: 1119.79,
    montoPesos: 1075000,
    precioDolar: 960,
  },
  {
    id: 'gi-003',
    inversorId: 'inv-tony',
    fecha: new Date(2023, 10, 15),
    detalle: 'EXTRACTORES',
    categoria: 'EQUIPAMIENTO',
    montoUSD: 359.79,
    montoPesos: 349000,
    precioDolar: 970,
  },
  {
    id: 'gi-004',
    inversorId: 'inv-facu',
    fecha: new Date(2023, 10, 10),
    detalle: 'ALQUILER OCTUBRE',
    categoria: 'OTROS',
    montoUSD: 187.5,
    montoPesos: 180000,
    precioDolar: 960,
  },
];

// ============================================================================
// 3. EMPLEADOS
// ============================================================================

export const mockEmpleados: Empleado[] = [
  {
    id: 'emp-tino',
    nombre: 'Tino',
    apellido: '',
    puesto: 'Encargado General',
    sueldoMensual: 1000000,
    fechaIngreso: new Date(2024, 0, 1),
    activo: true,
    telefono: '',
  },
  {
    id: 'emp-matias',
    nombre: 'Matias',
    apellido: '',
    puesto: 'Cultivador',
    sueldoMensual: 750000,
    fechaIngreso: new Date(2024, 5, 1),
    activo: true,
  },
  {
    id: 'emp-bianca',
    nombre: 'Bianca',
    apellido: '',
    puesto: 'Administración',
    sueldoMensual: 500000,
    fechaIngreso: new Date(2024, 5, 1),
    activo: true,
  },
  {
    id: 'emp-victor',
    nombre: 'Victor',
    apellido: '',
    puesto: 'Mantenimiento',
    sueldoMensual: 1350000,
    fechaIngreso: new Date(2024, 0, 1),
    activo: true,
  },
];

// ============================================================================
// 4. SOCIOS/CLIENTES (Ejemplos del Excel)
// ============================================================================

export const mockSocios: Socio[] = [
  {
    id: 'socio-001',
    nombre: 'Juanchy',
    tipo: 'CLIENTE_FRECUENTE',
    fechaRegistro: new Date(2024, 8, 1),
    activo: true,
    saldo: 0,
    limiteCredito: 50000,
  },
  {
    id: 'socio-002',
    nombre: 'Gaston',
    tipo: 'CLIENTE_FRECUENTE',
    fechaRegistro: new Date(2024, 8, 1),
    activo: true,
    saldo: 0,
    limiteCredito: 30000,
  },
  {
    id: 'socio-003',
    nombre: 'Bacho',
    tipo: 'CLIENTE_FRECUENTE',
    fechaRegistro: new Date(2024, 8, 1),
    activo: true,
    saldo: 0,
    limiteCredito: 30000,
  },
  {
    id: 'socio-004',
    nombre: 'Colo',
    tipo: 'CLIENTE_FRECUENTE',
    fechaRegistro: new Date(2024, 8, 1),
    activo: true,
    saldo: 0,
    limiteCredito: 40000,
  },
  {
    id: 'socio-005',
    nombre: 'Diego Granito',
    tipo: 'SOCIO_ADHERENTE',
    fechaRegistro: new Date(2024, 8, 1),
    activo: true,
    saldo: 0,
    limiteCredito: 100000,
  },
  {
    id: 'socio-006',
    nombre: 'Cesar',
    tipo: 'CLIENTE_FRECUENTE',
    fechaRegistro: new Date(2024, 8, 1),
    activo: true,
    saldo: 0,
    limiteCredito: 30000,
  },
];

// ============================================================================
// 5. CATEGORÍAS DE PRODUCTOS
// ============================================================================

export const mockCategoriasProductos: CategoriaProducto[] = [
  {
    id: 'cat-flor',
    nombre: 'Flores',
    descripcion: 'Flores de cannabis de diferentes variedades',
    tipo: 'FLOR',
    activo: true,
  },
  {
    id: 'cat-esqueje',
    nombre: 'Esquejes',
    descripcion: 'Esquejes para cultivo',
    tipo: 'ESQUEJE',
    activo: true,
  },
  {
    id: 'cat-kit',
    nombre: 'Kits de Cultivo',
    descripcion: 'Kits completos para iniciar cultivo',
    tipo: 'KIT',
    activo: true,
  },
];

// ============================================================================
// 6. PRODUCTOS
// ============================================================================

export const mockProductos: Producto[] = [
  {
    id: 'prod-gellato',
    categoriaId: 'cat-flor',
    nombre: 'Gellato',
    variedad: 'Gellato 1',
    descripcion: 'Variedad premium híbrida',
    unidadMedida: 'GRAMOS',
    precioBase: 6000,
    stockMinimo: 50,
    stockActual: 135, // De la cosecha del 28/08/2024
    activo: true,
    thc: 22.5,
    cbd: 0.8,
  },
  {
    id: 'prod-og-kush',
    categoriaId: 'cat-flor',
    nombre: 'OG Kush',
    variedad: 'OG Kush',
    descripcion: 'Variedad indica clásica',
    unidadMedida: 'GRAMOS',
    precioBase: 6000,
    stockMinimo: 50,
    stockActual: 80,
    activo: true,
    thc: 20.0,
    cbd: 0.5,
  },
  {
    id: 'prod-esqueje-general',
    categoriaId: 'cat-esqueje',
    nombre: 'Esqueje',
    descripcion: 'Esquejes de variedades disponibles',
    unidadMedida: 'UNIDADES',
    precioBase: 10000,
    stockMinimo: 10,
    stockActual: 24,
    activo: true,
  },
  {
    id: 'prod-kit-basico',
    categoriaId: 'cat-kit',
    nombre: 'Kit Básico de Cultivo',
    descripcion: 'Kit para principiantes',
    unidadMedida: 'KITS',
    precioBase: 45000,
    stockMinimo: 5,
    stockActual: 8,
    activo: true,
  },
];

// ============================================================================
// 7. VENTAS (Ejemplos del Excel)
// ============================================================================

export const mockVentas: Venta[] = [
  {
    id: 'venta-001',
    numero: 1,
    fecha: new Date(2024, 8, 2),
    socioId: 'socio-001', // Juanchy
    vendedorId: 'emp-tino',
    subtotal: 150000,
    descuento: 0,
    total: 150000,
    estadoPago: 'PAGADO',
    montoPagado: 150000,
    saldoPendiente: 0,
    metodoPago: 'EFECTIVO',
    entregado: true,
    fechaEntrega: new Date(2024, 8, 2),
  },
  {
    id: 'venta-002',
    numero: 2,
    fecha: new Date(2024, 8, 5),
    socioId: 'socio-002', // Gaston
    vendedorId: 'emp-tino',
    subtotal: 60000,
    descuento: 0,
    total: 60000,
    estadoPago: 'PAGADO',
    montoPagado: 60000,
    saldoPendiente: 0,
    metodoPago: 'EFECTIVO',
    entregado: true,
    fechaEntrega: new Date(2024, 8, 5),
  },
  {
    id: 'venta-003',
    numero: 3,
    fecha: new Date(2024, 8, 9),
    socioId: 'socio-005', // Diego Granito
    vendedorId: 'emp-tino',
    subtotal: 60000,
    descuento: 0,
    total: 60000,
    estadoPago: 'PAGADO',
    montoPagado: 60000,
    saldoPendiente: 0,
    metodoPago: 'EFECTIVO',
    entregado: true,
    fechaEntrega: new Date(2024, 8, 9),
    notas: 'Venta de 6 esquejes',
  },
];

// ============================================================================
// 8. ITEMS DE VENTA
// ============================================================================

export const mockItemsVenta: ItemVenta[] = [
  {
    id: 'item-001',
    ventaId: 'venta-001',
    productoId: 'prod-gellato',
    descripcion: 'Gellato',
    cantidad: 25,
    precioUnitario: 6000,
    subtotal: 150000,
    descuento: 0,
    total: 150000,
  },
  {
    id: 'item-002',
    ventaId: 'venta-002',
    productoId: 'prod-gellato',
    descripcion: 'Gellato',
    cantidad: 10,
    precioUnitario: 6000,
    subtotal: 60000,
    descuento: 0,
    total: 60000,
  },
  {
    id: 'item-003',
    ventaId: 'venta-003',
    productoId: 'prod-esqueje-general',
    descripcion: 'Esqueje',
    cantidad: 6,
    precioUnitario: 10000,
    subtotal: 60000,
    descuento: 0,
    total: 60000,
  },
];

// ============================================================================
// 9. CATEGORÍAS DE GASTOS
// ============================================================================

export const mockCategoriasGastos: CategoriaGasto[] = [
  {
    id: 'cat-alquiler',
    nombre: 'Alquiler',
    tipo: 'FIJO',
    descripcion: 'Alquiler del local',
    activo: true,
  },
  {
    id: 'cat-servicios-legales',
    nombre: 'Servicios Legales',
    tipo: 'FIJO',
    descripcion: 'Abogados y asesoría legal',
    activo: true,
  },
  {
    id: 'cat-servicios-medicos',
    nombre: 'Servicios Médicos',
    tipo: 'FIJO',
    descripcion: 'Médico ONG',
    activo: true,
  },
  {
    id: 'cat-marketing',
    nombre: 'Marketing y Redes',
    tipo: 'FIJO',
    descripcion: 'Redes sociales y publicidad',
    activo: true,
  },
  {
    id: 'cat-servicios',
    nombre: 'Servicios Básicos',
    tipo: 'FIJO',
    descripcion: 'Luz, agua, internet',
    activo: true,
  },
  {
    id: 'cat-insumos',
    nombre: 'Insumos de Cultivo',
    tipo: 'VARIABLE',
    descripcion: 'Fertilizantes, sustratos, etc.',
    activo: true,
  },
  {
    id: 'cat-mantenimiento',
    nombre: 'Mantenimiento',
    tipo: 'VARIABLE',
    descripcion: 'Reparaciones y mantenimiento',
    activo: true,
  },
  {
    id: 'cat-mano-obra',
    nombre: 'Mano de Obra Variable',
    tipo: 'VARIABLE',
    descripcion: 'Manicura, trabajos puntuales',
    activo: true,
  },
];

// ============================================================================
// 10. GASTOS FIJOS (Del Excel)
// ============================================================================

export const mockGastosFijos: Gasto[] = [
  {
    id: 'gasto-001',
    numero: 1,
    fecha: new Date(2025, 0, 10),
    categoriaId: 'cat-alquiler',
    detalle: 'ALQUILER',
    monto: 900000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'MENSUAL',
    vencimiento: new Date(2025, 0, 10),
  },
  {
    id: 'gasto-002',
    numero: 2,
    fecha: new Date(2025, 0, 10),
    categoriaId: 'cat-servicios-legales',
    detalle: 'ABOGADOS BAIRES',
    monto: 534000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'MENSUAL',
    vencimiento: new Date(2025, 0, 10),
    notas: '400 USD',
  },
  {
    id: 'gasto-003',
    numero: 3,
    fecha: new Date(2025, 0, 10),
    categoriaId: 'cat-servicios-legales',
    detalle: 'ABOGADOS TUC',
    monto: 250000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'MENSUAL',
    vencimiento: new Date(2025, 0, 10),
  },
  {
    id: 'gasto-004',
    numero: 4,
    fecha: new Date(2025, 0, 10),
    categoriaId: 'cat-servicios-medicos',
    detalle: 'MEDICO ONG',
    monto: 303000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'MENSUAL',
    vencimiento: new Date(2025, 0, 10),
    notas: '200 USD',
  },
  {
    id: 'gasto-005',
    numero: 5,
    fecha: new Date(2025, 0, 10),
    categoriaId: 'cat-marketing',
    detalle: 'REDES SOCIALES',
    monto: 660000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'MENSUAL',
    vencimiento: new Date(2025, 0, 10),
  },
  {
    id: 'gasto-006',
    numero: 6,
    fecha: new Date(2025, 0, 26),
    categoriaId: 'cat-servicios',
    detalle: 'LUZ',
    monto: 2077030,
    metodoPago: 'DEBITO',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'BIMESTRAL',
    vencimiento: new Date(2025, 0, 26),
  },
  {
    id: 'gasto-007',
    numero: 7,
    fecha: new Date(2025, 0, 20),
    categoriaId: 'cat-servicios',
    detalle: 'INTERNET',
    monto: 38000,
    metodoPago: 'DEBITO',
    pagado: true,
    esRecurrente: true,
    frecuencia: 'MENSUAL',
    vencimiento: new Date(2025, 0, 20),
  },
];

// ============================================================================
// 11. PAGOS DE SUELDOS
// ============================================================================

export const mockPagosSueldos: PagoSueldo[] = [
  {
    id: 'sueldo-001',
    empleadoId: 'emp-tino',
    fecha: new Date(2025, 0, 10),
    periodo: '2025-01',
    montoBase: 1000000,
    bonos: 0,
    descuentos: 0,
    total: 1000000,
    metodoPago: 'EFECTIVO',
    pagado: true,
  },
  {
    id: 'sueldo-002',
    empleadoId: 'emp-matias',
    fecha: new Date(2025, 0, 10),
    periodo: '2025-01',
    montoBase: 750000,
    bonos: 0,
    descuentos: 0,
    total: 750000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
  },
  {
    id: 'sueldo-003',
    empleadoId: 'emp-bianca',
    fecha: new Date(2025, 0, 10),
    periodo: '2025-01',
    montoBase: 500000,
    bonos: 0,
    descuentos: 0,
    total: 500000,
    metodoPago: 'TRANSFERENCIA',
    pagado: true,
  },
  {
    id: 'sueldo-004',
    empleadoId: 'emp-victor',
    fecha: new Date(2025, 0, 10),
    periodo: '2025-01',
    montoBase: 1350000,
    bonos: 0,
    descuentos: 0,
    total: 1350000,
    metodoPago: 'EFECTIVO',
    pagado: true,
  },
];

// ============================================================================
// 12. COSECHAS
// ============================================================================

export const mockCosechas: Cosecha[] = [
  {
    id: 'cosecha-001',
    numero: 1,
    fecha: new Date(2024, 7, 28), // 28 Ago 2024
    sala: 'SALA_1',
    variedad: 'Gellato 1',
    cantidadPlantas: 12,
    pesoHumedo: 850,
    pesoSeco: 255,
    rendimiento: 30.0,
    fechaSecado: new Date(2024, 8, 10),
    fechaCurado: new Date(2024, 8, 25),
    calidad: 'A',
    lote: 'LOTE-2024-001',
  },
];

// ============================================================================
// 13. MOVIMIENTOS DE STOCK
// ============================================================================

export const mockMovimientosStock: MovimientoStock[] = [
  {
    id: 'mov-001',
    productoId: 'prod-gellato',
    fecha: new Date(2024, 7, 28),
    tipo: 'COSECHA',
    cantidad: 255,
    stockAnterior: 0,
    stockNuevo: 255,
    motivo: 'Ingreso stock Gellato 1',
    lote: 'LOTE-2024-001',
    pesoHumedo: 850,
    pesoSeco: 255,
  },
  {
    id: 'mov-002',
    productoId: 'prod-gellato',
    fecha: new Date(2024, 8, 2),
    tipo: 'EGRESO',
    cantidad: -25,
    stockAnterior: 255,
    stockNuevo: 230,
    motivo: 'Venta a Juanchy',
    referenciaId: 'venta-001',
    referenciaTabla: 'ventas',
  },
  {
    id: 'mov-003',
    productoId: 'prod-gellato',
    fecha: new Date(2024, 8, 5),
    tipo: 'EGRESO',
    cantidad: -10,
    stockAnterior: 230,
    stockNuevo: 220,
    motivo: 'Venta a Gaston',
    referenciaId: 'venta-002',
    referenciaTabla: 'ventas',
  },
];

// ============================================================================
// USUARIOS
// ============================================================================

export const mockUsuarios: Usuario[] = [
  {
    id: 'usr-001',
    username: 'admin',
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@thegardenboys.com',
    rol: 'ADMIN',
    activo: true,
    fechaCreacion: new Date('2024-01-01'),
    ultimoAcceso: new Date(),
    telefono: '+54 9 11 1234-5678',
  },
  {
    id: 'usr-002',
    username: 'diegogarcia',
    nombre: 'Diego',
    apellido: 'García',
    email: 'diego@thegardenboys.com',
    rol: 'GERENTE',
    activo: true,
    fechaCreacion: new Date('2024-01-15'),
    ultimoAcceso: new Date('2024-01-19'),
    telefono: '+54 9 11 2345-6789',
  },
  {
    id: 'usr-003',
    username: 'marialopez',
    nombre: 'María',
    apellido: 'López',
    email: 'maria@thegardenboys.com',
    rol: 'VENDEDOR',
    activo: true,
    fechaCreacion: new Date('2024-02-01'),
    ultimoAcceso: new Date('2024-01-18'),
    telefono: '+54 9 11 3456-7890',
  },
  {
    id: 'usr-004',
    username: 'juanperez',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@thegardenboys.com',
    rol: 'OPERADOR',
    activo: true,
    fechaCreacion: new Date('2024-02-10'),
    ultimoAcceso: new Date('2024-01-17'),
  },
  {
    id: 'usr-005',
    username: 'anamartinez',
    nombre: 'Ana',
    apellido: 'Martínez',
    email: 'ana@thegardenboys.com',
    rol: 'VENDEDOR',
    activo: false,
    fechaCreacion: new Date('2023-12-01'),
    ultimoAcceso: new Date('2023-12-20'),
    notas: 'Usuario inactivo - ya no trabaja en el club',
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const mockData = {
  inversores: mockInversores,
  gastosInversion: mockGastosInversion,
  empleados: mockEmpleados,
  socios: mockSocios,
  categoriasProductos: mockCategoriasProductos,
  productos: mockProductos,
  ventas: mockVentas,
  itemsVenta: mockItemsVenta,
  categoriasGastos: mockCategoriasGastos,
  gastosFijos: mockGastosFijos,
  pagosSueldos: mockPagosSueldos,
  cosechas: mockCosechas,
  movimientosStock: mockMovimientosStock,
  usuarios: mockUsuarios,
};

// ============================================================================
// MOCK STORAGE (Compatibilidad con código existente - LEGACY)
// ============================================================================

class MockStorage {
  private getKey(collection: string): string {
    return `tgb_${collection}`;
  }

  // Métodos legacy para compatibilidad
  getVentas() {
    return mockVentas;
  }

  getProductos() {
    return mockProductos;
  }

  getGastos() {
    return mockGastosFijos;
  }
}

export const mockStorage = new MockStorage();
