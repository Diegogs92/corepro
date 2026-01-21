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
import { Plus, Package, Search, Edit, Trash2, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import type { Producto, CategoriaProducto, MovimientoStock, UnidadMedida } from "@/lib/types";
import {
  mockProductos,
  mockCategoriasProductos,
  mockMovimientosStock,
} from "@/lib/mockData";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMovimientos, setShowMovimientos] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");

  // Estado para confirmación de eliminación
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    categoriaId: "",
    variedad: "",
    descripcion: "",
    unidadMedida: "GRAMOS" as UnidadMedida,
    stockActual: "",
    stockMinimo: "",
    precioBase: "",
    thc: "",
    cbd: "",
  });

  const [stats, setStats] = useState({
    totalProductos: 0,
    stockBajo: 0,
    stockCritico: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProductos();
    calculateStats();
  }, [searchTerm, categoriaFilter, productos]);

  const loadData = () => {
    setProductos(mockProductos);
    setCategorias(mockCategoriasProductos);
    setMovimientos(mockMovimientosStock);
  };

  const filterProductos = () => {
    let filtered = productos;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.variedad && p.variedad.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoriaFilter) {
      filtered = filtered.filter((p) => p.categoriaId === categoriaFilter);
    }

    setFilteredProductos(filtered);
  };

  const calculateStats = () => {
    const totalProductos = productos.length;
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

    setStats({ totalProductos, stockBajo, stockCritico, valorTotal });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const nuevoProducto: Producto = {
        id: editingId || `prod-${Date.now()}`,
        categoriaId: formData.categoriaId,
        nombre: formData.nombre,
        variedad: formData.variedad || undefined,
        descripcion: formData.descripcion || undefined,
        unidadMedida: formData.unidadMedida,
        stockActual: parseFloat(formData.stockActual),
        stockMinimo: parseFloat(formData.stockMinimo),
        precioBase: parseFloat(formData.precioBase),
        activo: true,
        thc: formData.thc ? parseFloat(formData.thc) : undefined,
        cbd: formData.cbd ? parseFloat(formData.cbd) : undefined,
      };

      // TODO: Guardar en Firebase
      if (editingId) {
        setProductos(productos.map((p) => (p.id === editingId ? nuevoProducto : p)));
      } else {
        setProductos([...productos, nuevoProducto]);
      }

      resetForm();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      categoriaId: "",
      variedad: "",
      descripcion: "",
      unidadMedida: "GRAMOS",
      stockActual: "",
      stockMinimo: "",
      precioBase: "",
      thc: "",
      cbd: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      categoriaId: producto.categoriaId,
      variedad: producto.variedad || "",
      descripcion: producto.descripcion || "",
      unidadMedida: producto.unidadMedida,
      stockActual: producto.stockActual.toString(),
      stockMinimo: producto.stockMinimo.toString(),
      precioBase: producto.precioBase.toString(),
      thc: producto.thc?.toString() || "",
      cbd: producto.cbd?.toString() || "",
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = (producto: Producto) => {
    setProductoToDelete(producto);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;

    setDeleting(true);
    try {
      setProductos(productos.filter((p) => p.id !== productoToDelete.id));
      setShowConfirmDelete(false);
      setProductoToDelete(null);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar el producto.");
    } finally {
      setDeleting(false);
    }
  };

  const verMovimientos = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setShowMovimientos(true);
  };

  const getStatusBadge = (stockActual: number, stockMinimo: number) => {
    const status = getStockStatus(stockActual, stockMinimo);
    const variants = {
      critico: "danger" as const,
      bajo: "warning" as const,
      ok: "success" as const,
    };
    const labels = {
      critico: "Crítico",
      bajo: "Bajo",
      ok: "OK",
    };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const movimientosProducto = productoSeleccionado
    ? movimientos.filter((m) => m.productoId === productoSeleccionado.id)
    : [];

  return (
    <div>
      <Header
        title="Gestión de Stock"
        subtitle="Control de inventario con historial de movimientos"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Productos
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.totalProductos}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Package className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Bajo
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.stockBajo}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Stock Crítico
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.stockCritico}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Valor Total
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.valorTotal)}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Acciones */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre o variedad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  options={[
                    { value: "", label: "Todas las categorías" },
                    ...categorias.map((c) => ({ value: c.id, label: c.nombre })),
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario de Productos</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProductos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay productos registrados</p>
              </div>
            ) : (
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Mín.</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => {
                    const categoria = categorias.find((c) => c.id === producto.categoriaId);
                    const valor = producto.stockActual * producto.precioBase;

                    return (
                      <TableRow key={producto.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{producto.nombre}</div>
                            {producto.variedad && (
                              <div className="text-sm text-slate-500">{producto.variedad}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="default">{categoria?.nombre || "Sin categoría"}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {producto.stockActual}
                          <span className="text-xs text-slate-500 ml-1">
                            {producto.unidadMedida === "GRAMOS" ? "g" : "u"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600 dark:text-slate-400">
                          {producto.stockMinimo}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(producto.stockActual, producto.stockMinimo)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(producto.precioBase)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(valor)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => verMovimientos(producto)}
                              title="Ver movimientos"
                            >
                              <Package className="h-4 w-4" />
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
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Nuevo/Editar Producto */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title="Editar Stock de Producto"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Producto"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />

            <Select
              label="Categoría"
              value={formData.categoriaId}
              onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
              options={[
                { value: "", label: "Seleccionar categoría..." },
                ...categorias.map((c) => ({ value: c.id, label: c.nombre })),
              ]}
              required
            />

            <Input
              label="Variedad (opcional)"
              value={formData.variedad}
              onChange={(e) => setFormData({ ...formData, variedad: e.target.value })}
              placeholder="Ej: Gellato 1, OG Kush"
            />

            <Select
              label="Unidad de Medida"
              value={formData.unidadMedida}
              onChange={(e) => setFormData({ ...formData, unidadMedida: e.target.value as any })}
              options={[
                { value: "GRAMOS", label: "Gramos" },
                { value: "UNIDADES", label: "Unidades" },
                { value: "KITS", label: "Kits" },
              ]}
            />

            <Input
              label="Stock Actual"
              type="number"
              step="0.01"
              min="0"
              value={formData.stockActual}
              onChange={(e) => setFormData({ ...formData, stockActual: e.target.value })}
              required
            />

            <Input
              label="Stock Mínimo"
              type="number"
              step="0.01"
              min="0"
              value={formData.stockMinimo}
              onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
              required
            />

            <Input
              label="Precio Base"
              type="number"
              step="0.01"
              min="0"
              value={formData.precioBase}
              onChange={(e) => setFormData({ ...formData, precioBase: e.target.value })}
              required
            />

            <Input
              label="% THC (opcional)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.thc}
              onChange={(e) => setFormData({ ...formData, thc: e.target.value })}
              placeholder="Ej: 22.5"
            />

            <Input
              label="% CBD (opcional)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.cbd}
              onChange={(e) => setFormData({ ...formData, cbd: e.target.value })}
              placeholder="Ej: 0.8"
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
              <textarea
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción del producto..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
            </Button>
            <Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Movimientos de Stock */}
      <Modal
        isOpen={showMovimientos}
        onClose={() => setShowMovimientos(false)}
        title={`Movimientos de ${productoSeleccionado?.nombre}`}
        size="xl"
      >
        {productoSeleccionado && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Stock Actual</p>
                  <p className="text-lg font-bold">{productoSeleccionado.stockActual}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Stock Mínimo</p>
                  <p className="text-lg font-bold">{productoSeleccionado.stockMinimo}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Precio</p>
                  <p className="text-lg font-bold">{formatCurrency(productoSeleccionado.precioBase)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Valor Total</p>
                  <p className="text-lg font-bold text-success-600">
                    {formatCurrency(productoSeleccionado.stockActual * productoSeleccionado.precioBase)}
                  </p>
                </div>
              </div>
            </div>

            {movimientosProducto.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No hay movimientos registrados para este producto
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Stock Resultante</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosProducto.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">
                        {new Date(mov.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            mov.tipo === "INGRESO" || mov.tipo === "COSECHA"
                              ? "success"
                              : mov.tipo === "EGRESO"
                              ? "danger"
                              : "default"
                          }
                        >
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {mov.cantidad > 0 ? "+" : ""}
                        {mov.cantidad}
                      </TableCell>
                      <TableCell className="text-sm">{mov.motivo}</TableCell>
                      <TableCell className="text-right font-medium">
                        {mov.stockNuevo}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </Modal>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setProductoToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar el producto "${productoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
