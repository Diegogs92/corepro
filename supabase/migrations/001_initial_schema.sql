-- =====================================================
-- TGB - The Garden Boys Management System
-- Migration from Firebase Firestore to Supabase PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS - Type Definitions
-- =====================================================

CREATE TYPE tipo_socio AS ENUM ('SOCIO_PLENO', 'SOCIO_ADHERENTE', 'CLIENTE_FRECUENTE', 'CLIENTE_OCASIONAL');
CREATE TYPE tipo_movimiento_cc AS ENUM ('CARGO', 'PAGO');
CREATE TYPE metodo_pago AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO', 'CREDITO', 'DEBITO', 'CUENTA_CORRIENTE');
CREATE TYPE estado_pago AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO');
CREATE TYPE unidad_medida AS ENUM ('GRAMOS', 'UNIDADES', 'KITS');
CREATE TYPE tipo_categoria_producto AS ENUM ('FLOR', 'ESQUEJE', 'KIT', 'SEMILLA', 'INSUMO', 'OTRO');
CREATE TYPE tipo_movimiento_stock AS ENUM ('INGRESO', 'EGRESO', 'AJUSTE', 'COSECHA');
CREATE TYPE tipo_gasto AS ENUM ('FIJO', 'VARIABLE');
CREATE TYPE categoria_gasto_inversion AS ENUM ('EQUIPAMIENTO', 'CONSTRUCCION', 'INSUMOS_INICIALES', 'LEGAL', 'OTROS');
CREATE TYPE frecuencia_gasto AS ENUM ('MENSUAL', 'BIMESTRAL', 'TRIMESTRAL', 'ANUAL');
CREATE TYPE tipo_movimiento_caja AS ENUM ('INGRESO', 'EGRESO');
CREATE TYPE categoria_movimiento_caja AS ENUM ('VENTA', 'GASTO', 'SUELDO', 'RETIRO', 'APORTE', 'OTRO');
CREATE TYPE sala_cosecha AS ENUM ('SALA_1', 'SALA_2');
CREATE TYPE calidad_cosecha AS ENUM ('A', 'B', 'C');
CREATE TYPE rol_usuario AS ENUM ('ADMIN', 'GERENTE', 'VENDEDOR', 'OPERADOR');
CREATE TYPE tipo_ubicacion_cultivo AS ENUM ('CAMA', 'MACETA');
CREATE TYPE etapa_cultivo AS ENUM ('GERMINACION', 'PLANTULA', 'VEGETATIVO', 'FLORACION', 'COSECHA', 'SECADO_CURADO');
CREATE TYPE estado_cultivo AS ENUM ('ACTIVO', 'PAUSADO', 'FINALIZADO');
CREATE TYPE tipo_genetica AS ENUM ('FEMINIZADA', 'AUTO', 'REGULAR', 'CLON');
CREATE TYPE tipo_registro_cultivo AS ENUM ('ETAPA', 'LUZ_AMBIENTE', 'RIEGO_NUTRICION', 'SANIDAD', 'GENERAL');
CREATE TYPE currency_type AS ENUM ('ARS', 'USD');

-- =====================================================
-- TABLES - Group 1: Investment & Founding
-- =====================================================

