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
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PriceInput from "@/components/ui/PriceInput";
import {
  Plus,
  TrendingDown,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  AlertCircle,
  Filter,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Repeat,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Gasto, CategoriaGasto, FrecuenciaGasto, MetodoPago } from "@/lib/types";
import { startOfMonth, endOfMonth, isAfter, isBefore } from "date-fns";
import {
  mockGastosFijos,
  mockCategoriasGastos,
} from "@/lib/mockData";

// Tipo extendido para incluir categoría
interface GastoConCategoria extends Gasto {
  categoria?: CategoriaGasto;
}

export default function GastosPage() {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const [gastos, setGastos] = useState<GastoConCategoria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado para confirmación de eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<GastoConCategoria | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "FIJO" | "VARIABLE">("TODOS");
  const [filtroPago, setFiltroPago] = useState<"TODOS" | "PAGADO" | "PENDIENTE">("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalMes: 0,
    gastosFijos: 0,
    gastosVariables: 0,
    pendientes: 0,
    proxVencimientos: 0,
  });

  // Formulario
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    categoriaId: "",
    detalle: "",
    proveedor: "",
    monto: "",
    montoCurrency: "ARS" as "ARS" | "USD",
    metodoPago: "EFECTIVO" as MetodoPago,
    pagado: false,
    fechaPago: "",
    comprobante: "",
    esRecurrente: false,
    frecuencia: "" as FrecuenciaGasto | "",
    vencimiento: "",
    notas: "",
  });

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [gastos]);

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  const loadData = () => {
    // TODO: Reemplazar con Firebase
    const gastosData = mockGastosFijos.map((gasto) => ({
      ...gasto,
      categoria: mockCategoriasGastos.find((c) => c.id === gasto.categoriaId),
    }));

    setGastos(gastosData);
    setCategorias(mockCategoriasGastos);
  };

  // ============================================================================
  // CÁLCULO DE ESTADÍSTICAS
  // ============================================================================

  const calculateStats = () => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Gastos del mes
    const totalMes = gastos
      .filter((g) => g.fecha >= monthStart && g.fecha <= monthEnd)
      .reduce((sum, g) => sum + g.monto, 0);

    // Gastos fijos del mes
    const gastosFijos = gastos
      .filter(
        (g) =>
          g.esRecurrente &&
          g.fecha >= monthStart &&
          g.fecha <= monthEnd
      )
      .reduce((sum, g) => sum + g.monto, 0);

    // Gastos variables del mes
    const gastosVariables = gastos
      .filter(
        (g) =>
          !g.esRecurrente &&
          g.fecha >= monthStart &&
          g.fecha <= monthEnd
      )
      .reduce((sum, g) => sum + g.monto, 0);

    // Pendientes de pago
    const pendientes = gastos
      .filter((g) => !g.pagado)
      .reduce((sum, g) => sum + g.monto, 0);

    // Próximos vencimientos (próximos 7 días)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const proxVencimientos = gastos.filter(
      (g) =>
        !g.pagado &&
        g.vencimiento &&
        isAfter(g.vencimiento, now) &&
        isBefore(g.vencimiento, nextWeek)
    ).length;

    setStats({
      totalMes,
      gastosFijos,
      gastosVariables,
      pendientes,
      proxVencimientos,
    });
  };

  // ============================================================================
  // FILTRADO DE GASTOS
  // ============================================================================

  const gastosFiltrados = gastos.filter((gasto) => {
    // Filtro por categoría
    if (filtroCategoria !== "TODOS" && gasto.categoriaId !== filtroCategoria) {
      return false;
    }

    // Filtro por tipo
    if (filtroTipo === "FIJO" && !gasto.esRecurrente) return false;
    if (filtroTipo === "VARIABLE" && gasto.esRecurrente) return false;

    // Filtro por estado de pago
    if (filtroPago === "PAGADO" && !gasto.pagado) return false;
    if (filtroPago === "PENDIENTE" && gasto.pagado) return false;

    // Búsqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        gasto.detalle.toLowerCase().includes(search) ||
        gasto.proveedor?.toLowerCase().includes(search) ||
        gasto.categoria?.nombre.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // ============================================================================
  // HANDLERS DE FORMULARIO
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Actualizar gasto existente
        setGastos(
          gastos.map((g) =>
            g.id === editingId
              ? {
                  ...g,
                  fecha: new Date(formData.fecha),
                  categoriaId: formData.categoriaId,
                  detalle: formData.detalle,
                  proveedor: formData.proveedor || undefined,
                  monto: parseFloat(formData.monto),
                  metodoPago: formData.metodoPago,
                  pagado: formData.pagado,
                  fechaPago: formData.fechaPago ? new Date(formData.fechaPago) : undefined,
                  comprobante: formData.comprobante || undefined,
                  esRecurrente: formData.esRecurrente,
                  frecuencia: formData.frecuencia || undefined,
                  vencimiento: formData.vencimiento ? new Date(formData.vencimiento) : undefined,
                  notas: formData.notas || undefined,
                  categoria: categorias.find((c) => c.id === formData.categoriaId),
                }
              : g
          )
        );
      } else {
        // Crear nuevo gasto
        const nuevoGasto: GastoConCategoria = {
          id: `gasto-${Date.now()}`,
          numero: gastos.length + 1,
          fecha: new Date(formData.fecha),
          categoriaId: formData.categoriaId,
          detalle: formData.detalle,
          proveedor: formData.proveedor || undefined,
          monto: parseFloat(formData.monto),
          metodoPago: formData.metodoPago,
          pagado: formData.pagado,
          fechaPago: formData.fechaPago ? new Date(formData.fechaPago) : undefined,
          comprobante: formData.comprobante || undefined,
          esRecurrente: formData.esRecurrente,
          frecuencia: formData.frecuencia || undefined,
          vencimiento: formData.vencimiento ? new Date(formData.vencimiento) : undefined,
          notas: formData.notas || undefined,
          categoria: categorias.find((c) => c.id === formData.categoriaId),
        };
        setGastos([...gastos, nuevoGasto]);
      }

      resetForm();
    } catch (error) {
      console.error("Error guardando gasto:", error);
      alert("Error al guardar el gasto.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setFormData({
      fecha: gasto.fecha.toISOString().split("T")[0],
      categoriaId: gasto.categoriaId,
      detalle: gasto.detalle,
      proveedor: gasto.proveedor || "",
      monto: gasto.monto.toString(),
      montoCurrency: "ARS", // Default to ARS for existing expenses
      metodoPago: gasto.metodoPago,
      pagado: gasto.pagado,
      fechaPago: gasto.fechaPago ? gasto.fechaPago.toISOString().split("T")[0] : "",
      comprobante: gasto.comprobante || "",
      esRecurrente: gasto.esRecurrente,
      frecuencia: gasto.frecuencia || "",
      vencimiento: gasto.vencimiento ? gasto.vencimiento.toISOString().split("T")[0] : "",
      notas: gasto.notas || "",
    });
    setEditingId(gasto.id);
    setShowForm(true);
  };

  const handleDelete = async (gasto: GastoConCategoria) => {
    setGastoToDelete(gasto);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!gastoToDelete) return;

    setDeleting(true);
    try {
      setGastos(gastos.filter((g) => g.id !== gastoToDelete.id));
      setShowConfirmDelete(false);
      setGastoToDelete(null);
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      alert("Error al eliminar el gasto.");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      categoriaId: "",
      detalle: "",
      proveedor: "",
      monto: "",
      montoCurrency: "ARS",
      metodoPago: "EFECTIVO",
      pagado: false,
      fechaPago: "",
      comprobante: "",
      esRecurrente: false,
      frecuencia: "",
      vencimiento: "",
      notas: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================================================
  // HELPERS DE UI
  // ============================================================================

  const getEstadoPagoBadge = (gasto: Gasto) => {
    if (gasto.pagado) {
      return (
        <Badge variant="success">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Pagado
        </Badge>
      );
    }

    // Verificar si está vencido
    if (gasto.vencimiento && isBefore(gasto.vencimiento, new Date())) {
      return (
        <Badge variant="danger">
          <XCircle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      );
    }

    return (
      <Badge variant="warning">
        <Clock className="h-3 w-3 mr-1" />
        Pendiente
      </Badge>
    );
  };

  const getTipoBadge = (gasto: Gasto) => {
    if (gasto.esRecurrente) {
      return (
        <Badge variant="default">
          <Repeat className="h-3 w-3 mr-1" />
          Fijo
        </Badge>
      );
    }
    return <Badge variant="warning">Variable</Badge>;
  };

  const getFrecuenciaLabel = (frecuencia?: FrecuenciaGasto) => {
    const labels: Record<FrecuenciaGasto, string> = {
      MENSUAL: "Mensual",
      BIMESTRAL: "Bimestral",
      TRIMESTRAL: "Trimestral",
      ANUAL: "Anual",
    };
    return frecuencia ? labels[frecuencia] : "-";
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div>
      <Header
        title="Gastos"
        subtitle="Control de gastos fijos y variables del club"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ====================================================================== */}
        {/* ESTADÍSTICAS */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Total del Mes */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total del Mes
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.totalMes)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gastos Fijos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Gastos Fijos
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.gastosFijos)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Repeat className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gastos Variables */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Gastos Variables
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.gastosVariables)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pendientes de Pago */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Pendientes
                  </p>
                  <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {formatCurrency(stats.pendientes)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Vencimientos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Próx. Vencimientos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-danger-600 dark:text-danger-400">
                    {stats.proxVencimientos}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================================== */}
        {/* TABLA DE GASTOS */}
        {/* ====================================================================== */}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Historial de Gastos</CardTitle>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Buscar por detalle, proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  options={[
                    { value: "TODOS", label: "Todas las categorías" },
                    ...categorias.map((c) => ({
                      value: c.id,
                      label: c.nombre,
                    })),
                  ]}
                />

                <Select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value as any)}
                  options={[
                    { value: "TODOS", label: "Todos los tipos" },
                    { value: "FIJO", label: "Gastos fijos" },
                    { value: "VARIABLE", label: "Gastos variables" },
                  ]}
                />

                <Select
                  value={filtroPago}
                  onChange={(e) => setFiltroPago(e.target.value as any)}
                  options={[
                    { value: "TODOS", label: "Todos los estados" },
                    { value: "PAGADO", label: "Pagados" },
                    { value: "PENDIENTE", label: "Pendientes" },
                  ]}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {gastosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay gastos registrados</p>
                <p className="text-sm mt-1">
                  {searchTerm || filtroCategoria !== "TODOS" || filtroTipo !== "TODOS"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Comienza agregando tu primer gasto"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Frecuencia</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastosFiltrados.map((gasto) => (
                      <TableRow key={gasto.id}>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {formatDate(gasto.fecha)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {gasto.categoria?.nombre || "Sin categoría"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {gasto.detalle}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {gasto.proveedor || "-"}
                        </TableCell>
                        <TableCell>{getTipoBadge(gasto)}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {getFrecuenciaLabel(gasto.frecuencia)}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {gasto.vencimiento ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(gasto.vencimiento)}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-danger-600 dark:text-danger-400">
                          {formatCurrency(gasto.monto)}
                        </TableCell>
                        <TableCell>{getEstadoPagoBadge(gasto)}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(gasto)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(gasto)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* ======================================================================== */}
      {/* MODAL DE FORMULARIO */}
      {/* ======================================================================== */}

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? "Editar Gasto" : "Nuevo Gasto"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <Input
              label="Fecha del Gasto"
              type="date"
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              required
            />

            {/* Categoría */}
            <div>
              <Select
                label="Categoría"
                value={formData.categoriaId}
                onChange={(e) =>
                  setFormData({ ...formData, categoriaId: e.target.value })
                }
                options={[
                  { value: "", label: "Selecciona una categoría" },
                  ...categorias.map((c) => ({
                    value: c.id,
                    label: `${c.nombre} (${c.tipo})`,
                  })),
                ]}
                required
              />
            </div>

            {/* Detalle */}
            <Input
              label="Detalle / Concepto"
              value={formData.detalle}
              onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
              placeholder="Ej: Pago de luz y agua"
              required
            />

            {/* Proveedor */}
            <Input
              label="Proveedor"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              placeholder="Ej: EDENOR"
            />

            {/* Monto */}
            <PriceInput
              label="Monto"
              value={parseFloat(formData.monto) || 0}
              onChange={(value, currency) =>
                setFormData({
                  ...formData,
                  monto: value.toString(),
                  montoCurrency: currency
                })
              }
              required
            />

            {/* Método de Pago */}
            <Select
              label="Método de Pago"
              value={formData.metodoPago}
              onChange={(e) =>
                setFormData({ ...formData, metodoPago: e.target.value as MetodoPago })
              }
              options={[
                { value: "EFECTIVO", label: "Efectivo" },
                { value: "TRANSFERENCIA", label: "Transferencia" },
                { value: "DEBITO", label: "Débito" },
                { value: "CREDITO", label: "Crédito" },
                { value: "MERCADOPAGO", label: "Mercado Pago" },
              ]}
            />

            {/* Checkbox: Pagado */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="pagado"
                checked={formData.pagado}
                onChange={(e) =>
                  setFormData({ ...formData, pagado: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="pagado"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Gasto ya pagado
              </label>
            </div>

            {/* Fecha de Pago (solo si pagado) */}
            {formData.pagado && (
              <Input
                label="Fecha de Pago"
                type="date"
                value={formData.fechaPago}
                onChange={(e) =>
                  setFormData({ ...formData, fechaPago: e.target.value })
                }
              />
            )}

            {/* Comprobante */}
            <Input
              label="N° Comprobante"
              value={formData.comprobante}
              onChange={(e) =>
                setFormData({ ...formData, comprobante: e.target.value })
              }
              placeholder="Ej: FC-001-00001234"
            />

            {/* Vencimiento */}
            <Input
              label="Vencimiento"
              type="date"
              value={formData.vencimiento}
              onChange={(e) =>
                setFormData({ ...formData, vencimiento: e.target.value })
              }
            />

            {/* Checkbox: Recurrente */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="esRecurrente"
                checked={formData.esRecurrente}
                onChange={(e) =>
                  setFormData({ ...formData, esRecurrente: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="esRecurrente"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Gasto recurrente (fijo)
              </label>
            </div>

            {/* Frecuencia (solo si recurrente) */}
            {formData.esRecurrente && (
              <Select
                label="Frecuencia"
                value={formData.frecuencia}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frecuencia: e.target.value as FrecuenciaGasto,
                  })
                }
                options={[
                  { value: "", label: "Selecciona frecuencia" },
                  { value: "MENSUAL", label: "Mensual" },
                  { value: "BIMESTRAL", label: "Bimestral" },
                  { value: "TRIMESTRAL", label: "Trimestral" },
                  { value: "ANUAL", label: "Anual" },
                ]}
              />
            )}

            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales sobre el gasto..."
                rows={3}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving}>
              {saving
                ? "Guardando..."
                : editingId
                ? "Actualizar Gasto"
                : "Guardar Gasto"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setGastoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Gasto"
        message={`¿Estás seguro de eliminar el gasto "${gastoToDelete?.detalle}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
