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
import PriceInput from "@/components/ui/PriceInput";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Search,
  Filter,
  Leaf,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye,
} from "lucide-react";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import type { Producto, CategoriaProducto, MovimientoStock, UnidadMedida } from "@/lib/types";
import { mockCategoriasProductos } from "@/lib/mockData";
import {
  categoriasProductosService,
  productosServiceExtended,
  movimientosStockService,
  productosService,
} from "@/lib/supabaseService";

// Tipo extendido para incluir categoría
interface ProductoConCategoria extends Producto {
  categoria?: CategoriaProducto;
}

export default function ProductosPage() {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const [productos, setProductos] = useState<ProductoConCategoria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [movimientosStock, setMovimientosStock] = useState<MovimientoStock[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConCategoria | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado para confirmación de eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<ProductoConCategoria | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "ACTIVO" | "INACTIVO">("ACTIVO");
  const [filtroStock, setFiltroStock] = useState<
    "TODOS" | "CRITICO" | "BAJO" | "OK"
  >("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    stockBajo: 0,
    stockCritico: 0,
    valorTotal: 0,
  });

  // Formulario
  const [formData, setFormData] = useState({
    categoriaId: "",
    nombre: "",
    variedad: "",
    unidadMedida: "GRAMOS" as UnidadMedida,
    precioBase: "",
    precioBaseCurrency: "ARS" as "ARS" | "USD",
    stockMinimo: "",
    stockActual: "",
    thc: "",
    cbd: "",
    activo: true,
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
      const [productosData, categoriasData, movimientosData] = await Promise.all([
        productosService.getAll(),
        categoriasProductosService.getAll(),
        movimientosStockService.getAll(),
      ]);
      const categoriasFinal =
        categoriasData.length > 0 ? categoriasData : mockCategoriasProductos;
      const categoriasMap = new Map(categoriasFinal.map((c) => [c.id, c]));

      const productosConCategoria = productosData.map((producto) => ({
        ...producto,
        categoria: categoriasMap.get(producto.categoriaId),
      }));

      setProductos(productosConCategoria);
      setCategorias(categoriasFinal);
      setMovimientosStock(movimientosData);
    } catch (error) {
      console.error("Error cargando productos:", error);
      alert("Error cargando productos. Verifica la configuración de Firebase.");
    }
  };

  // ============================================================================
  // CÁLCULO DE ESTADÍSTICAS
  // ============================================================================

  const calculateStats = useCallback(() => {
    const totalProductos = productos.length;
    const productosActivos = productos.filter((p) => p.activo).length;

    const stockBajo = productos.filter(
      (p) => getStockStatus(p.stockActual, p.stockMinimo) === "bajo"
    ).length;

    const stockCritico = productos.filter(
      (p) => getStockStatus(p.stockActual, p.stockMinimo) === "critico"
    ).length;

    const valorTotal = productos.reduce(
      (sum, p) => sum + p.stockActual * p.precioBase,
      0
    );

    setStats({
      totalProductos,
      productosActivos,
      stockBajo,
      stockCritico,
      valorTotal,
    });
  }, [productos]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getStockBadge = (producto: Producto) => {
    const status = getStockStatus(producto.stockActual, producto.stockMinimo);

    if (status === "critico") {
      return (
        <Badge variant="danger">
          <XCircle className="h-3 w-3 mr-1" />
          Crítico
        </Badge>
      );
    } else if (status === "bajo") {
      return (
        <Badge variant="warning">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Bajo
        </Badge>
      );
    }
    return (
      <Badge variant="success">
        <CheckCircle className="h-3 w-3 mr-1" />
        OK
      </Badge>
    );
  };

  const getEstadoBadge = (activo: boolean) => {
    if (activo) {
      return (
        <Badge variant="success">
          <CheckCircle className="h-3 w-3 mr-1" />
          Activo
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <XCircle className="h-3 w-3 mr-1" />
        Inactivo
      </Badge>
    );
  };

  // ============================================================================
  // FILTRADO
  // ============================================================================

  const productosFiltrados = productos.filter((producto) => {
    // Filtro por categoría
    if (filtroCategoria !== "TODOS" && producto.categoriaId !== filtroCategoria) {
      return false;
    }

    // Filtro por estado
    if (filtroEstado === "ACTIVO" && !producto.activo) return false;
    if (filtroEstado === "INACTIVO" && producto.activo) return false;

    // Filtro por stock
    const status = getStockStatus(producto.stockActual, producto.stockMinimo);
    if (filtroStock === "CRITICO" && status !== "critico") return false;
    if (filtroStock === "BAJO" && status !== "bajo") return false;
    if (filtroStock === "OK" && status !== "ok") return false;

    // Búsqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        producto.nombre.toLowerCase().includes(search) ||
        producto.variedad?.toLowerCase().includes(search) ||
        producto.categoria?.nombre.toLowerCase().includes(search)
      );
    }

    return true;
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const existing = editingId ? productos.find((p) => p.id === editingId) : null;
      const stockActual = parseFloat(formData.stockActual);
      const productoPayload = {
        categoriaId: formData.categoriaId,
        nombre: formData.nombre,
        variedad: formData.variedad || undefined,
        unidadMedida: formData.unidadMedida,
        precioBase: parseFloat(formData.precioBase),
        precioBaseCurrency: formData.precioBaseCurrency,
        stockMinimo: parseFloat(formData.stockMinimo),
        thc: formData.thc ? parseFloat(formData.thc) : undefined,
        cbd: formData.cbd ? parseFloat(formData.cbd) : undefined,
        activo: formData.activo,
      } as Omit<Producto, "id">;

      if (editingId) {
        // Actualizar producto existente
        await productosService.update(editingId, productoPayload);
        if (existing && stockActual !== existing.stockActual) {
          await productosServiceExtended.ajustarStock(
            editingId,
            stockActual,
            "Ajuste manual desde Productos"
          );
        }
      } else {
        // Crear nuevo producto
        const creado = await productosService.create({
          ...productoPayload,
          stockActual,
        });
        if (stockActual > 0) {
          await movimientosStockService.create({
            productoId: creado.id,
            fecha: new Date(),
            tipo: "INGRESO",
            cantidad: stockActual,
            stockAnterior: 0,
            stockNuevo: stockActual,
            motivo: "Stock inicial",
          } as Omit<MovimientoStock, "id">);
        }
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      categoriaId: producto.categoriaId,
      nombre: producto.nombre,
      variedad: producto.variedad || "",
      unidadMedida: producto.unidadMedida,
      precioBase: producto.precioBase.toString(),
      precioBaseCurrency: producto.precioBaseCurrency || "ARS",
      stockMinimo: producto.stockMinimo.toString(),
      stockActual: producto.stockActual.toString(),
      thc: producto.thc?.toString() || "",
      cbd: producto.cbd?.toString() || "",
      activo: producto.activo,
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (producto: ProductoConCategoria) => {
    setProductoToDelete(producto);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;

    setDeleting(true);
    try {
      await productosService.delete(productoToDelete.id);
      await loadData();
      setShowConfirmDelete(false);
      setProductoToDelete(null);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  };

  const handleVerDetalles = (producto: ProductoConCategoria) => {
    setProductoSeleccionado(producto);
    setShowDetalles(true);
  };

  const resetForm = () => {
    setFormData({
      categoriaId: "",
      nombre: "",
      variedad: "",
      unidadMedida: "GRAMOS",
      precioBase: "",
      precioBaseCurrency: "ARS",
      stockMinimo: "",
      stockActual: "",
      thc: "",
      cbd: "",
      activo: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================================================
  // RENDER MODAL DETALLES
  // ============================================================================

  const renderModalDetalles = () => {
    if (!productoSeleccionado) return null;

    const movimientos = movimientosStock.filter(
      (m) => m.productoId === productoSeleccionado.id
    );

    return (
      <Modal
        isOpen={showDetalles}
        onClose={() => {
          setShowDetalles(false);
          setProductoSeleccionado(null);
        }}
        title={`Detalles de ${productoSeleccionado.nombre}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Información del Producto */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Información del Producto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Categoría
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {productoSeleccionado.categoria?.nombre || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Variedad
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {productoSeleccionado.variedad || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Unidad de Medida
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {productoSeleccionado.unidadMedida}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Estado
                </p>
                <p>{getEstadoBadge(productoSeleccionado.activo)}</p>
              </div>
              {productoSeleccionado.thc && (
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    THC %
                  </p>
                  <p className="text-slate-900 dark:text-slate-100">
                    {productoSeleccionado.thc}%
                  </p>
                </div>
              )}
              {productoSeleccionado.cbd && (
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    CBD %
                  </p>
                  <p className="text-slate-900 dark:text-slate-100">
                    {productoSeleccionado.cbd}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Inventario y Precios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Actual
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {productoSeleccionado.stockActual}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {productoSeleccionado.unidadMedida}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Mínimo
                  </p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {productoSeleccionado.stockMinimo}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Precio Base
                  </p>
                  <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                    {formatCurrency(productoSeleccionado.precioBase)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(
                      productoSeleccionado.stockActual * productoSeleccionado.precioBase
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Últimos Movimientos */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">
              Últimos Movimientos de Stock
            </h3>
            {movimientos.length === 0 ? (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">
                No hay movimientos registrados
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead className="text-right">Stock Resultante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientos.slice(0, 5).map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {mov.tipo === "INGRESO" || mov.tipo === "COSECHA" ? (
                            <Badge variant="success">{mov.tipo}</Badge>
                          ) : mov.tipo === "EGRESO" ? (
                            <Badge variant="danger">{mov.tipo}</Badge>
                          ) : (
                            <Badge variant="default">{mov.tipo}</Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={
                            mov.cantidad > 0
                              ? "text-success-600 dark:text-success-400"
                              : "text-danger-600 dark:text-danger-400"
                          }
                        >
                          {mov.cantidad > 0 ? "+" : ""}
                          {mov.cantidad}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {mov.motivo}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {mov.stockNuevo}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div>
      <Header title="Productos" subtitle="Catálogo y gestión de productos" />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ====================================================================== */}
        {/* ESTADÍSTICAS */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {/* Total Productos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Productos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalProductos}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos Activos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Activos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-success-600 dark:text-success-400">
                    {stats.productosActivos}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Bajo */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Bajo
                  </p>
                  <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.stockBajo}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Crítico */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Crítico
                  </p>
                  <p className="mt-2 text-3xl font-bold text-danger-600 dark:text-danger-400">
                    {stats.stockCritico}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <XCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor Total */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Valor Total
                  </p>
                  <p className="mt-2 text-xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(stats.valorTotal)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====================================================================== */}
        {/* TABLA DE PRODUCTOS */}
        {/* ====================================================================== */}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Catálogo de Productos</CardTitle>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Buscar por nombre, variedad..."
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
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as any)}
                  options={[
                    { value: "TODOS", label: "Todos los estados" },
                    { value: "ACTIVO", label: "Solo activos" },
                    { value: "INACTIVO", label: "Solo inactivos" },
                  ]}
                />

                <Select
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value as any)}
                  options={[
                    { value: "TODOS", label: "Todo el stock" },
                    { value: "CRITICO", label: "Stock crítico" },
                    { value: "BAJO", label: "Stock bajo" },
                    { value: "OK", label: "Stock OK" },
                  ]}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay productos registrados</p>
                <p className="text-sm mt-1">
                  {searchTerm || filtroCategoria !== "TODOS" || filtroEstado !== "TODOS"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Comienza agregando tu primer producto"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Variedad</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Mín.</TableHead>
                      <TableHead>Estado Stock</TableHead>
                      <TableHead className="text-right">Precio Base</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFiltrados.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {producto.categoria?.tipo === 'FLOR' && (
                              <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                            {producto.nombre}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">
                            {producto.categoria?.nombre || "Sin categoría"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {producto.variedad || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {producto.stockActual}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400">
                          {producto.stockMinimo}
                        </TableCell>
                        <TableCell>{getStockBadge(producto)}</TableCell>
                        <TableCell className="text-right font-medium text-success-600 dark:text-success-400">
                          {formatCurrency(producto.precioBase)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary-600 dark:text-primary-400">
                          {formatCurrency(producto.stockActual * producto.precioBase)}
                        </TableCell>
                        <TableCell>{getEstadoBadge(producto.activo)}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleVerDetalles(producto)}
                            >
                              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(producto)}
                            >
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(producto)}
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
        title={editingId ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Categoría */}
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
                  label: c.nombre,
                })),
              ]}
              required
            />

            {/* Nombre */}
            <Input
              label="Nombre del Producto"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Gellato, Blue Dream..."
              required
            />

            {/* Variedad */}
            <Input
              label="Variedad"
              value={formData.variedad}
              onChange={(e) => setFormData({ ...formData, variedad: e.target.value })}
              placeholder="Ej: Gellato 1, Blue Dream Haze..."
            />

            {/* Unidad de Medida */}
            <Select
              label="Unidad de Medida"
              value={formData.unidadMedida}
              onChange={(e) =>
                setFormData({ ...formData, unidadMedida: e.target.value as UnidadMedida })
              }
              options={[
                { value: "GRAMOS", label: "Gramos (g)" },
                { value: "UNIDADES", label: "Unidades" },
                { value: "KITS", label: "Kits" },
              ]}
            />

            {/* Precio Base */}
            <PriceInput
              label="Precio Base"
              value={parseFloat(formData.precioBase) || 0}
              onChange={(value, currency) =>
                setFormData({
                  ...formData,
                  precioBase: value.toString(),
                  precioBaseCurrency: currency
                })
              }
              required
            />

            {/* Stock Mínimo */}
            <Input
              label="Stock Mínimo"
              type="number"
              step="0.01"
              min="0"
              value={formData.stockMinimo}
              onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
              placeholder="0"
              required
            />

            {/* Stock Actual */}
            <Input
              label="Stock Actual"
              type="number"
              step="0.01"
              min="0"
              value={formData.stockActual}
              onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
              placeholder="0"
              required
            />

            {/* THC % */}
            <Input
              label="THC %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.thc}
              onChange={(e) => setFormData({ ...formData, thc: e.target.value })}
              placeholder="0.0"
            />

            {/* CBD % */}
            <Input
              label="CBD %"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.cbd}
              onChange={(e) => setFormData({ ...formData, cbd: e.target.value })}
              placeholder="0.0"
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
                Producto activo
              </label>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button type="submit" disabled={saving}>
              {saving
                ? "Guardando..."
                : editingId
                ? "Actualizar Producto"
                : "Guardar Producto"}
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

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setProductoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar el producto "${productoToDelete?.nombre}"? El producto no se eliminará, solo se marcará como inactivo.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="warning"
        loading={deleting}
      />
    </div>
  );
}




