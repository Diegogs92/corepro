"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
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
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Plus, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Venta } from "@/lib/types";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { mockStorage } from "@/lib/mockData";
import Modal from "@/components/ui/Modal";

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    concepto: "",
    monto: "",
    medioPago: "efectivo" as "efectivo" | "transferencia" | "debito" | "credito",
  });

  const [stats, setStats] = useState({
    totalDia: 0,
    totalMes: 0,
    totalGeneral: 0,
  });

  useEffect(() => {
    loadVentas();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [ventas]);

  const loadVentas = () => {
    const ventasData = mockStorage.getVentas();
    setVentas(ventasData);
  };

  const calculateStats = () => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const totalDia = ventas
      .filter((v) => v.fecha >= dayStart && v.fecha <= dayEnd)
      .reduce((sum, v) => sum + v.monto, 0);

    const totalMes = ventas
      .filter((v) => v.fecha >= monthStart && v.fecha <= monthEnd)
      .reduce((sum, v) => sum + v.monto, 0);

    const totalGeneral = ventas.reduce((sum, v) => sum + v.monto, 0);

    setStats({ totalDia, totalMes, totalGeneral });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      mockStorage.saveVenta({
        fecha: new Date(formData.fecha),
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        medioPago: formData.medioPago,
        createdAt: new Date(),
      });

      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        concepto: "",
        monto: "",
        medioPago: "efectivo",
      });

      setShowForm(false);
      loadVentas();
    } catch (error) {
      console.error("Error guardando venta:", error);
      alert("Error al guardar la venta.");
    } finally {
      setSaving(false);
    }
  };

  const getMedioPagoLabel = (medioPago: string) => {
    const labels: Record<string, string> = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      debito: "Débito",
      credito: "Crédito",
    };
    return labels[medioPago] || medioPago;
  };

  return (
    <div>
      <Header title="Ventas e Ingresos" subtitle="Registro y control de ventas (Modo Demo)" />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Hoy</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.totalDia)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Este Mes</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.totalMes)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.totalGeneral)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Historial de Ventas</CardTitle>
              <Button onClick={() => setShowForm(!showForm)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </div>
          </CardHeader>
          <CardContent>

            {ventas.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay ventas registradas</p>
              </div>
            ) : (
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Medio de Pago</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(venta.fecha)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {venta.concepto}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {getMedioPagoLabel(venta.medioPago)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-success-600 dark:text-success-400">
                        {formatCurrency(venta.monto)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nueva Venta" size="lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha"
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              required
            />

            <Select
              label="Medio de Pago"
              value={formData.medioPago}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medioPago: e.target.value as any,
                })
              }
              options={[
                { value: "efectivo", label: "Efectivo" },
                { value: "transferencia", label: "Transferencia" },
                { value: "debito", label: "Débito" },
                { value: "credito", label: "Crédito" },
              ]}
            />

            <Input
              label="Concepto"
              value={formData.concepto}
              onChange={(e) =>
                setFormData({ ...formData, concepto: e.target.value })
              }
              placeholder="Ej: Venta de consulta médica"
              required
            />

            <Input
              label="Monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) =>
                setFormData({ ...formData, monto: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Venta"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
