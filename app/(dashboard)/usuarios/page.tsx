"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  Plus,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Shield,
  Edit,
  Trash2,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import { formatDate, formatUsername } from "@/lib/utils";
import type { Usuario, RolUsuario } from "@/lib/types";
import { usuariosService } from "@/lib/supabaseService";

export default function UsuariosPage() {
  // ============================================================================
  // ESTADO
  // ============================================================================

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetalles, setShowDetalles] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");

  // Estadísticas
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosInactivos: 0,
    admins: 0,
    gerentes: 0,
    vendedores: 0,
    operadores: 0,
  });

  // Formulario
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombre: "",
    apellido: "",
    email: "",
    rol: "VENDEDOR" as RolUsuario,
    telefono: "",
    activo: true,
    notas: "",
  });

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    loadUsuarios();
  }, []);

  // ============================================================================
  // FUNCIONES
  // ============================================================================

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const usuariosFromFirestore = await usuariosService.getAll();
      setUsuarios(usuariosFromFirestore);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = useCallback(() => {
    const totalUsuarios = usuarios.length;
    const usuariosActivos = usuarios.filter((u) => u.activo).length;
    const usuariosInactivos = usuarios.filter((u) => !u.activo).length;
    const admins = usuarios.filter((u) => u.rol === "ADMIN").length;
    const gerentes = usuarios.filter((u) => u.rol === "GERENTE").length;
    const vendedores = usuarios.filter((u) => u.rol === "VENDEDOR").length;
    const operadores = usuarios.filter((u) => u.rol === "OPERADOR").length;

    setStats({
      totalUsuarios,
      usuariosActivos,
      usuariosInactivos,
      admins,
      gerentes,
      vendedores,
      operadores,
    });
  }, [usuarios]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const getRolBadge = (rol: RolUsuario) => {
    switch (rol) {
      case "ADMIN":
        return <Badge variant="danger"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case "GERENTE":
        return <Badge variant="warning"><Shield className="h-3 w-3 mr-1" />Gerente</Badge>;
      case "VENDEDOR":
        return <Badge variant="success">Vendedor</Badge>;
      case "OPERADOR":
        return <Badge variant="default">Operador</Badge>;
      default:
        return <Badge variant="default">{rol}</Badge>;
    }
  };

  const getEstadoBadge = (activo: boolean) => {
    return activo ? (
      <Badge variant="success"><UserCheck className="h-3 w-3 mr-1" />Activo</Badge>
    ) : (
      <Badge variant="danger"><UserX className="h-3 w-3 mr-1" />Inactivo</Badge>
    );
  };

  const getRolDescripcion = (rol: RolUsuario): string => {
    switch (rol) {
      case "ADMIN":
        return "Acceso total al sistema";
      case "GERENTE":
        return "Gestión de ventas, stock, gastos y reportes";
      case "VENDEDOR":
        return "Solo ventas y consulta de stock";
      case "OPERADOR":
        return "Ventas, stock y productos";
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Actualizar usuario existente en Supabase
        await usuariosService.update(editingId, {
          username: formData.username,
          nombre: formData.nombre,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          rol: formData.rol,
          telefono: formData.telefono || undefined,
          activo: formData.activo,
          notas: formData.notas || undefined,
        });

        // Actualizar estado local
        setUsuarios(usuarios.map(u =>
          u.id === editingId
            ? {
                ...u,
                username: formData.username,
                nombre: formData.nombre,
                apellido: formData.apellido || undefined,
                email: formData.email || undefined,
                rol: formData.rol,
                telefono: formData.telefono || undefined,
                activo: formData.activo,
                notas: formData.notas || undefined,
              }
            : u
        ));
      } else {
        // Crear nuevo usuario en Supabase
        if (!formData.password) {
          alert("La contraseña es requerida para crear un nuevo usuario");
          setSaving(false);
          return;
        }

        const nuevoUsuario = await usuariosService.create({
          username: formData.username,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido || undefined,
          email: formData.email || undefined,
          rol: formData.rol,
          telefono: formData.telefono || undefined,
          activo: formData.activo,
          notas: formData.notas || undefined,
        });

        // Actualizar estado local
        setUsuarios([...usuarios, nuevoUsuario]);
      }

      resetForm();
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);
      alert(error.message || "Error al guardar usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setFormData({
      username: usuario.username,
      password: "",
      nombre: usuario.nombre,
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      rol: usuario.rol,
      telefono: usuario.telefono || "",
      activo: usuario.activo,
      notas: usuario.notas || "",
    });
    setEditingId(usuario.id);
    setShowForm(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!usuarioToDelete) return;

    setDeleting(true);
    try {
      // Eliminar usuario en Supabase (marca como inactivo)
      await usuariosService.delete(usuarioToDelete.id);

      // Actualizar estado local
      setUsuarios(usuarios.map(u =>
        u.id === usuarioToDelete.id
          ? { ...u, activo: false }
          : u
      ));

      setShowConfirmDelete(false);
      setUsuarioToDelete(null);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Error al eliminar usuario");
    } finally {
      setDeleting(false);
    }
  };

  const handleVerDetalles = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setShowDetalles(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      nombre: "",
      apellido: "",
      email: "",
      rol: "VENDEDOR" as RolUsuario,
      telefono: "",
      activo: true,
      notas: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ============================================================================
  // FILTROS
  // ============================================================================

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchSearch = usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRol = filtroRol === "TODOS" || usuario.rol === filtroRol;
    const matchEstado = filtroEstado === "TODOS" ||
      (filtroEstado === "ACTIVO" && usuario.activo) ||
      (filtroEstado === "INACTIVO" && !usuario.activo);

    return matchSearch && matchRol && matchEstado;
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Usuarios"
        subtitle="Gestión de usuarios y permisos del sistema"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ====================================================================== */}
        {/* ESTADÍSTICAS */}
        {/* ====================================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 justify-items-center">
          <Card className="w-full max-w-[260px]">
            <div className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Usuarios
                </p>
                <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                  {stats.totalUsuarios}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-primary-50 dark:bg-primary-900/30">
                <UsersIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Card>

          <Card className="w-full max-w-[260px]">
            <div className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Usuarios Activos
                </p>
                <p className="text-3xl font-semibold text-green-600 dark:text-green-400">
                  {stats.usuariosActivos}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-green-50 dark:bg-green-900/30">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="w-full max-w-[260px]">
            <div className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Administradores
                </p>
                <p className="text-3xl font-semibold text-red-600 dark:text-red-400">
                  {stats.admins}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-red-50 dark:bg-red-900/30">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          <Card className="w-full max-w-[260px]">
            <div className="flex items-start justify-between p-5">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Gerentes
                </p>
                <p className="text-3xl font-semibold text-yellow-600 dark:text-yellow-400">
                  {stats.gerentes}
                </p>
              </div>
              <div className="rounded-xl p-2.5 bg-yellow-50 dark:bg-yellow-900/30">
                <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* ====================================================================== */}
        {/* TABLA DE USUARIOS */}
        {/* ====================================================================== */}

        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Lista de Usuarios
                </h2>
                <Badge variant="default">{usuariosFiltrados.length}</Badge>
              </div>

              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <Input
                placeholder="Buscar por nombre, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                options={[
                  { value: "TODOS", label: "Todos los roles" },
                  { value: "ADMIN", label: "Administradores" },
                  { value: "GERENTE", label: "Gerentes" },
                  { value: "VENDEDOR", label: "Vendedores" },
                  { value: "OPERADOR", label: "Operadores" },
                ]}
              />

              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                options={[
                  { value: "TODOS", label: "Todos los estados" },
                  { value: "ACTIVO", label: "Solo activos" },
                  { value: "INACTIVO", label: "Solo inactivos" },
                ]}
              />
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-slate-900 dark:text-slate-100">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatUsername(usuario.username)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {formatUsername(usuario.username)}
                        </code>
                      </TableCell>
                      <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                      <TableCell>{getEstadoBadge(usuario.activo)}</TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {usuario.ultimoAcceso ? formatDate(usuario.ultimoAcceso) : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalles(usuario)}
                          >
                            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(usuario)}
                          >
                            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(usuario)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {usuariosFiltrados.length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No se encontraron usuarios
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ====================================================================== */}
      {/* MODAL - DETALLES DEL USUARIO */}
      {/* ====================================================================== */}

      <Modal
        isOpen={showDetalles}
        onClose={() => setShowDetalles(false)}
        title="Detalles del Usuario"
        size="lg"
      >
        {usuarioSeleccionado && (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Nombre Completo
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Nombre de Usuario
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  <code className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {formatUsername(usuarioSeleccionado.username)}
                  </code>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Email
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {usuarioSeleccionado.email || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Teléfono
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {usuarioSeleccionado.telefono || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Rol
                </p>
                <div className="mt-1">{getRolBadge(usuarioSeleccionado.rol)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Estado
                </p>
                <div className="mt-1">{getEstadoBadge(usuarioSeleccionado.activo)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Fecha de Creación
                </p>
                <p className="text-slate-900 dark:text-slate-100">
                  {formatDate(usuarioSeleccionado.fechaCreacion)}
                </p>
              </div>
            </div>

            {/* Permisos del rol */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permisos del Rol
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getRolDescripcion(usuarioSeleccionado.rol)}
              </p>
            </div>

            {/* Último acceso */}
            {usuarioSeleccionado.ultimoAcceso && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Último Acceso
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(usuarioSeleccionado.ultimoAcceso)}
                </p>
              </div>
            )}

            {/* Notas */}
            {usuarioSeleccionado.notas && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Notas
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {usuarioSeleccionado.notas}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ====================================================================== */}
      {/* MODAL - FORMULARIO DE USUARIO */}
      {/* ====================================================================== */}

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? "Editar Usuario" : "Nuevo Usuario"}
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

            {/* Usuario */}
            <Input
              label="Nombre de Usuario"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Ej: juanperez"
              required
            />

            {/* Contraseña */}
            <Input
              label={editingId ? "Contraseña (dejar vacío para mantener actual)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required={!editingId}
            />

            {/* Email */}
            <Input
              label="Email (opcional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@thegardenboys.com"
            />

            {/* Teléfono */}
            <Input
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+54 9 11 1234-5678"
            />

            {/* Rol */}
            <Select
              label="Rol"
              value={formData.rol}
              onChange={(e) =>
                setFormData({ ...formData, rol: e.target.value as RolUsuario })
              }
              options={[
                { value: "ADMIN", label: "Administrador - Acceso total" },
                { value: "GERENTE", label: "Gerente - Gestión completa" },
                { value: "VENDEDOR", label: "Vendedor - Ventas y stock" },
                { value: "OPERADOR", label: "Operador - Ventas, stock y productos" },
              ]}
              required
            />

            {/* Checkbox: Activo */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="activo"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Usuario activo
              </label>
            </div>
          </div>

          {/* Notas */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-slate-100"
              placeholder="Información adicional sobre el usuario..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ====================================================================== */}
      {/* DIALOG - CONFIRMAR ELIMINACIÓN */}
      {/* ====================================================================== */}

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setUsuarioToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de eliminar al usuario ${usuarioToDelete?.nombre} ${usuarioToDelete?.apellido || ""}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
