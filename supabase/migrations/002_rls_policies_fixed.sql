-- =====================================================
-- TGB - Row Level Security (RLS) Policies
-- Replaces Firestore Security Rules
-- FIXED VERSION - No auth schema permissions needed
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE inversores ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_inversion ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_cuenta_corriente ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_sueldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosechas ENABLE ROW LEVEL SECURITY;
ALTER TABLE geneticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE camas ENABLE ROW LEVEL SECURITY;
ALTER TABLE macetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_cultivo ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE secuencias ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS (in public schema)
-- =====================================================

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
        AND rol = 'ADMIN'
        AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has specific rol
CREATE OR REPLACE FUNCTION public.has_role(required_role rol_usuario)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
        AND rol = required_role
        AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(required_roles rol_usuario[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
        AND rol = ANY(required_roles)
        AND activo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLICIES - Group 1: Investment (READ ONLY)
-- =====================================================

-- Inversores: All authenticated users can read, only admins can modify
CREATE POLICY "inversores_select" ON inversores FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "inversores_insert" ON inversores FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "inversores_update" ON inversores FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "inversores_delete" ON inversores FOR DELETE
    USING (public.is_admin());

-- Gastos Inversion: Same as inversores
CREATE POLICY "gastos_inversion_select" ON gastos_inversion FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "gastos_inversion_insert" ON gastos_inversion FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "gastos_inversion_update" ON gastos_inversion FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "gastos_inversion_delete" ON gastos_inversion FOR DELETE
    USING (public.is_admin());

-- =====================================================
-- POLICIES - Group 2: Members & Customers (FULL CRUD)
-- =====================================================

-- Socios: Full CRUD for authenticated users
CREATE POLICY "socios_select" ON socios FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "socios_insert" ON socios FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "socios_update" ON socios FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "socios_delete" ON socios FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Movimientos Cuenta Corriente: INSERT ONLY (audit trail)
CREATE POLICY "movimientos_cc_select" ON movimientos_cuenta_corriente FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "movimientos_cc_insert" ON movimientos_cuenta_corriente FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Pagos: Custom rules (no delete)
CREATE POLICY "pagos_select" ON pagos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "pagos_insert" ON pagos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "pagos_update" ON pagos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 3: Employees (READ ONLY)
-- =====================================================

CREATE POLICY "empleados_select" ON empleados FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "empleados_insert" ON empleados FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "empleados_update" ON empleados FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "empleados_delete" ON empleados FOR DELETE
    USING (public.is_admin());

CREATE POLICY "pagos_sueldos_select" ON pagos_sueldos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "pagos_sueldos_insert" ON pagos_sueldos FOR INSERT
    WITH CHECK (public.has_any_role(ARRAY['ADMIN', 'GERENTE']::rol_usuario[]));

CREATE POLICY "pagos_sueldos_update" ON pagos_sueldos FOR UPDATE
    USING (public.has_any_role(ARRAY['ADMIN', 'GERENTE']::rol_usuario[]));

-- =====================================================
-- POLICIES - Group 4: Products (FULL CRUD)
-- =====================================================

-- Categorias Productos
CREATE POLICY "categorias_productos_select" ON categorias_productos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "categorias_productos_insert" ON categorias_productos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "categorias_productos_update" ON categorias_productos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "categorias_productos_delete" ON categorias_productos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Productos
CREATE POLICY "productos_select" ON productos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "productos_insert" ON productos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "productos_update" ON productos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "productos_delete" ON productos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Movimientos Stock: INSERT ONLY (audit trail)
CREATE POLICY "movimientos_stock_select" ON movimientos_stock FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "movimientos_stock_insert" ON movimientos_stock FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 5: Sales (FULL CRUD)
-- =====================================================

-- Ventas
CREATE POLICY "ventas_select" ON ventas FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "ventas_insert" ON ventas FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "ventas_update" ON ventas FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "ventas_delete" ON ventas FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Items Venta
CREATE POLICY "items_venta_select" ON items_venta FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "items_venta_insert" ON items_venta FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "items_venta_update" ON items_venta FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "items_venta_delete" ON items_venta FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 6: Expenses (FULL CRUD)
-- =====================================================

-- Categorias Gastos
CREATE POLICY "categorias_gastos_select" ON categorias_gastos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "categorias_gastos_insert" ON categorias_gastos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "categorias_gastos_update" ON categorias_gastos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "categorias_gastos_delete" ON categorias_gastos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Gastos
CREATE POLICY "gastos_select" ON gastos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "gastos_insert" ON gastos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "gastos_update" ON gastos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "gastos_delete" ON gastos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 7: Cash Management (INSERT ONLY)
-- =====================================================

CREATE POLICY "movimientos_caja_select" ON movimientos_caja FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "movimientos_caja_insert" ON movimientos_caja FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 8: Harvests (FULL CRUD)
-- =====================================================

CREATE POLICY "cosechas_select" ON cosechas FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "cosechas_insert" ON cosechas FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "cosechas_update" ON cosechas FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "cosechas_delete" ON cosechas FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 9: Cultivation (FULL CRUD)
-- =====================================================

-- Geneticas
CREATE POLICY "geneticas_select" ON geneticas FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "geneticas_insert" ON geneticas FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "geneticas_update" ON geneticas FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "geneticas_delete" ON geneticas FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Camas
CREATE POLICY "camas_select" ON camas FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "camas_insert" ON camas FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "camas_update" ON camas FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "camas_delete" ON camas FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Macetas
CREATE POLICY "macetas_select" ON macetas FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "macetas_insert" ON macetas FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "macetas_update" ON macetas FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "macetas_delete" ON macetas FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Cultivos
CREATE POLICY "cultivos_select" ON cultivos FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "cultivos_insert" ON cultivos FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "cultivos_update" ON cultivos FOR UPDATE
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "cultivos_delete" ON cultivos FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Registros Cultivo: INSERT ONLY (audit trail)
CREATE POLICY "registros_cultivo_select" ON registros_cultivo FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "registros_cultivo_insert" ON registros_cultivo FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- POLICIES - Group 10: Users (CUSTOM)
-- =====================================================

-- Usuarios: Users can read all, but only modify their own profile (admins can modify all)
CREATE POLICY "usuarios_select" ON usuarios FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "usuarios_insert" ON usuarios FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "usuarios_update_self" ON usuarios FOR UPDATE
    USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "usuarios_delete" ON usuarios FOR DELETE
    USING (public.is_admin());

-- =====================================================
-- POLICIES - Group 11: Sequences (READ/UPDATE)
-- =====================================================

CREATE POLICY "secuencias_select" ON secuencias FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "secuencias_update" ON secuencias FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- =====================================================

-- Grant usage on sequences and functions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant access to views
GRANT SELECT ON socios_con_deuda TO authenticated;
GRANT SELECT ON productos_stock_bajo TO authenticated;
GRANT SELECT ON ventas_resumen TO authenticated;
GRANT SELECT ON cultivos_activos TO authenticated;
