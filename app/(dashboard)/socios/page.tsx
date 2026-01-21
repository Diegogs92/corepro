"use client";

import { useCallback, useEffect, useState } from "react";
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
import {
  Plus,
  Users,
  Edit,
  Trash2,
  Search,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Socio, Venta, TipoSocio } from "@/lib/types";
import { sociosService, ventasService } from "@/lib/firebaseService";

// Tipo extendido para incluir estadísticas
interface SocioConStats extends Socio {
  totalCompras?: number;
  cantidadCompras?: number;
  ultimaCompra?: Date;
}

export default function SociosPage() {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const [socios, setSocios] = useState<SocioConStats[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState<SocioConStats | null>(null);
  const [socioToDelete, setSocioToDelete] = useState<Socio | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ACTIVO" | "INACTIVO">("ACTIVO");
  const [filtroDeuda, setFiltroDeuda] = useState<"TODOS" | "CON_DEUDA" | "SIN_DEUDA">("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  // Stats generales
  const [stats, setStats] = useState({
    totalSocios: 0,
    sociosActivos: 0,
    sociosInactivos: 0,
    sociosConDeuda: 0,
    deudaTotal: 0,
    saldoAFavor: 0,
  });

  // Formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    fechaRegistro: new Date().toISOString().split("T")[0],
    tipo: "SOCIO_REGULAR" as TipoSocio,
    activo: true,
    limiteCredito: "0",
    notas: "",
  });

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================================
  // CARGA DE DATOS
  // ============================================================================

  const loadData = async () => {
    try {
      const [sociosData, ventasData] = await Promise.all([
        sociosService.getAll(),
        ventasService.getAll(),
      ]);

      const sociosConStats = sociosData.map((socio) => {
        const ventasSocio = ventasData.filter((v) => v.socioId === socio.id);
        const fechas = ventasSocio
          .map((v) => v.fecha)
          .filter((fecha): fecha is Date => Boolean(fecha));
        const ultimaCompra =
          fechas.length > 0
            ? new Date(Math.max(...fechas.map((fecha) => fecha.getTime())))
            : undefined;

        return {
          ...socio,
          totalCompras: ventasSocio.reduce((sum, v) => sum + v.total, 0),
          cantidadCompras: ventasSocio.length,
          ultimaCompra,
        };
      });

      setSocios(sociosConStats);
      setVentas(ventasData);
    } catch (error) {
      console.error("Error cargando socios:", error);
      alert("Error cargando socios. Verifica la configuracion de Firebase.");
    }
  };

  // ============================================================================
  // CÁLCULO DE ESTADÍSTICAS
  // ============================================================================

  const calculateStats = useCallback(() => {
    const totalSocios = socios.length;
    const sociosActivos = socios.filter((s) => s.activo).length;
    const sociosInactivos = socios.filter((s) => !s.activo).length;
    const sociosConDeuda = socios.filter((s) => s.saldo < 0).length;

    const deudaTotal = socios
      .filter((s) => s.saldo < 0)
      .reduce((sum, s) => sum + Math.abs(s.saldo), 0);

    const saldoAFavor = socios
      .filter((s) => s.saldo > 0)
      .reduce((sum, s) => sum + s.saldo, 0);

    setStats({
      totalSocios,
      sociosActivos,
      sociosInactivos,
      sociosConDeuda,
      deudaTotal,
      saldoAFavor,
    });
  }, [socios]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // ============================================================================
  // FILTRADO DE SOCIOS
  // ============================================================================

  const sociosFiltrados = socios.filter((socio) => {
    // Filtro por estado
    if (filtroEstado === "ACTIVO" && !socio.activo) return false;
    if (filtroEstado === "INACTIVO" && socio.activo) return false;

    // Filtro por deuda
    if (filtroDeuda === "CON_DEUDA" && socio.saldo >= 0) return false;
    if (filtroDeuda === "SIN_DEUDA" && socio.saldo < 0) return false;

    // Búsqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        socio.nombre.toLowerCase().includes(search) ||
        socio.dni?.toLowerCase().includes(search) ||
        socio.telefono?.toLowerCase().includes(search) ||
        socio.email?.toLowerCase().includes(search)
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
      // Convertir la fecha del formulario a Date sin problemas de zona horaria
      const [year, month, day] = formData.fechaRegistro.split('-').map(Number);
      const fechaRegistro = new Date(year, month - 1, day);

      const socioPayload = {
        nombre: formData.nombre,
        apellido: formData.apellido || undefined,
        dni: formData.dni || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        fechaRegistro,
        tipo: formData.tipo,
        limiteCredito: parseFloat(formData.limiteCredito) || 0,
        activo: formData.activo,
        notas: formData.notas || undefined,
      };

      if (editingId) {
        await sociosService.update(editingId, socioPayload);
      } else {
        await sociosService.create({
          ...socioPayload,
          saldo: 0,
        });
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error guardando socio:", error);
      alert("Error al guardar el socio.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (socio: Socio) => {
    setFormData({
      nombre: socio.nombre,
      apellido: socio.apellido || "",
      dni: socio.dni || "",
      telefono: socio.telefono || "",
      email: socio.email || "",
      fechaRegistro: socio.fechaRegistro.toISOString().split("T")[0],
      tipo: socio.tipo,
      limiteCredito: socio.limiteCredito.toString(),
      activo: socio.activo,
      notas: socio.notas || "",
    });
    setEditingId(socio.id);
    setShowForm(true);
  };

  const handleDelete = (socio: Socio) => {
    setSocioToDelete(socio);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!socioToDelete) return;

    setDeleting(true);
    try {
      // Desactivar socio en lugar de eliminar
      await sociosService.update(socioToDelete.id, { activo: false });
      await loadData();

      setShowConfirmDelete(false);
      setSocioToDelete(null);
    } catch (error) {
      console.error("Error desactivando socio:", error);
      alert("Error al desactivar el socio.");
    } finally {
      setDeleting(false);
    }
  };

  const handleVerDetalles = (socio: SocioConStats) => {
    setSocioSeleccionado(socio);
    setShowDetalles(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      fechaRegistro: new Date().toISOString().split("T")[0],
      tipo: "SOCIO_REGULAR" as TipoSocio,
      limiteCredito: "0",
      activo: true,
      notas: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================================================
  // HELPERS DE UI
  // ============================================================================

  const getSaldoBadge = (saldo: number) => {
    if (saldo < 0) {
      return (
        <Badge variant="danger">
          <TrendingDown className="h-3 w-3 mr-1" />
          Debe {formatCurrency(Math.abs(saldo))}
        </Badge>
      );
    } else if (saldo > 0) {
      return (
        <Badge variant="success">
          <TrendingUp className="h-3 w-3 mr-1" />
          A favor {formatCurrency(saldo)}
        </Badge>
      );
    }
    return <Badge variant="default">Al día</Badge>;
  };

  const getEstadoBadge = (activo: boolean) => {
    if (activo) {
      return (
        <Badge variant="success">
          <UserCheck className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <UserX className="h-3 w-3 mr-1" />
        Inactivo
      </Badge>
    );
  };

  // ============================================================================
  // RENDER MODAL DETALLES
  // ============================================================================

  const renderModalDetalles = () => {
    if (!socioSeleccionado) return null;

    const ventasSocio = ventas.filter((v) => v.socioId === socioSeleccionado.id);

    return (
      <Modal
        isOpen={showDetalles}
        onClose={() => {
          setShowDetalles(false);
          setSocioSeleccionado(null);
        }}
        title={`Detalles de ${socioSeleccionado.nombre}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  DNI
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {socioSeleccionado.dni || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Teléfono
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {socioSeleccionado.telefono || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Email
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {socioSeleccionado.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Tipo de Socio
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {socioSeleccionado.tipo.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Fecha de Registro
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {formatDate(socioSeleccionado.fechaRegistro)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Estado
                </p>
                <p>{getEstadoBadge(socioSeleccionado.activo)}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Estadísticas de Compra
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Comprado
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(socioSeleccionado.totalCompras || 0)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Cantidad de Compras
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {socioSeleccionado.cantidadCompras || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Saldo Actual
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      socioSeleccionado.saldo < 0
                        ? "text-danger-600 dark:text-danger-400"
                        : "text-success-600 dark:text-success-400"
                    }`}
                  >
                    {formatCurrency(socioSeleccionado.saldo)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Historial de Ventas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Historial de Ventas (últimas 10)
            </h3>
            {ventasSocio.length === 0 ? (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No hay ventas registradas
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>N° Venta</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado Pago</TableHead>
                      <TableHead>Entregado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventasSocio.slice(0, 10).map((venta) => (
                      <TableRow key={venta.id}>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {formatDate(venta.fecha)}
                        </TableCell>
                        <TableCell className="font-medium">#{venta.numero}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(venta.total)}
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
                        <TableCell>
                          {venta.entregado ? (
                            <Badge variant="success">Sí</Badge>
                          ) : (
                            <Badge variant="warning">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Notas */}
          {socioSeleccionado.notas && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
                Notas
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {socioSeleccionado.notas}
              </p>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div>
      <Header title="Socios" subtitle="Gestión de socios y clientes del club" />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ====================================================================== */}
        {/* ESTADÍSTICAS */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 mb-8">
          {/* Total Socios */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Socios
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalSocios}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Socios Activos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Activos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-success-600 dark:text-success-400">
                    {stats.sociosActivos}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Socios Inactivos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Inactivos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-500 dark:text-slate-400">
                    {stats.sociosInactivos}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <UserX className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Con Deuda */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Con Deuda
                  </p>
                  <p className="mt-2 text-3xl font-bold text-danger-600 dark:text-danger-400">
                    {stats.sociosConDeuda}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deuda Total */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Deuda Total
                  </p>
                  <p className="mt-2 text-xl font-bold text-danger-600 dark:text-danger-400">
                    {formatCurrency(stats.deudaTotal)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saldo a Favor */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Saldo a Favor
                  </p>
                  <p className="mt-2 text-xl font-bold text-success-600 dark:text-success-400">
                    {formatCurrency(stats.saldoAFavor)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================================== */}
        {/* TABLA DE SOCIOS */}
        {/* ====================================================================== */}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Listado de Socios</CardTitle>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Socio
                </Button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Input
                  placeholder="Buscar por nombre, DNI, teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  options={[
                    { value: "TODOS", label: "Todos los estados" },
                    { value: "ACTIVO", label: "Solo activos" },
                    { value: "INACTIVO", label: "Solo inactivos" },
                  ]}
                />

                <Select
                  value={filtroDeuda}
                  onChange={(e) => setFiltroDeuda(e.target.value as any)}
                  options={[
                    { value: "TODOS", label: "Todos" },
                    { value: "CON_DEUDA", label: "Con deuda" },
                    { value: "SIN_DEUDA", label: "Sin deuda" },
                  ]}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {sociosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay socios registrados</p>
                <p className="text-sm mt-1">
                  {searchTerm || filtroEstado !== "TODOS" || filtroDeuda !== "TODOS"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Comienza agregando tu primer socio"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Fecha Ingreso</TableHead>
                      <TableHead className="text-right">Total Compras</TableHead>
                      <TableHead className="text-right">Cant. Compras</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sociosFiltrados.map((socio) => (
                      <TableRow key={socio.id}>
                        <TableCell className="font-medium">{socio.nombre}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {socio.dni || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {socio.telefono || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {socio.email || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {formatDate(socio.fechaRegistro)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary-600 dark:text-primary-400">
                          {formatCurrency(socio.totalCompras || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <ShoppingBag className="h-3 w-3 text-slate-400" />
                            {socio.cantidadCompras || 0}
                          </div>
                        </TableCell>
                        <TableCell>{getSaldoBadge(socio.saldo)}</TableCell>
                        <TableCell>{getEstadoBadge(socio.activo)}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalles(socio)}
                            >
                              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(socio)}
                            >
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(socio)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
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
        title={editingId ? "Editar Socio" : "Nuevo Socio"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Juan"
              required
            />

            {/* Apellido */}
            <Input
              label="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              placeholder="Ej: Pérez"
            />

            {/* DNI */}
            <Input
              label="DNI"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              placeholder="12345678"
            />

            {/* Teléfono */}
            <Input
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 1234-5678"
            />

            {/* Email */}
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="socio@email.com"
            />

            {/* Tipo de Socio */}
            <Select
              label="Tipo de Socio"
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value as TipoSocio })
              }
              options={[
                { value: "SOCIO_REGULAR", label: "Socio Regular" },
                { value: "SOCIO_PREFERENCIAL", label: "Socio Preferencial" },
                { value: "CLIENTE_OCASIONAL", label: "Cliente Ocasional" },
              ]}
            />

            {/* Límite de Crédito */}
            <Input
              label="Límite de Crédito"
              type="number"
              step="0.01"
              min="0"
              value={formData.limiteCredito}
              onChange={(e) =>
                setFormData({ ...formData, limiteCredito: e.target.value })
              }
              placeholder="0.00"
            />

            {/* Fecha de Registro */}
            <Input
              label="Fecha de Registro"
              type="date"
              value={formData.fechaRegistro}
              onChange={(e) =>
                setFormData({ ...formData, fechaRegistro: e.target.value })
              }
              required
            />

            {/* Checkbox: Activo */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) =>
                  setFormData({ ...formData, activo: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="activo"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Socio activo
              </label>
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Notas adicionales sobre el socio..."
                rows={3}
                className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar Socio" : "Guardar Socio"}
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

      {/* Modal de Detalles */}
      {renderModalDetalles()}

      {/* Dialog de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setSocioToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Desactivar Socio"
        message={`¿Estás seguro de desactivar al socio ${socioToDelete?.nombre} ${socioToDelete?.apellido || ""}? El socio quedará inactivo pero sus datos se conservarán.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="warning"
        loading={deleting}
      />
    </div>
  );
}