CREATE TABLE inversores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    monto_invertido_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_invertido_pesos NUMERIC(12,2) NOT NULL DEFAULT 0,
    porcentaje_participacion NUMERIC(5,2) NOT NULL DEFAULT 0,
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activo BOOLEAN NOT NULL DEFAULT true,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gastos_inversion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inversor_id UUID NOT NULL REFERENCES inversores(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    detalle TEXT NOT NULL,
    categoria categoria_gasto_inversion NOT NULL,
    monto_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_pesos NUMERIC(12,2) NOT NULL DEFAULT 0,
    precio_dolar NUMERIC(10,2) NOT NULL,
    comprobante TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 2: Members & Customers
-- =====================================================

CREATE TABLE socios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    apellido TEXT,
    email TEXT,
    telefono TEXT,
    dni TEXT,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo tipo_socio NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    saldo NUMERIC(12,2) NOT NULL DEFAULT 0,
    limite_credito NUMERIC(12,2),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE movimientos_cuenta_corriente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo tipo_movimiento_cc NOT NULL,
    concepto TEXT NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    saldo_anterior NUMERIC(12,2) NOT NULL,
    saldo_nuevo NUMERIC(12,2) NOT NULL,
    referencia_id UUID,
    referencia_tabla TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE RESTRICT,
    venta_id UUID, -- FK added later after ventas table
    monto NUMERIC(12,2) NOT NULL,
    metodo_pago metodo_pago NOT NULL,
    referencia TEXT,
    concepto TEXT NOT NULL,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 3: Employees & Payroll
-- =====================================================

CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    puesto TEXT NOT NULL,
    sueldo_mensual NUMERIC(12,2) NOT NULL,
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_egreso TIMESTAMPTZ,
    activo BOOLEAN NOT NULL DEFAULT true,
    email TEXT,
    telefono TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pagos_sueldos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    periodo TEXT NOT NULL, -- "2025-01", "2025-02"
    monto_base NUMERIC(12,2) NOT NULL,
    bonos NUMERIC(12,2) NOT NULL DEFAULT 0,
    descuentos NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    metodo_pago metodo_pago NOT NULL,
    pagado BOOLEAN NOT NULL DEFAULT false,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 4: Products & Inventory
-- =====================================================

CREATE TABLE categorias_productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo tipo_categoria_producto NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias_productos(id) ON DELETE RESTRICT,
    nombre TEXT NOT NULL,
    variedad TEXT,
    descripcion TEXT,
    unidad_medida unidad_medida NOT NULL,
    precio_base NUMERIC(12,2) NOT NULL,
    precio_base_currency currency_type DEFAULT 'ARS',
    stock_minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_actual NUMERIC(12,2) NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    imagen_url TEXT,
    thc NUMERIC(5,2),
    cbd NUMERIC(5,2),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE movimientos_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo tipo_movimiento_stock NOT NULL,
    cantidad NUMERIC(12,3) NOT NULL,
    stock_anterior NUMERIC(12,3) NOT NULL,
    stock_nuevo NUMERIC(12,3) NOT NULL,
    motivo TEXT NOT NULL,
    referencia_id UUID,
    referencia_tabla TEXT,
    lote TEXT,
    peso_humedo NUMERIC(12,2),
    peso_seco NUMERIC(12,2),
    usuario_id UUID,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 5: Sales & Payments
-- =====================================================

CREATE TABLE ventas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL UNIQUE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    socio_id UUID NOT NULL REFERENCES socios(id) ON DELETE RESTRICT,
    vendedor_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    estado_pago estado_pago NOT NULL DEFAULT 'PENDIENTE',
    monto_pagado NUMERIC(12,2) NOT NULL DEFAULT 0,
    saldo_pendiente NUMERIC(12,2) NOT NULL,
    metodo_pago metodo_pago,
    entregado BOOLEAN NOT NULL DEFAULT false,
    fecha_entrega TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE items_venta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    descripcion TEXT NOT NULL,
    cantidad NUMERIC(12,3) NOT NULL,
    precio_unitario NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    descuento NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK from pagos to ventas (now that ventas exists)
ALTER TABLE pagos ADD CONSTRAINT pagos_venta_id_fkey
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL;

-- =====================================================
-- TABLES - Group 6: Operating Expenses
-- =====================================================

CREATE TABLE categorias_gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    tipo tipo_gasto NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL UNIQUE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    categoria_id UUID NOT NULL REFERENCES categorias_gastos(id) ON DELETE RESTRICT,
    detalle TEXT NOT NULL,
    proveedor TEXT,
    monto NUMERIC(12,2) NOT NULL,
    monto_currency currency_type DEFAULT 'ARS',
    metodo_pago metodo_pago NOT NULL,
    pagado BOOLEAN NOT NULL DEFAULT false,
    fecha_pago TIMESTAMPTZ,
    comprobante TEXT,
    es_recurrente BOOLEAN NOT NULL DEFAULT false,
    frecuencia frecuencia_gasto,
    vencimiento TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 7: Cash Management
-- =====================================================

CREATE TABLE movimientos_caja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tipo tipo_movimiento_caja NOT NULL,
    categoria categoria_movimiento_caja NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    metodo_pago metodo_pago NOT NULL,
    concepto TEXT NOT NULL,
    referencia_id UUID,
    referencia_tabla TEXT,
    saldo_anterior NUMERIC(12,2) NOT NULL,
    saldo_nuevo NUMERIC(12,2) NOT NULL,
    responsable TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 8: Harvests
-- =====================================================

CREATE TABLE cosechas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL UNIQUE,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sala sala_cosecha NOT NULL,
    variedad TEXT NOT NULL,
    cantidad_plantas INTEGER NOT NULL,
    peso_humedo NUMERIC(12,2) NOT NULL,
    peso_seco NUMERIC(12,2) NOT NULL,
    rendimiento NUMERIC(5,2) NOT NULL,
    fecha_secado TIMESTAMPTZ,
    fecha_curado TIMESTAMPTZ,
    calidad calidad_cosecha NOT NULL,
    lote TEXT NOT NULL,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 9: Cultivation & Growth
-- =====================================================

CREATE TABLE geneticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    origen TEXT,
    tipo tipo_genetica,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE camas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    ubicacion TEXT,
    capacidad INTEGER,
    ancho_cm NUMERIC(8,2),
    largo_cm NUMERIC(8,2),
    alto_cm NUMERIC(8,2),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE macetas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    cama_id UUID REFERENCES camas(id) ON DELETE SET NULL,
    volumen_litros NUMERIC(8,2),
    ubicacion TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cultivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    codigo_interno TEXT UNIQUE,
    tipo_ubicacion tipo_ubicacion_cultivo NOT NULL,
    cama_id UUID REFERENCES camas(id) ON DELETE SET NULL,
    maceta_id UUID REFERENCES macetas(id) ON DELETE SET NULL,
    genetica_id UUID REFERENCES geneticas(id) ON DELETE SET NULL,
    etapa_actual etapa_cultivo NOT NULL,
    estado estado_cultivo NOT NULL DEFAULT 'ACTIVO',
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE registros_cultivo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cultivo_id UUID NOT NULL REFERENCES cultivos(id) ON DELETE CASCADE,
    tipo tipo_registro_cultivo NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID
);

