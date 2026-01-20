"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Plus, DollarSign, Edit, Trash2, Eye, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Venta, ItemVenta, Socio, Producto, EstadoPagoVenta } from "@/lib/types";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import Modal from "@/components/ui/Modal";
import {
  mockVentas,
  mockItemsVenta,
  mockSocios,
  mockProductos,
} from "@/lib/mockData";

interface VentaConItems extends Venta {
  items: ItemVenta[];
  socio?: Socio;
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<VentaConItems[]>([]);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaConItems | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado del formulario de venta
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split("T")[0],
    socioId: "",
    metodoPago: "EFECTIVO" as const,
    descuento: "0",
    notas: "",
  });

  // Items de la venta actual
  const [items, setItems] = useState<{
    productoId: string;
    cantidad: string;
    precioUnitario: string;
  }[]>([]);

  const [stats, setStats] = useState({
    totalDia: 0,
    totalMes: 0,
    totalGeneral: 0,
    cantidadVentas: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [ventas]);

  const loadData = () => {
    // Cargar socios
    setSocios(mockSocios);

    // Cargar productos
    setProductos(mockProductos);

    // Cargar ventas con sus items y socios
    const ventasConItems: VentaConItems[] = mockVentas.map((venta) => {
      const items = mockItemsVenta.filter((item) => item.ventaId === venta.id);
      const socio = mockSocios.find((s) => s.id === venta.socioId);
      return { ...venta, items, socio };
    });
    setVentas(ventasConItems);
  };

  const calculateStats = useCallback(() => {
    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const totalDia = ventas
      .filter((v) => v.fecha >= dayStart && v.fecha <= dayEnd)
      .reduce((sum, v) => sum + v.total, 0);

    const totalMes = ventas
      .filter((v) => v.fecha >= monthStart && v.fecha <= monthEnd)
      .reduce((sum, v) => sum + v.total, 0);

    const totalGeneral = ventas.reduce((sum, v) => sum + v.total, 0);
    const cantidadVentas = ventas.length;

    setStats({ totalDia, totalMes, totalGeneral, cantidadVentas });
  }, [ventas]);

  const agregarItem = () => {
    setItems([...items, { productoId: "", cantidad: "1", precioUnitario: "0" }]);
  };

  const eliminarItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const actualizarItem = (
    index: number,
    field: "productoId" | "cantidad" | "precioUnitario",
    value: string
  ) => {
    const nuevosItems = [...items];
    nuevosItems[index][field] = value;

    // Si cambió el producto, actualizar precio automáticamente
    if (field === "productoId") {
      const producto = productos.find((p) => p.id === value);
      if (producto) {
        nuevosItems[index].precioUnitario = producto.precioBase.toString();
      }
    }

    setItems(nuevosItems);
  };

  const calcularTotales = () => {
    const subtotal = items.reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precioUnitario) || 0;
      return sum + cantidad * precio;
    }, 0);

    const descuento = parseFloat(formData.descuento) || 0;
    const total = subtotal - descuento;

    return { subtotal, descuento, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Debe agregar al menos un producto");
      return;
    }

    setSaving(true);

    try {
      const { subtotal, descuento, total } = calcularTotales();

      const nuevaVenta: VentaConItems = {
        id: editingId || `venta-${Date.now()}`,
        numero: ventas.length + 1,
        fecha: new Date(formData.fecha),
        socioId: formData.socioId,
        subtotal,
        descuento,
        total,
        estadoPago: "PAGADO", // Por defecto
        montoPagado: total,
        saldoPendiente: 0,
        metodoPago: formData.metodoPago,
        entregado: true,
        fechaEntrega: new Date(formData.fecha),
        notas: formData.notas,
        items: items.map((item, i) => ({
          id: `item-${Date.now()}-${i}`,
          ventaId: editingId || `venta-${Date.now()}`,
          productoId: item.productoId,
          descripcion:
            productos.find((p) => p.id === item.productoId)?.nombre || "",
          cantidad: parseFloat(item.cantidad),
          precioUnitario: parseFloat(item.precioUnitario),
          subtotal:
            parseFloat(item.cantidad) * parseFloat(item.precioUnitario),
          descuento: 0,
          total: parseFloat(item.cantidad) * parseFloat(item.precioUnitario),
        })),
        socio: socios.find((s) => s.id === formData.socioId),
      };

      // Aquí iría la lógica para guardar en Firebase
      // Por ahora solo actualizamos el estado local
      if (editingId) {
        setVentas(ventas.map((v) => (v.id === editingId ? nuevaVenta : v)));
      } else {
        setVentas([nuevaVenta, ...ventas]);
      }

      // Resetear formulario
      setFormData({
        fecha: new Date().toISOString().split("T")[0],
        socioId: "",
        metodoPago: "EFECTIVO",
        descuento: "0",
        notas: "",
      });
      setItems([]);
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error guardando venta:", error);
      alert("Error al guardar la venta.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (venta: VentaConItems) => {
    setFormData({
      fecha: venta.fecha.toISOString().split("T")[0],
      socioId: venta.socioId,
      metodoPago: (venta.metodoPago || "EFECTIVO") as any,
      descuento: venta.descuento.toString(),
      notas: venta.notas || "",
    });
    setItems(
      venta.items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad.toString(),
        precioUnitario: item.precioUnitario.toString(),
      }))
    );
    setEditingId(venta.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      fecha: new Date().toISOString().split("T")[0],
      socioId: "",
      metodoPago: "EFECTIVO",
      descuento: "0",
      notas: "",
    });
    setItems([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (venta: VentaConItems) => {
    const confirmDelete = window.confirm(
      `¿Eliminar la venta #${venta.numero}?`
    );
    if (!confirmDelete) return;
    setVentas(ventas.filter((v) => v.id !== venta.id));
  };

  const verDetalle = (venta: VentaConItems) => {
    setVentaSeleccionada(venta);
    setShowDetalle(true);
  };

  const getEstadoPagoBadge = (estado: EstadoPagoVenta) => {
    const variants: Record<EstadoPagoVenta, "success" | "warning" | "danger"> = {
      PAGADO: "success",
      PARCIAL: "warning",
      PENDIENTE: "danger",
    };
    return <Badge variant={variants[estado]}>{estado}</Badge>;
  };

  const { subtotal: subtotalForm, total: totalForm } = calcularTotales();

  return (
    <div>
      <Header
        title="Gestión de Ventas"
        subtitle="Registro completo de ventas con items y socios"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Ventas Hoy
                  </p>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Este Mes
                  </p>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total General
                  </p>
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

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    # Ventas
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {stats.cantidadVentas}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Ventas */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Historial de Ventas</CardTitle>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setShowForm(true);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Venta
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ventas.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay ventas registradas</p>
              </div>
            ) : (
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => (
                    <TableRow key={venta.id}>
                      <TableCell className="font-medium">
                        #{venta.numero}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDate(venta.fecha)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {venta.socio?.nombre || "Sin cliente"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                        {venta.items.length} item(s)
                      </TableCell>
                      <TableCell>
                        {getEstadoPagoBadge(venta.estadoPago)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-success-600 dark:text-success-400">
                        {formatCurrency(venta.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => verDetalle(venta)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(venta)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(venta)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Nueva/Editar Venta */}
      <Modal
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? "Editar Venta" : "Nueva Venta"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Datos Generales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                label="Cliente/Socio"
                value={formData.socioId}
                onChange={(e) =>
                  setFormData({ ...formData, socioId: e.target.value })
                }
                options={[
                  { value: "", label: "Seleccionar cliente..." },
                  ...socios.map((s) => ({ value: s.id, label: s.nombre })),
                ]}
                required
              />

              <Select
                label="Método de Pago"
                value={formData.metodoPago}
                onChange={(e) =>
                  setFormData({ ...formData, metodoPago: e.target.value as any })
                }
                options={[
                  { value: "EFECTIVO", label: "Efectivo" },
                  { value: "TRANSFERENCIA", label: "Transferencia" },
                  { value: "MERCADOPAGO", label: "MercadoPago" },
                  { value: "CUENTA_CORRIENTE", label: "Cuenta Corriente" },
                ]}
              />
            </div>

            {/* Items de Venta */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Productos</h3>
                <Button type="button" size="sm" onClick={agregarItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-5">
                      <Select
                        label={index === 0 ? "Producto" : undefined}
                        value={item.productoId}
                        onChange={(e) =>
                          actualizarItem(index, "productoId", e.target.value)
                        }
                        options={[
                          { value: "", label: "Seleccionar..." },
                          ...productos.map((p) => ({
                            value: p.id,
                            label: `${p.nombre} (Stock: ${p.stockActual}${p.unidadMedida === 'GRAMOS' ? 'g' : 'u'})`,
                          })),
                        ]}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        label={index === 0 ? "Cantidad" : undefined}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarItem(index, "cantidad", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-3">
                      <Input
                        label={index === 0 ? "Precio Unit." : undefined}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.precioUnitario}
                        onChange={(e) =>
                          actualizarItem(index, "precioUnitario", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      {index === 0 && (
                        <label className="block text-sm font-medium mb-1">
                          Subtotal
                        </label>
                      )}
                      <div className="h-10 flex items-center justify-end font-medium">
                        {formatCurrency(
                          parseFloat(item.cantidad || "0") *
                            parseFloat(item.precioUnitario || "0")
                        )}
                      </div>
                    </div>

                    <div className="col-span-12 md:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => eliminarItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-4">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotalForm)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Descuento:</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.descuento}
                    onChange={(e) =>
                      setFormData({ ...formData, descuento: e.target.value })
                    }
                    className="w-32 text-right"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span className="text-success-600">{formatCurrency(totalForm)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Notas (opcional)
              </label>
              <textarea
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2"
                rows={2}
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button type="submit" disabled={saving || items.length === 0}>
              {saving
                ? "Guardando..."
                : editingId
                ? "Actualizar Venta"
                : "Guardar Venta"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detalle Venta */}
      <Modal
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
        title={`Detalle de Venta #${ventaSeleccionada?.numero}`}
        size="lg"
      >
        {ventaSeleccionada && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fecha</p>
                <p className="font-medium">{formatDate(ventaSeleccionada.fecha)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Cliente</p>
                <p className="font-medium">{ventaSeleccionada.socio?.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Estado</p>
                {getEstadoPagoBadge(ventaSeleccionada.estadoPago)}
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Método Pago</p>
                <p className="font-medium">{ventaSeleccionada.metodoPago}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Productos</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventaSeleccionada.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell className="text-right">{item.cantidad}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.precioUnitario)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(ventaSeleccionada.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Descuento:</span>
                  <span>-{formatCurrency(ventaSeleccionada.descuento)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span className="text-success-600">
                    {formatCurrency(ventaSeleccionada.total)}
                  </span>
                </div>
              </div>
            </div>

            {ventaSeleccionada.notas && (
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Notas</p>
                <p className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  {ventaSeleccionada.notas}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
