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
import { Plus, Package, Search, Edit } from "lucide-react";
import { getStockStatus } from "@/lib/utils";
import type { Producto } from "@/lib/types";
import { mockStorage } from "@/lib/mockData";
import Modal from "@/components/ui/Modal";

export default function StockPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cantidadActual: "",
    stockMinimo: "",
    precioUnitario: "",
  });

  useEffect(() => {
    loadProductos();
  }, []);

  useEffect(() => {
    filterProductos();
  }, [searchTerm, productos]);

  const loadProductos = () => {
    const productosData = mockStorage.getProductos();
    setProductos(productosData);
  };

  const filterProductos = () => {
    if (!searchTerm) {
      setFilteredProductos(productos);
      return;
    }

    const filtered = productos.filter((p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProductos(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        mockStorage.updateProducto(editingId, {
          nombre: formData.nombre,
          descripcion: formData.descripcion || "",
          cantidadActual: parseInt(formData.cantidadActual),
          stockMinimo: parseInt(formData.stockMinimo),
          precioUnitario: parseFloat(formData.precioUnitario),
        });
      } else {
        mockStorage.saveProducto({
          nombre: formData.nombre,
          descripcion: formData.descripcion || "",
          cantidadActual: parseInt(formData.cantidadActual),
          stockMinimo: parseInt(formData.stockMinimo),
          precioUnitario: parseFloat(formData.precioUnitario),
        });
      }

      setFormData({
        nombre: "",
        descripcion: "",
        cantidadActual: "",
        stockMinimo: "",
        precioUnitario: "",
      });

      setShowForm(false);
      setEditingId(null);
      loadProductos();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      cantidadActual: producto.cantidadActual.toString(),
      stockMinimo: producto.stockMinimo.toString(),
      precioUnitario: producto.precioUnitario.toString(),
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      cantidadActual: "",
      stockMinimo: "",
      precioUnitario: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusBadge = (producto: Producto) => {
    const status = getStockStatus(producto.cantidadActual, producto.stockMinimo);

    if (status === "critico") {
      return <Badge variant="danger">Crítico</Badge>;
    } else if (status === "bajo") {
      return <Badge variant="warning">Bajo</Badge>;
    } else {
      return <Badge variant="success">OK</Badge>;
    }
  };

  return (
    <div>
      <Header title="Stock e Insumos" subtitle="Control de inventario (Modo Demo)" />

      <div className="p-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Inventario de Productos</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => setShowForm(!showForm)} size="md">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            {filteredProductos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">
                  {searchTerm
                    ? "No se encontraron productos"
                    : "No hay productos registrados"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">
                        {producto.nombre}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {producto.descripcion || "-"}
                      </TableCell>
                      <TableCell>{producto.cantidadActual}</TableCell>
                      <TableCell>{producto.stockMinimo}</TableCell>
                      <TableCell>{getStatusBadge(producto)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(producto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCancelEdit}
        title={editingId ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del Producto"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Guantes de látex"
              required
            />

            <Input
              label="Descripción (opcional)"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Detalles adicionales"
            />

            <Input
              label="Cantidad Actual"
              type="number"
              min="0"
              value={formData.cantidadActual}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cantidadActual: e.target.value,
                })
              }
              placeholder="0"
              required
            />

            <Input
              label="Stock Mínimo"
              type="number"
              min="0"
              value={formData.stockMinimo}
              onChange={(e) =>
                setFormData({ ...formData, stockMinimo: e.target.value })
              }
              placeholder="0"
              required
            />

            <Input
              label="Precio Unitario"
              type="number"
              step="0.01"
              min="0"
              value={formData.precioUnitario}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  precioUnitario: e.target.value,
                })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex gap-2 mt-6">
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
              onClick={handleCancelEdit}
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