-- =====================================================
-- TABLES - Group 10: Users & Authentication
-- =====================================================

CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    nombre TEXT NOT NULL,
    apellido TEXT,
    email TEXT,
    rol rol_usuario NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ultimo_acceso TIMESTAMPTZ,
    telefono TEXT,
    avatar TEXT,
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLES - Group 11: Sequences (Counters)
-- =====================================================

CREATE TABLE secuencias (
    nombre TEXT PRIMARY KEY,
    numero INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize sequences
INSERT INTO secuencias (nombre, numero) VALUES
    ('ventas', 0),
    ('gastos', 0),
    ('cosechas', 0);

-- =====================================================
-- INDEXES - Performance Optimization
-- =====================================================

-- Socios
CREATE INDEX idx_socios_activo ON socios(activo);
CREATE INDEX idx_socios_tipo ON socios(tipo);
CREATE INDEX idx_socios_saldo ON socios(saldo) WHERE saldo < 0;

-- Ventas
CREATE INDEX idx_ventas_fecha ON ventas(fecha DESC);
CREATE INDEX idx_ventas_socio_id ON ventas(socio_id);
CREATE INDEX idx_ventas_estado_pago ON ventas(estado_pago);
CREATE INDEX idx_ventas_numero ON ventas(numero);

-- Items Venta
CREATE INDEX idx_items_venta_venta_id ON items_venta(venta_id);
CREATE INDEX idx_items_venta_producto_id ON items_venta(producto_id);

-- Productos
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);
CREATE INDEX idx_productos_stock_bajo ON productos(stock_actual) WHERE stock_actual <= stock_minimo;

-- Movimientos Stock
CREATE INDEX idx_movimientos_stock_producto_id ON movimientos_stock(producto_id);
CREATE INDEX idx_movimientos_stock_fecha ON movimientos_stock(fecha DESC);

-- Gastos
CREATE INDEX idx_gastos_fecha ON gastos(fecha DESC);
CREATE INDEX idx_gastos_categoria_id ON gastos(categoria_id);
CREATE INDEX idx_gastos_pagado ON gastos(pagado);

-- Cultivos
CREATE INDEX idx_cultivos_estado ON cultivos(estado) WHERE deleted_at IS NULL;
CREATE INDEX idx_cultivos_etapa ON cultivos(etapa_actual) WHERE deleted_at IS NULL;
CREATE INDEX idx_cultivos_codigo ON cultivos(codigo_interno) WHERE deleted_at IS NULL;

-- Registros Cultivo
CREATE INDEX idx_registros_cultivo_cultivo_id ON registros_cultivo(cultivo_id);
CREATE INDEX idx_registros_cultivo_fecha ON registros_cultivo(fecha DESC);

-- Movimientos Cuenta Corriente
CREATE INDEX idx_movimientos_cc_socio_id ON movimientos_cuenta_corriente(socio_id);
CREATE INDEX idx_movimientos_cc_fecha ON movimientos_cuenta_corriente(fecha DESC);

