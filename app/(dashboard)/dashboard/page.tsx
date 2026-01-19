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
} from "lucide-react";
import { formatCurrency, formatDate, getStockStatus } from "@/lib/utils";
import type { Venta, Gasto, Producto, DashboardStats } from "@/lib/types";
import { startOfMonth, endOfMonth } from "date-fns";
import { mockStorage } from "@/lib/mockData";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ingresosMes: 0,
    gastosMes: 0,
    saldoNeto: 0,
    productosStockCritico: 0,
  });
  const [productosStockBajo, setProductosStockBajo] = useState<Producto[]>([]);
  const [ultimasTransacciones, setUltimasTransacciones] = useState<
    Array<{ tipo: "venta" | "gasto"; fecha: Date; concepto: string; monto: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Cargar ventas del mes (MODO DEMO)
      const ventas = mockStorage.getVentas();
      const ventasMes = ventas.filter(
        (v) => v.fecha >= monthStart && v.fecha <= monthEnd
      );
      const ingresosMes = ventasMes.reduce((sum, venta) => sum + venta.total, 0);

      // Cargar gastos del mes (MODO DEMO)
      const gastos = mockStorage.getGastos();
      const gastosMes = gastos.filter(
        (g) => g.fecha >= monthStart && g.fecha <= monthEnd
      );
      const gastosMesTotales = gastosMes.reduce((sum, gasto) => sum + gasto.monto, 0);

      // Cargar productos (MODO DEMO)
      const productos = mockStorage.getProductos();
      const productosStockBajo = productos.filter(
        (p) => getStockStatus(p.stockActual, p.stockMinimo) !== "ok"
      );

      const productosStockCritico = productos.filter(
        (p) => getStockStatus(p.stockActual, p.stockMinimo) === "critico"
      ).length;

      // Últimas transacciones
      const transacciones = [
        ...ventas.slice(0, 3).map((v) => ({
          tipo: "venta" as const,
          fecha: v.fecha,
          concepto: `Venta #${v.numero}`,
          monto: v.total,
        })),
        ...gastos.slice(0, 2).map((g) => ({
          tipo: "gasto" as const,
          fecha: g.fecha,
          concepto: g.detalle,
          monto: g.monto,
        })),
      ]
        .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
        .slice(0, 5);

      setStats({
        ingresosMes,
        gastosMes: gastosMesTotales,
        saldoNeto: ingresosMes - gastosMesTotales,
        productosStockCritico,
      });

      setProductosStockBajo(productosStockBajo.slice(0, 5));
      setUltimasTransacciones(transacciones);
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
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Resumen general del sistema de gestión (Modo Demo)"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Ingresos del Mes"
            value={stats.ingresosMes}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Gastos del Mes"
            value={stats.gastosMes}
            icon={TrendingDown}
            variant="danger"
          />
          <StatCard
            title="Saldo Neto"
            value={stats.saldoNeto}
            icon={TrendingUp}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos con stock bajo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos con Stock Bajo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productosStockBajo.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay productos con stock bajo</p>
                </div>
              ) : (
                <Table className="min-w-[520px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
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
                          <TableCell>{producto.stockActual}</TableCell>
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
              )}
            </CardContent>
          </Card>

          {/* Últimas transacciones */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              {ultimasTransacciones.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <p>No hay transacciones registradas</p>
                </div>
              ) : (
                <Table className="min-w-[520px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ultimasTransacciones.map((trans, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Badge
                            variant={
                              trans.tipo === "venta" ? "success" : "danger"
                            }
                          >
                            {trans.tipo === "venta" ? "Ingreso" : "Gasto"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {trans.concepto}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {formatDate(trans.fecha)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            trans.tipo === "venta"
                              ? "text-success-600 dark:text-success-400"
                              : "text-danger-600 dark:text-danger-400"
                          }`}
                        >
                          {trans.tipo === "venta" ? "+" : "-"}
                          {formatCurrency(trans.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
