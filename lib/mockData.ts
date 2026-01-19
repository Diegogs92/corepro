// MODO DEMO - Datos mock para pruebas sin Firebase
import type { Venta, Producto, Gasto } from "./types";

// Datos de ejemplo precargados
export const mockVentas: Venta[] = [
  {
    id: "1",
    fecha: new Date(2026, 0, 17),
    concepto: "Consulta médica - Dr. García",
    monto: 8000,
    medioPago: "efectivo",
    createdAt: new Date(2026, 0, 17),
  },
  {
    id: "2",
    fecha: new Date(2026, 0, 17),
    concepto: "Venta de insumos médicos",
    monto: 12000,
    medioPago: "transferencia",
    createdAt: new Date(2026, 0, 17),
  },
  {
    id: "3",
    fecha: new Date(2026, 0, 16),
    concepto: "Donación",
    monto: 5000,
    medioPago: "efectivo",
    createdAt: new Date(2026, 0, 16),
  },
  {
    id: "4",
    fecha: new Date(2026, 0, 16),
    concepto: "Servicio de atención",
    monto: 7500,
    medioPago: "debito",
    createdAt: new Date(2026, 0, 16),
  },
];

export const mockProductos: Producto[] = [
  {
    id: "1",
    nombre: "Alcohol en gel",
    descripcion: "500ml",
    cantidadActual: 45,
    stockMinimo: 30,
    precioUnitario: 2500,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  },
  {
    id: "2",
    nombre: "Barbijos quirúrgicos",
    descripcion: "Caja x 50 unidades",
    cantidadActual: 18,
    stockMinimo: 25,
    precioUnitario: 8000,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  },
  {
    id: "3",
    nombre: "Guantes de látex - Talle M",
    descripcion: "Caja x 100 unidades",
    cantidadActual: 15,
    stockMinimo: 20,
    precioUnitario: 15000,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  },
  {
    id: "4",
    nombre: "Jeringas 5ml",
    descripcion: "Descartables",
    cantidadActual: 0,
    stockMinimo: 15,
    precioUnitario: 500,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  },
  {
    id: "5",
    nombre: "Gasas estériles",
    descripcion: "Paquete x 100",
    cantidadActual: 65,
    stockMinimo: 40,
    precioUnitario: 3500,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  },
];

export const mockGastos: Gasto[] = [
  {
    id: "1",
    fecha: new Date(2026, 0, 17),
    categoria: "servicios",
    concepto: "Pago de luz y agua - Enero 2026",
    monto: 25000,
    createdAt: new Date(2026, 0, 17),
  },
  {
    id: "2",
    fecha: new Date(2026, 0, 15),
    categoria: "suministros",
    concepto: "Material de oficina",
    monto: 8500,
    createdAt: new Date(2026, 0, 15),
  },
  {
    id: "3",
    fecha: new Date(2026, 0, 10),
    categoria: "personal",
    concepto: "Honorarios Dr. García",
    monto: 45000,
    createdAt: new Date(2026, 0, 10),
  },
  {
    id: "4",
    fecha: new Date(2026, 0, 8),
    categoria: "mantenimiento",
    concepto: "Reparación de equipo médico",
    monto: 12000,
    createdAt: new Date(2026, 0, 8),
  },
];

// Almacenamiento en localStorage para persistencia temporal
class MockStorage {
  private getKey(collection: string): string {
    return `corepro_demo_${collection}`;
  }

  getVentas(): Venta[] {
    if (typeof window === "undefined") return mockVentas;
    const stored = localStorage.getItem(this.getKey("ventas"));
    if (!stored) {
      localStorage.setItem(this.getKey("ventas"), JSON.stringify(mockVentas));
      return mockVentas;
    }
    return JSON.parse(stored, (key, value) => {
      if (key === "fecha" || key === "createdAt") return new Date(value);
      return value;
    });
  }

  saveVenta(venta: Omit<Venta, "id">): Venta {
    const ventas = this.getVentas();
    const newVenta: Venta = {
      ...venta,
      id: Date.now().toString(),
    };
    ventas.unshift(newVenta);
    localStorage.setItem(this.getKey("ventas"), JSON.stringify(ventas));
    return newVenta;
  }

  getProductos(): Producto[] {
    if (typeof window === "undefined") return mockProductos;
    const stored = localStorage.getItem(this.getKey("productos"));
    if (!stored) {
      localStorage.setItem(
        this.getKey("productos"),
        JSON.stringify(mockProductos)
      );
      return mockProductos;
    }
    return JSON.parse(stored, (key, value) => {
      if (key === "createdAt" || key === "updatedAt") return new Date(value);
      return value;
    });
  }

  saveProducto(producto: Omit<Producto, "id" | "createdAt" | "updatedAt">): Producto {
    const productos = this.getProductos();
    const newProducto: Producto = {
      ...producto,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    productos.push(newProducto);
    localStorage.setItem(this.getKey("productos"), JSON.stringify(productos));
    return newProducto;
  }

  updateProducto(id: string, updates: Partial<Producto>): Producto | null {
    const productos = this.getProductos();
    const index = productos.findIndex((p) => p.id === id);
    if (index === -1) return null;

    productos[index] = {
      ...productos[index],
      ...updates,
      updatedAt: new Date(),
    };
    localStorage.setItem(this.getKey("productos"), JSON.stringify(productos));
    return productos[index];
  }

  getGastos(): Gasto[] {
    if (typeof window === "undefined") return mockGastos;
    const stored = localStorage.getItem(this.getKey("gastos"));
    if (!stored) {
      localStorage.setItem(this.getKey("gastos"), JSON.stringify(mockGastos));
      return mockGastos;
    }
    return JSON.parse(stored, (key, value) => {
      if (key === "fecha" || key === "createdAt") return new Date(value);
      return value;
    });
  }

  saveGasto(gasto: Omit<Gasto, "id">): Gasto {
    const gastos = this.getGastos();
    const newGasto: Gasto = {
      ...gasto,
      id: Date.now().toString(),
    };
    gastos.unshift(newGasto);
    localStorage.setItem(this.getKey("gastos"), JSON.stringify(gastos));
    return newGasto;
  }
}

export const mockStorage = new MockStorage();
