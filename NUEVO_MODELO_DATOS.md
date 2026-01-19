# NUEVO MODELO DE DATOS - CLUB CANNABICO THE GARDEN BOYS

## 1. ENTIDADES PRINCIPALES

### 1.1 INVERSORES
```typescript
Inversor {
  id: string
  nombre: string
  email?: string
  telefono?: string
  montoInvertidoUSD: number
  montoInvertidoPesos: number
  porcentajeParticipacion: number
  fechaIngreso: Date
  activo: boolean
  notas?: string
}
```

**Relaciones:**
- Tiene muchos `GastosInversion`
- Tiene muchos `MovimientosInversor` (retiros, aportes adicionales)

---

### 1.2 GASTOS DE INVERSIÓN (Capital inicial)
```typescript
GastoInversion {
  id: string
  inversorId: string
  fecha: Date
  detalle: string
  categoria: 'EQUIPAMIENTO' | 'CONSTRUCCION' | 'INSUMOS_INICIALES' | 'LEGAL' | 'OTROS'
  montoUSD: number
  montoPesos: number
  precioDoLar: number
  comprobante?: string
  notas?: string
}
```

**Relaciones:**
- Pertenece a un `Inversor`

---

### 1.3 SOCIOS/CLIENTES
```typescript
Socio {
  id: string
  nombre: string
  apellido?: string
  email?: string
  telefono?: string
  dni?: string
  fechaRegistro: Date
  tipo: 'SOCIO_PLENO' | 'SOCIO_ADHERENTE' | 'CLIENTE_FRECUENTE' | 'CLIENTE_OCASIONAL'
  activo: boolean
  saldo: number // Cuenta corriente (+ a favor del socio, - debe)
  limiteCredito: number
  notas?: string
}
```

**Relaciones:**
- Tiene muchas `Ventas`
- Tiene muchos `Pagos`
- Tiene muchos `MovimientosCuentaCorriente`

---

### 1.4 EMPLEADOS
```typescript
Empleado {
  id: string
  nombre: string
  apellido: string
  puesto: string
  sueldoMensual: number
  fechaIngreso: Date
  fechaEgreso?: Date
  activo: boolean
  email?: string
  telefono?: string
  notas?: string
}
```

**Relaciones:**
- Tiene muchos `PagosSueldo`
- Puede tener muchas `Ventas` (como vendedor/entregador)

---

### 1.5 CATEGORÍAS DE PRODUCTOS
```typescript
CategoriaProducto {
  id: string
  nombre: string
  descripcion?: string
  tipo: 'FLOR' | 'ESQUEJE' | 'KIT' | 'SEMILLA' | 'INSUMO' | 'OTRO'
  activo: boolean
}
```

**Relaciones:**
- Tiene muchos `Productos`

---

### 1.6 PRODUCTOS
```typescript
Producto {
  id: string
  categoriaId: string
  nombre: string
  variedad?: string // Para flores: "Gellato", "OG Kush", etc.
  descripcion?: string
  unidadMedida: 'GRAMOS' | 'UNIDADES' | 'KITS'
  precioBase: number
  stockMinimo: number
  stockActual: number
  activo: boolean
  imagenUrl?: string
  thc?: number // % THC para flores
  cbd?: number // % CBD para flores
  notas?: string
}
```

**Relaciones:**
- Pertenece a una `CategoriaProducto`
- Tiene muchos `MovimientosStock`
- Tiene muchos `ItemsVenta`

---

### 1.7 MOVIMIENTOS DE STOCK
```typescript
MovimientoStock {
  id: string
  productoId: string
  fecha: Date
  tipo: 'INGRESO' | 'EGRESO' | 'AJUSTE' | 'COSECHA'
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  motivo: string
  referenciaId?: string // ID de venta, compra, etc.
  referenciaTabla?: string // Nombre de la tabla de referencia
  lote?: string
  pesoHumedo?: number // Para cosechas
  pesoSeco?: number // Para cosechas
  usuarioId?: string
  notas?: string
}
```

**Relaciones:**
- Pertenece a un `Producto`
- Puede relacionarse con una `Venta` (si tipo=EGRESO por venta)

---

### 1.8 VENTAS
```typescript
Venta {
  id: string
  numero: number // Número secuencial de venta
  fecha: Date
  socioId: string
  vendedorId?: string // EmpleadoId de quien entregó
  subtotal: number
  descuento: number
  total: number
  estadoPago: 'PENDIENTE' | 'PARCIAL' | 'PAGADO'
  montoPagado: number
  saldoPendiente: number
  metodoPago?: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'CUENTA_CORRIENTE' | 'MIXTO'
  entregado: boolean
  fechaEntrega?: Date
  notas?: string
}
```

**Relaciones:**
- Pertenece a un `Socio`
- Tiene muchos `ItemVenta`
- Tiene muchos `Pagos`
- Puede tener un `Vendedor` (Empleado)

---

### 1.9 ITEMS DE VENTA (detalle)
```typescript
ItemVenta {
  id: string
  ventaId: string
  productoId: string
  descripcion: string // Copia del nombre del producto
  cantidad: number
  precioUnitario: number
  subtotal: number
  descuento: number
  total: number
}
```

**Relaciones:**
- Pertenece a una `Venta`
- Pertenece a un `Producto`

---

### 1.10 PAGOS (de ventas)
```typescript
Pago {
  id: string
  fecha: Date
  socioId: string
  ventaId?: string
  monto: number
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'OTRO'
  referencia?: string // Número de transferencia, etc.
  concepto: string
  notas?: string
}
```