-- Pagos
CREATE INDEX idx_pagos_socio_id ON pagos(socio_id);
CREATE INDEX idx_pagos_venta_id ON pagos(venta_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha DESC);

-- =====================================================
-- FUNCTIONS - Business Logic
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get next sequence number
CREATE OR REPLACE FUNCTION get_next_sequence(sequence_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    UPDATE secuencias
    SET numero = numero + 1, updated_at = NOW()
    WHERE nombre = sequence_name
    RETURNING numero INTO next_num;

    RETURN next_num;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-generate cultivo codigo_interno
CREATE OR REPLACE FUNCTION generate_cultivo_codigo()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    new_codigo TEXT;
BEGIN
    IF NEW.codigo_interno IS NULL THEN
        -- Count existing cultivos (including soft-deleted)
        SELECT COUNT(*) + 1 INTO next_num FROM cultivos;
        NEW.codigo_interno := 'C' || LPAD(next_num::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS - Automation
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_inversores_updated_at BEFORE UPDATE ON inversores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_inversion_updated_at BEFORE UPDATE ON gastos_inversion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_socios_updated_at BEFORE UPDATE ON socios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_sueldos_updated_at BEFORE UPDATE ON pagos_sueldos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_productos_updated_at BEFORE UPDATE ON categorias_productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_gastos_updated_at BEFORE UPDATE ON categorias_gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gastos_updated_at BEFORE UPDATE ON gastos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cosechas_updated_at BEFORE UPDATE ON cosechas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geneticas_updated_at BEFORE UPDATE ON geneticas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_camas_updated_at BEFORE UPDATE ON camas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_macetas_updated_at BEFORE UPDATE ON macetas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultivos_updated_at BEFORE UPDATE ON cultivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cultivo codigo auto-generation trigger
CREATE TRIGGER generate_cultivo_codigo_trigger BEFORE INSERT ON cultivos
    FOR EACH ROW EXECUTE FUNCTION generate_cultivo_codigo();

-- =====================================================
-- VIEWS - Convenient Data Access
-- =====================================================

-- View: Socios with debt
CREATE VIEW socios_con_deuda AS
SELECT
    s.*,
    ABS(s.saldo) as monto_deuda
FROM socios s
WHERE s.saldo < 0 AND s.activo = true;

-- View: Low stock products
CREATE VIEW productos_stock_bajo AS
SELECT
    p.*,
    c.nombre as categoria_nombre
FROM productos p
JOIN categorias_productos c ON p.categoria_id = c.id
WHERE p.stock_actual <= p.stock_minimo AND p.activo = true;

-- View: Ventas with items summary
CREATE VIEW ventas_resumen AS
SELECT
    v.*,
    s.nombre as socio_nombre,
    s.tipo as socio_tipo,
    e.nombre as vendedor_nombre,
    COUNT(iv.id) as cantidad_items,
    SUM(iv.cantidad) as cantidad_total_productos
FROM ventas v
JOIN socios s ON v.socio_id = s.id
LEFT JOIN empleados e ON v.vendedor_id = e.id
LEFT JOIN items_venta iv ON v.id = iv.venta_id
GROUP BY v.id, s.nombre, s.tipo, e.nombre;

-- View: Cultivos activos
CREATE VIEW cultivos_activos AS
SELECT
    c.*,
    g.nombre as genetica_nombre,
    ca.nombre as cama_nombre,
    m.nombre as maceta_nombre
FROM cultivos c
LEFT JOIN geneticas g ON c.genetica_id = g.id
LEFT JOIN camas ca ON c.cama_id = ca.id
LEFT JOIN macetas m ON c.maceta_id = m.id
WHERE c.deleted_at IS NULL AND c.estado = 'ACTIVO';

-- =====================================================
-- COMMENTS - Documentation
-- =====================================================

COMMENT ON TABLE inversores IS 'Fundadores e inversores del proyecto';
COMMENT ON TABLE socios IS 'Miembros del club y clientes';
COMMENT ON TABLE ventas IS 'Registro de ventas con sistema de cuenta corriente';
COMMENT ON TABLE cultivos IS 'Seguimiento de cultivos con soft delete';
COMMENT ON TABLE movimientos_stock IS 'Registro inmutable de movimientos de inventario';
COMMENT ON TABLE secuencias IS 'Contadores secuenciales para números de documentos';
