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
import { Plus, CreditCard, TrendingDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Gasto } from "@/lib/types";
import { startOfMonth, endOfMonth } from "date-fns";
import { mockStorage } from "@/lib/mockData";
import Modal from "@/components/ui/Modal";

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    categoria: "servicios" as
      | "servicios"
      | "suministros"
      | "personal"
      | "mantenimiento"
      | "otros",
    concepto: "",
    monto: "",
  });

  const [totalMes, setTotalMes] = useState(0);

  useEffect(() => {
    loadGastos();
  }, []);

  useEffect(() => {
    calculateTotalMes();
  }, [gastos]);

  const loadGastos = () => {
    const gastosData = mockStorage.getGastos();
    setGastos(gastosData);
  };

  const calculateTotalMes = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const total = gastos
      .filter((g) => g.fecha >= monthStart && g.fecha <= monthEnd)
      .reduce((sum, g) => sum + g.monto, 0);

    setTotalMes(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      mockStorage.saveGasto({
        fecha: new Date(formData.fecha),
        categoria: formData.categoria,
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        createdAt: new Date(),
      });

      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        categoria: "servicios",
        concepto: "",
        monto: "",
      });

      setShowForm(false);
      loadGastos();
    } catch (error) {
      console.error("Error guardando gasto:", error);
      alert("Error al guardar el gasto.");
    } finally {
      setSaving(false);
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      servicios: "Servicios",
      suministros: "Suministros",
      personal: "Personal",
      mantenimiento: "Mantenimiento",
      otros: "Otros",
    };
    return labels[categoria] || categoria;
  };

  const getCategoriaColor = (categoria: string): "default" | "success" | "warning" | "danger" => {
    const colors: Record<string, "default" | "success" | "warning" | "danger"> = {
      servicios: "default",
      suministros: "warning",
      personal: "success",
      mantenimiento: "danger",
      otros: "default",
    };
    return colors[categoria] || "default";
  };

  return (
    <div>
      <Header title="Gastos" subtitle="Registro y control de gastos operativos (Modo Demo)" />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Gastos del Mes
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalMes)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <TrendingDown className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Historial de Gastos</CardTitle>
              <Button onClick={() => setShowForm(!showForm)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Gasto
              </Button>
            </div>
          </CardHeader>
          <CardContent>

            {gastos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay gastos registrados</p>
              </div>
            ) : (
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gastos.map((gasto) => (
                    <TableRow key={gasto.id}>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(gasto.fecha)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoriaColor(gasto.categoria)}>
                          {getCategoriaLabel(gasto.categoria)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {gasto.concepto}
                      </TableCell>
                      <TableCell className="text-right font-medium text-danger-600 dark:text-danger-400">
                        {formatCurrency(gasto.monto)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nuevo Gasto" size="lg">
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
              label="Categoría"
              value={formData.categoria}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoria: e.target.value as any,
                })
              }
              options={[
                { value: "servicios", label: "Servicios" },
                { value: "suministros", label: "Suministros" },
                { value: "personal", label: "Personal" },
                { value: "mantenimiento", label: "Mantenimiento" },
                { value: "otros", label: "Otros" },
              ]}
            />

            <Input
              label="Concepto"
              value={formData.concepto}
              onChange={(e) =>
                setFormData({ ...formData, concepto: e.target.value })
              }
              placeholder="Ej: Pago de luz y agua"
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
              {saving ? "Guardando..." : "Guardar Gasto"}
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