**Relaciones:**
- Pertenece a un `Socio`
- Puede pertenecer a una `Venta` específica o ser un pago a cuenta

---

### 1.11 CATEGORÍAS DE GASTOS
```typescript
CategoriaGasto {
  id: string
  nombre: string
  tipo: 'FIJO' | 'VARIABLE'
  descripcion?: string
  activo: boolean
}
```

Ejemplos:
- FIJOS: Alquiler, Sueldos, Servicios legales, Internet
- VARIABLES: Insumos, Fertilizantes, Manicura, Mantenimiento

**Relaciones:**
- Tiene muchos `Gastos`

---

### 1.12 GASTOS OPERATIVOS
```typescript
Gasto {
  id: string
  numero: number // Número secuencial
  fecha: Date
  categoriaId: string
  detalle: string
  proveedor?: string
  monto: number
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'CUENTA_CORRIENTE'
  pagado: boolean
  fechaPago?: Date
  comprobante?: string
  esRecurrente: boolean
  frecuencia?: 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'ANUAL'
  vencimiento?: Date
  notas?: string
}
```

**Relaciones:**
- Pertenece a una `CategoriaGasto`

---

### 1.13 PAGOS DE SUELDOS
```typescript
PagoSueldo {
  id: string
  empleadoId: string
  fecha: Date
  periodo: string // "2025-01", "2025-02", etc.
  montoBase: number
  bonos: number
  descuentos: number
  total: number
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA'
  pagado: boolean
  notas?: string
}
```

**Relaciones:**
- Pertenece a un `Empleado`

---

### 1.14 CAJA
```typescript
MovimientoCaja {
  id: string
  fecha: Date
  tipo: 'INGRESO' | 'EGRESO'
  categoria: 'VENTA' | 'GASTO' | 'SUELDO' | 'RETIRO' | 'APORTE' | 'OTRO'
  monto: number
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'DEBITO' | 'CREDITO'
  concepto: string
  referenciaId?: string
  referenciaTabla?: string
  saldoAnterior: number
  saldoNuevo: number
  responsable?: string
  notas?: string
}
```

---

### 1.15 COSECHAS
```typescript
Cosecha {
  id: string
  numero: number
  fecha: Date
  sala: 'SALA_1' | 'SALA_2'
  variedad: string
  cantidadPlantas: number
  pesoHumedo: number
  pesoSeco: number
  rendimiento: number // %
  fechaSecado?: Date
  fechaCurado?: Date
  calidad: 'A' | 'B' | 'C'
  lote: string
  notas?: string
}
```

**Relaciones:**
- Genera múltiples `MovimientosStock` (ingreso de productos)

---

## 2. VISTAS / REPORTES CALCULADOS

### 2.1 Balance General
```typescript
BalanceGeneral {
  periodo: string
  totalIngresos: number
  totalEgresos: number
  balance: number

  ingresosPorVentas: number
  ingresosPorAportes: number

  egresosPorGastos: number
  egresosPorSueldos: number

  stockValorizado: number
  cuentasPorCobrar: number
  cuentasPorPagar: number
}
```

### 2.2 Estado de Cuenta Socio
```typescript
EstadoCuentaSocio {
  socioId: string
  saldoActual: number
  totalCompras: number
  totalPagos: number
  ultimaCompra?: Date
  ultimoPago?: Date
  movimientos: MovimientoCuentaCorriente[]
}
```

### 2.3 Reporte de Stock
```typescript
ReporteStock {
  productoId: string
  nombreProducto: string
  stockActual: number
  stockMinimo: number
  alerta: boolean
  valorizado: number
  ultimoMovimiento?: Date
}
```

---

## 3. MIGRACIÓN DE DATOS

### Del Excel actual al nuevo modelo:

**HOJA "INVERSIÓN GASTOS":**
- → Tabla `Inversores` (Facu, Tony)
- → Tabla `GastosInversion` (cada línea de gasto)

**HOJA "STOCK Y VENTAS":**
- Filas con DETALLE="WEED/ESQUEJE/KIT" → Tabla `Ventas` + `ItemsVenta`
- Filas con GASTOS=1 → Tabla `Gastos`
- Filas con DETALLE="SUELDO..." → Tabla `PagosSueldo`
- Campo CLIENTES → Tabla `Socios` (limpiando duplicados)
- Campo CANTIDAD GR negativo → Tabla `MovimientosStock`

**HOJA "GASTOS FIJOS":**
- → Tabla `CategoriaGasto` (tipo=FIJO)
- → Tabla `Gastos` (marcados como recurrentes)

---

## 4. VENTAJAS DEL NUEVO MODELO

✅ **Separación de conceptos** - Cada cosa en su tabla
✅ **Trazabilidad total** - Todas las relaciones están claras
✅ **Stock en tiempo real** - Inventario por variedad
✅ **Cuenta corriente** - Saldo de cada socio
✅ **Balance automático** - Reportes calculados
✅ **Sin duplicados** - IDs únicos, relaciones claras
✅ **Auditable** - Historial de movimientos
✅ **Escalable** - Fácil agregar nuevas funcionalidades
✅ **Reportes flexibles** - Queries SQL complejas posibles

---

## 5. PRÓXIMOS PASOS

1. ✅ Diseñar modelo (COMPLETADO)
2. ⏳ Crear tipos TypeScript
3. ⏳ Actualizar mockData.ts con nueva estructura
4. ⏳ Crear script de migración de Excel → nuevo modelo
5. ⏳ Actualizar las páginas del dashboard
6. ⏳ Crear nuevos reportes y análisis
