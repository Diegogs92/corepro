"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  Activity,
  BarChart3,
} from "lucide-react";
import { formatCurrency, formatDate, getStockStatus } from "@/lib/utils";
import type { Venta, Gasto, Producto, Socio } from "@/lib/types";
import { startOfMonth, endOfMonth, startOfYear } from "date-fns";
import {
  mockVentas,
  mockGastosFijos,
  mockProductos,
  mockSocios,
  mockInversores,
} from "@/lib/mockData";

interface DashboardStats {
  // Financiero
  ingresosMes: number;
  gastosM: number;
  saldoNeto: number;
  ingresosAño: number;

  // Socios
  totalSocios: number;
  sociosActivos: number;
  deudaTotal: number;

  // Productos
  productosStockCritico: number;
  productosStockBajo: number;
  valorInventario: number;

  // Ventas
  ventasMes: number;
  promedioVenta: number;
  mejorCliente: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ingresosMes: 0,
    gastosM: 0,
    saldoNeto: 0,
    ingresosAño: 0,
    totalSocios: 0,
    sociosActivos: 0,
    deudaTotal: 0,
    productosStockCritico: 0,
    productosStockBajo: 0,
    valorInventario: 0,
    ventasMes: 0,
    promedioVenta: 0,
    mejorCliente: "",
  });

  const [productosStockBajo, setProductosStockBajo] = useState<Producto[]>([]);
  const [topSocios, setTopSocios] = useState<
    Array<{ socio: Socio; totalCompras: number; cantidadVentas: number }>
  >([]);
  const [ultimasVentas, setUltimasVentas] = useState<Venta[]>([]);
  const [gastosRecientes, setGastosRecientes] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const yearStart = startOfYear(now);

      // ======================================================================
      // VENTAS
      // ======================================================================
      const ventas = mockVentas;
      const ventasMes = ventas.filter(
        (v) => v.fecha >= monthStart && v.fecha <= monthEnd
      );
      const ventasAño = ventas.filter((v) => v.fecha >= yearStart);

      const ingresosMes = ventasMes.reduce((sum, v) => sum + v.total, 0);
      const ingresosAño = ventasAño.reduce((sum, v) => sum + v.total, 0);
      const promedioVenta = ventasMes.length > 0 ? ingresosMes / ventasMes.length : 0;

      // ======================================================================
      // GASTOS
      // ======================================================================
      const gastos = mockGastosFijos;
      const gastosMes = gastos.filter(
        (g) => g.fecha >= monthStart && g.fecha <= monthEnd
      );
      const gastosMesTotales = gastosMes.reduce((sum, g) => sum + g.monto, 0);

      // ======================================================================
      // PRODUCTOS
      // ======================================================================
      const productos = mockProductos;
      const productosStockBajo = productos.filter(
        (p) => getStockStatus(p.stockActual, p.stockMinimo) === "bajo"
      );
      const productosStockCritico = productos.filter(
        (p) => getStockStatus(p.stockActual, p.stockMinimo) === "critico"
      );
      const valorInventario = productos.reduce(
        (sum, p) => sum + p.stockActual * p.precioBase,
        0
      );

      // ======================================================================
      // SOCIOS
      // ======================================================================
      const socios = mockSocios;
      const sociosActivos = socios.filter((s) => s.activo);
      const deudaTotal = socios
        .filter((s) => s.saldo < 0)
        .reduce((sum, s) => sum + Math.abs(s.saldo), 0);

      // Top 5 socios por compras
      const sociosConCompras = socios.map((socio) => {
        const ventasSocio = ventas.filter((v) => v.socioId === socio.id);
        return {
          socio,
          totalCompras: ventasSocio.reduce((sum, v) => sum + v.total, 0),
          cantidadVentas: ventasSocio.length,
        };
      });

      sociosConCompras.sort((a, b) => b.totalCompras - a.totalCompras);
      const topSociosData = sociosConCompras.slice(0, 5);

      const mejorCliente =
        topSociosData.length > 0 ? topSociosData[0].socio.nombre : "N/A";

      // ======================================================================
      // ACTUALIZAR ESTADO
      // ======================================================================
      setStats({
        ingresosMes,
        gastosM: gastosMesTotales,
        saldoNeto: ingresosMes - gastosMesTotales,
        ingresosAño,
        totalSocios: socios.length,
        sociosActivos: sociosActivos.length,
        deudaTotal,
        productosStockCritico: productosStockCritico.length,
        productosStockBajo: productosStockBajo.length,
        valorInventario,
        ventasMes: ventasMes.length,
        promedioVenta,
        mejorCliente,
      });

      setProductosStockBajo([...productosStockBajo, ...productosStockCritico].slice(0, 5));
      setTopSocios(topSociosData);
      setUltimasVentas(ventas.slice(0, 5));
      setGastosRecientes(gastos.slice(0, 5));
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Resumen ejecutivo del Club Cannábico The Garden Boys"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ====================================================================== */}
        {/* ESTADÍSTICAS PRINCIPALES */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Ingresos del Mes"
            value={stats.ingresosMes}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Gastos del Mes"
            value={stats.gastosM}
            icon={TrendingDown}
            variant="danger"
          />
          <StatCard
            title="Saldo Neto"
            value={stats.saldoNeto}
            icon={DollarSign}
            variant={stats.saldoNeto >= 0 ? "success" : "danger"}
          />
          <StatCard
            title="Stock Crítico"
            value={stats.productosStockCritico}
            icon={AlertCircle}
            format="number"
            variant="warning"
          />
        </div>

        {/* ====================================================================== */}
        {/* ESTADÍSTICAS SECUNDARIAS */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Ventas del Mes
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.ventasMes}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Promedio por Venta
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.promedioVenta)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Socios Activos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-success-600 dark:text-success-400">
                    {stats.sociosActivos}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    de {stats.totalSocios} totales
                  </p>
                </div>
                <div className="rounded-full p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Valor Inventario
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(stats.valorInventario)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================================== */}
        {/* GRÁFICOS Y TABLAS */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top 5 Socios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 5 Socios por Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topSocios.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay datos de socios</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[450px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Socio</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSocios.map((item, index) => (
                        <TableRow key={item.socio.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Badge variant="success" className="text-xs px-1.5">
                                  #1
                                </Badge>
                              )}
                              {item.socio.nombre}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-slate-600 dark:text-slate-400">
                            {item.cantidadVentas}
                          </TableCell>
                          <TableCell className="text-right font-medium text-success-600 dark:text-success-400">
                            {formatCurrency(item.totalCompras)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos con Stock Bajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alerta de Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productosStockBajo.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay productos con stock bajo</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[450px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosStockBajo.map((producto) => {
                        const status = getStockStatus(
                          producto.stockActual,
                          producto.stockMinimo
                        );
                        return (
                          <TableRow key={producto.id}>
                            <TableCell className="font-medium">
                              {producto.nombre}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">{producto.stockActual}</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {" "}
                                / {producto.stockMinimo}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  status === "critico"
                                    ? "danger"
                                    : status === "bajo"
                                    ? "warning"
                                    : "success"
                                }
                              >
                                {status === "critico"
                                  ? "Crítico"
                                  : status === "bajo"
                                  ? "Bajo"
                                  : "OK"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ====================================================================== */}
        {/* ÚLTIMAS TRANSACCIONES */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Últimas Ventas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Últimas Ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ultimasVentas.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay ventas registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[450px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>N° Venta</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ultimasVentas.map((venta) => (
                        <TableRow key={venta.id}>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {formatDate(venta.fecha)}
                          </TableCell>
                          <TableCell className="font-medium">
                            #{venta.numero}
                          </TableCell>
                          <TableCell>
                            {venta.estadoPago === "PAGADO" ? (
                              <Badge variant="success">Pagado</Badge>
                            ) : venta.estadoPago === "PARCIAL" ? (
                              <Badge variant="warning">Parcial</Badge>
                            ) : (
                              <Badge variant="danger">Pendiente</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-success-600 dark:text-success-400">
                            {formatCurrency(venta.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gastos Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Gastos Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gastosRecientes.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay gastos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[450px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Detalle</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gastosRecientes.map((gasto) => (
                        <TableRow key={gasto.id}>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {formatDate(gasto.fecha)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {gasto.detalle}
                          </TableCell>
                          <TableCell>
                            {gasto.pagado ? (
                              <Badge variant="success">Pagado</Badge>
                            ) : (
                              <Badge variant="warning">Pendiente</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-danger-600 dark:text-danger-400">
                            {formatCurrency(gasto.monto)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información de Inversores */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Inversores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockInversores.map((inversor) => (
                  <div
                    key={inversor.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {inversor.nombre}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Participación: {inversor.porcentajeParticipacion}%
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Invertido USD: {formatCurrency(inversor.montoInvertidoUSD)}
                      </p>
                    </div>
                    <Badge variant={inversor.activo ? "success" : "default"}>
                      {inversor.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
