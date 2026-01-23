"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Plus, Eye, Edit, Trash2, Leaf } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type {
  Cama,
  Cultivo,
  EstadoCultivo,
  EtapaCultivo,
  Genetica,
  Maceta,
  RegistroCultivo,
  TipoRegistroCultivo,
  TipoUbicacionCultivo,
} from "@/lib/types";
import {
  camasService,
  cultivosService,
  cultivosServiceExtended,
  geneticasService,
  macetasService,
  registrosCultivoService,
} from "@/lib/supabaseService";
import { useAuth } from "@/contexts/AuthContextSupabase";

const ETAPAS: EtapaCultivo[] = [
  "GERMINACION",
  "PLANTULA",
  "VEGETATIVO",
  "FLORACION",
  "COSECHA",
  "SECADO_CURADO",
];

const ESTADOS: EstadoCultivo[] = ["ACTIVO", "PAUSADO", "FINALIZADO"];

const TIPOS_UBICACION: TipoUbicacionCultivo[] = ["CAMA", "MACETA"];

const REGISTRO_TABS: { key: TipoRegistroCultivo; label: string }[] = [
  { key: "ETAPA", label: "Etapas del cultivo" },
  { key: "LUZ_AMBIENTE", label: "Luz y ambiente" },
  { key: "RIEGO_NUTRICION", label: "Riego y nutricion" },
  { key: "SANIDAD", label: "Sanidad" },
  { key: "GENERAL", label: "General" },
];

interface CultivoConRelaciones extends Cultivo {
  cama?: Cama;
  maceta?: Maceta;
  genetica?: Genetica;
}

export default function CultivosPage() {
  const { user } = useAuth();

  const [cultivos, setCultivos] = useState<CultivoConRelaciones[]>([]);
  const [camas, setCamas] = useState<Cama[]>([]);
  const [macetas, setMacetas] = useState<Maceta[]>([]);
  const [geneticas, setGeneticas] = useState<Genetica[]>([]);
  const [registros, setRegistros] = useState<RegistroCultivo[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [showDetalle, setShowDetalle] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showRegistroForm, setShowRegistroForm] = useState(false);
  const [showCambioEtapa, setShowCambioEtapa] = useState(false);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [cultivoSeleccionado, setCultivoSeleccionado] = useState<CultivoConRelaciones | null>(null);
  const [registroTab, setRegistroTab] = useState<TipoRegistroCultivo>("ETAPA");
  const [dragPayload, setDragPayload] = useState<
    | { type: "new"; origen: "palette" }
    | { type: "cultivo"; cultivoId: string }
    | null
  >(null);
  const [showCamaForm, setShowCamaForm] = useState(false);
  const [showMacetaForm, setShowMacetaForm] = useState(false);
  const [camaForm, setCamaForm] = useState({
    nombre: "",
    ubicacion: "",
    capacidad: "",
    anchoCm: "",
    largoCm: "",
    altoCm: "",
    notas: "",
  });
  const [macetaForm, setMacetaForm] = useState({
    nombre: "",
    camaId: "",
    volumenLitros: "",
    ubicacion: "",
    notas: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    estado: "TODOS",
    etapa: "TODOS",
    tipoUbicacion: "TODOS",
    ubicacionId: "",
    geneticaId: "",
    ordenFechaInicio: "DESC" as "ASC" | "DESC",
  });

  const [formData, setFormData] = useState({
    nombre: "",
    tipoUbicacion: "CAMA" as TipoUbicacionCultivo,
    camaId: "",
    macetaId: "",
    geneticaId: "",
    etapaActual: "VEGETATIVO" as EtapaCultivo,
    estado: "ACTIVO" as EstadoCultivo,
    fechaInicio: new Date().toISOString().split("T")[0],
    fechaFin: "",
    notas: "",
  });

  const [registroForm, setRegistroForm] = useState({
    tipo: "GENERAL" as TipoRegistroCultivo,
    fecha: new Date().toISOString().slice(0, 16),
    notas: "",
    horasLuz: "",
    horasOscuridad: "",
    ppfd: "",
    temperaturaDia: "",
    temperaturaNoche: "",
    humedad: "",
    volumenAgua: "",
    ph: "",
    ec: "",
    fertilizante: "",
    plagaHongo: "",
    severidad: "",
    tratamiento: "",
    resultado: "",
    etapa: "VEGETATIVO" as EtapaCultivo,
  });

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      const [cultivosData, camasData, macetasData, geneticasData] = await Promise.all([
        cultivosService.getAll(),
        camasService.getAll(),
        macetasService.getAll(),
        geneticasService.getAll(),
      ]);

      const camasMap = new Map(camasData.map((cama) => [cama.id, cama]));
      const macetasMap = new Map(macetasData.map((maceta) => [maceta.id, maceta]));
      const geneticasMap = new Map(geneticasData.map((genetica) => [genetica.id, genetica]));

      const cultivosConRelaciones = cultivosData.map((cultivo) => ({
        ...cultivo,
        cama: cultivo.camaId ? camasMap.get(cultivo.camaId) : undefined,
        maceta: cultivo.macetaId ? macetasMap.get(cultivo.macetaId) : undefined,
        genetica: cultivo.geneticaId ? geneticasMap.get(cultivo.geneticaId) : undefined,
      }));

      setCultivos(cultivosConRelaciones);
      setCamas(camasData);
      setMacetas(macetasData);
      setGeneticas(geneticasData);
    } catch (error) {
      console.error("Error cargando cultivos:", error);
      alert("Error cargando cultivos. Verifica la configuracion de Firebase.");
    }
  };

  const loadRegistros = useCallback(async (cultivoId: string) => {
    try {
      const data = await registrosCultivoService.query({ cultivoId });
      setRegistros(data);
    } catch (error) {
      console.error("Error cargando registros:", error);
      alert("Error cargando registros del cultivo.");
    }
  }, []);

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipoUbicacion: "CAMA",
      camaId: "",
      macetaId: "",
      geneticaId: "",
      etapaActual: "VEGETATIVO",
      estado: "ACTIVO",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: "",
      notas: "",
    });
    setEditingId(null);
  };

  const resetRegistroForm = () => {
    setRegistroForm({
      tipo: "GENERAL",
      fecha: new Date().toISOString().slice(0, 16),
      notas: "",
      horasLuz: "",
      horasOscuridad: "",
      ppfd: "",
      temperaturaDia: "",
      temperaturaNoche: "",
      humedad: "",
      volumenAgua: "",
      ph: "",
      ec: "",
      fertilizante: "",
      plagaHongo: "",
      severidad: "",
      tratamiento: "",
      resultado: "",
      etapa: "VEGETATIVO",
    });
  };

  const getEstadoBadge = (estado: EstadoCultivo) => {
    const variants = {
      ACTIVO: "success",
      PAUSADO: "warning",
      FINALIZADO: "default",
    } as const;
    return <Badge variant={variants[estado]}>{estado}</Badge>;
  };

  const getEtapaBadge = (etapa: EtapaCultivo) => {
    return <Badge variant="default">{etapa}</Badge>;
  };

  const filteredCultivos = useMemo(() => {
    let data = cultivos.filter((cultivo) => !cultivo.deletedAt);

    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (cultivo) =>
          cultivo.nombre.toLowerCase().includes(search) ||
          cultivo.codigoInterno?.toLowerCase().includes(search)
      );
    }

    if (filters.estado !== "TODOS") {
      data = data.filter((cultivo) => cultivo.estado === filters.estado);
    }

    if (filters.etapa !== "TODOS") {
      data = data.filter((cultivo) => cultivo.etapaActual === filters.etapa);
    }

    if (filters.tipoUbicacion !== "TODOS") {
      data = data.filter((cultivo) => cultivo.tipoUbicacion === filters.tipoUbicacion);
    }

    if (filters.ubicacionId) {
      data = data.filter((cultivo) => {
        if (cultivo.tipoUbicacion === "CAMA") return cultivo.camaId === filters.ubicacionId;
        if (cultivo.tipoUbicacion === "MACETA") return cultivo.macetaId === filters.ubicacionId;
        return false;
      });
    }

    if (filters.geneticaId) {
      data = data.filter((cultivo) => cultivo.geneticaId === filters.geneticaId);
    }

    data = [...data].sort((a, b) => {
      const aTime = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
      const bTime = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
      return filters.ordenFechaInicio === "ASC" ? aTime - bTime : bTime - aTime;
    });

    return data;
  }, [cultivos, filters]);

  const macetasOcupadas = useMemo(() => {
    const ocupadas = new Set<string>();
    cultivos.forEach((cultivo) => {
      if (
        cultivo.macetaId &&
        cultivo.estado === "ACTIVO" &&
        cultivo.id !== editingId &&
        !cultivo.deletedAt
      ) {
        ocupadas.add(cultivo.macetaId);
      }
    });
    return ocupadas;
  }, [cultivos, editingId]);

  const validateCultivo = async () => {
    const errors: string[] = [];

    if (!formData.nombre.trim()) errors.push("El nombre es obligatorio.");
    if (!formData.tipoUbicacion) errors.push("La ubicacion es obligatoria.");
    if (!formData.etapaActual) errors.push("La etapa actual es obligatoria.");
    if (!formData.estado) errors.push("El estado es obligatorio.");
    if (!formData.fechaInicio) errors.push("La fecha de inicio es obligatoria.");

    if (formData.tipoUbicacion === "CAMA") {
      if (!formData.camaId) errors.push("Debe seleccionar una cama.");
      if (formData.macetaId) errors.push("No se puede asignar maceta si es cama.");
    }

    if (formData.tipoUbicacion === "MACETA") {
      if (!formData.macetaId) errors.push("Debe seleccionar una maceta.");
      if (formData.camaId) errors.push("No se puede asignar cama si es maceta.");
    }

    if (formData.tipoUbicacion === "MACETA" && formData.estado === "ACTIVO") {
      const macetaId = formData.macetaId;
      if (macetaId) {
        const active = await cultivosService.query({ macetaId, estado: "ACTIVO" });
        const conflict = active.find(
          (cultivo) => cultivo.id !== editingId && !cultivo.deletedAt
        );
        if (conflict) errors.push("La maceta ya esta asignada a otro cultivo activo.");
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const errors = await validateCultivo();
      if (errors.length > 0) {
        alert(errors.join("\n"));
        return;
      }

      const now = new Date();
      const fechaInicio = new Date(formData.fechaInicio + "T00:00:00");
      const fechaFin = formData.fechaFin ? new Date(formData.fechaFin + "T00:00:00") : null;

      const previo = editingId ? cultivos.find((cultivo) => cultivo.id === editingId) : undefined;
      const payload: Omit<Cultivo, "id"> = {
        nombre: formData.nombre.trim(),
        codigoInterno: previo?.codigoInterno,
        tipoUbicacion: formData.tipoUbicacion,
        camaId: formData.tipoUbicacion === "CAMA" ? formData.camaId : null,
        macetaId: formData.tipoUbicacion === "MACETA" ? formData.macetaId : null,
        geneticaId: formData.geneticaId || null,
        etapaActual: formData.etapaActual,
        estado: formData.estado,
        fechaInicio,
        fechaFin,
        notas: formData.notas || undefined,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        createdBy: editingId ? undefined : user?.uid,
        updatedBy: user?.uid,
      };

      if (editingId) {
        await cultivosService.update(editingId, {
          ...payload,
          createdAt: previo?.createdAt || now,
          createdBy: previo?.createdBy,
        });

        if (previo) {
          if (previo.etapaActual !== formData.etapaActual) {
            await registrosCultivoService.create({
              cultivoId: editingId,
              tipo: "ETAPA",
              fecha: now,
              payload: {
                etapaAnterior: previo.etapaActual,
                etapaNueva: formData.etapaActual,
              },
              notas: "Cambio de etapa",
              createdAt: now,
              createdBy: user?.uid,
            });
          }

          const ubicacionPrevia = `${previo.tipoUbicacion}-${previo.camaId || previo.macetaId || ""}`;
          const ubicacionNueva = `${formData.tipoUbicacion}-${
            formData.tipoUbicacion === "CAMA" ? formData.camaId : formData.macetaId
          }`;

          if (ubicacionPrevia !== ubicacionNueva) {
            await registrosCultivoService.create({
              cultivoId: editingId,
              tipo: "GENERAL",
              fecha: now,
              payload: {
                evento: "CAMBIO_UBICACION",
                ubicacionAnterior: ubicacionPrevia,
                ubicacionNueva: ubicacionNueva,
              },
              notas: "Cambio de ubicacion",
              createdAt: now,
              createdBy: user?.uid,
            });
          }
        }
      } else {
        const { codigoInterno: _codigoInterno, ...payloadSinCodigo } = payload;
        await cultivosServiceExtended.createCultivoConCodigo(payloadSinCodigo);
      }

      await loadData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error guardando cultivo:", error);
      alert("Error al guardar el cultivo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cultivo: CultivoConRelaciones) => {
    setFormData({
      nombre: cultivo.nombre,
      tipoUbicacion: cultivo.tipoUbicacion,
      camaId: cultivo.camaId || "",
      macetaId: cultivo.macetaId || "",
      geneticaId: cultivo.geneticaId || "",
      etapaActual: cultivo.etapaActual,
      estado: cultivo.estado,
      fechaInicio: new Date(cultivo.fechaInicio).toISOString().split("T")[0],
      fechaFin: cultivo.fechaFin ? new Date(cultivo.fechaFin).toISOString().split("T")[0] : "",
      notas: cultivo.notas || "",
    });
    setEditingId(cultivo.id);
    setShowForm(true);
  };

  const handleDelete = (cultivo: CultivoConRelaciones) => {
    setCultivoSeleccionado(cultivo);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!cultivoSeleccionado) return;

    setDeleting(true);
    try {
      const now = new Date();
      await cultivosService.update(cultivoSeleccionado.id, {
        deletedAt: now,
        updatedAt: now,
        updatedBy: user?.uid,
        estado: "FINALIZADO",
      });

      await registrosCultivoService.create({
        cultivoId: cultivoSeleccionado.id,
        tipo: "GENERAL",
        fecha: now,
        payload: { evento: "ELIMINADO" },
        notas: "Cultivo eliminado",
        createdAt: now,
        createdBy: user?.uid,
      });

      await loadData();
      setShowConfirmDelete(false);
      setCultivoSeleccionado(null);
    } catch (error) {
      console.error("Error eliminando cultivo:", error);
      alert("Error al eliminar el cultivo.");
    } finally {
      setDeleting(false);
    }
  };

  const buildUbicacionKey = (tipo: TipoUbicacionCultivo, id: string) =>
    `${tipo}:${id}`;

  const handleDragStart = (
    event: React.DragEvent,
    payload: { type: "new"; origen: "palette" } | { type: "cultivo"; cultivoId: string }
  ) => {
    setDragPayload(payload);
    event.dataTransfer.setData("text/plain", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDropUbicacion = async (
    event: React.DragEvent,
    tipo: TipoUbicacionCultivo,
    ubicacionId: string
  ) => {
    event.preventDefault();
    setDragOverTarget(null);

    let payload: typeof dragPayload = null;
    try {
      payload = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      payload = dragPayload;
    }

    if (!payload) return;

    if (payload.type === "new") {
      resetForm();
      setFormData((prev) => ({
        ...prev,
        tipoUbicacion: tipo,
        camaId: tipo === "CAMA" ? ubicacionId : "",
        macetaId: tipo === "MACETA" ? ubicacionId : "",
      }));
      setShowForm(true);
      return;
    }

    const cultivo = cultivos.find((item) => item.id === payload.cultivoId);
    if (!cultivo) return;

    const ubicacionAnterior = buildUbicacionKey(
      cultivo.tipoUbicacion,
      cultivo.tipoUbicacion === "CAMA" ? cultivo.camaId || "" : cultivo.macetaId || ""
    );
    const ubicacionNueva = buildUbicacionKey(tipo, ubicacionId);

    if (ubicacionAnterior === ubicacionNueva) return;

    if (tipo === "MACETA" && cultivo.estado === "ACTIVO" && macetasOcupadas.has(ubicacionId)) {
      alert("La maceta ya esta asignada a otro cultivo activo.");
      return;
    }

    try {
      const now = new Date();
      await cultivosService.update(cultivo.id, {
        tipoUbicacion: tipo,
        camaId: tipo === "CAMA" ? ubicacionId : null,
        macetaId: tipo === "MACETA" ? ubicacionId : null,
        updatedAt: now,
        updatedBy: user?.uid,
      });

      await registrosCultivoService.create({
        cultivoId: cultivo.id,
        tipo: "GENERAL",
        fecha: now,
        payload: {
          evento: "CAMBIO_UBICACION",
          ubicacionAnterior,
          ubicacionNueva,
        },
        notas: "Movimiento en vivero",
        createdAt: now,
        createdBy: user?.uid,
      });

      await loadData();
    } catch (error) {
      console.error("Error moviendo cultivo:", error);
      alert("Error al mover el cultivo.");
    }
  };

  const handleVerDetalle = async (cultivo: CultivoConRelaciones) => {
    setCultivoSeleccionado(cultivo);
    setRegistroTab("ETAPA");
    setRegistroForm((prev) => ({ ...prev, etapa: cultivo.etapaActual }));
    setShowDetalle(true);
    await loadRegistros(cultivo.id);
  };

  const resetCamaForm = () => {
    setCamaForm({
      nombre: "",
      ubicacion: "",
      capacidad: "",
      anchoCm: "",
      largoCm: "",
      altoCm: "",
      notas: "",
    });
  };

  const resetMacetaForm = () => {
    setMacetaForm({
      nombre: "",
      camaId: "",
      volumenLitros: "",
      ubicacion: "",
      notas: "",
    });
  };

  const handleCrearCama = async () => {
    setSaving(true);
    try {
      if (!camaForm.nombre.trim()) {
        alert("El nombre de la cama es obligatorio.");
        return;
      }
      await camasService.create({
        nombre: camaForm.nombre.trim(),
        ubicacion: camaForm.ubicacion.trim() || undefined,
        capacidad: camaForm.capacidad ? parseInt(camaForm.capacidad, 10) : undefined,
        anchoCm: camaForm.anchoCm ? parseFloat(camaForm.anchoCm) : undefined,
        largoCm: camaForm.largoCm ? parseFloat(camaForm.largoCm) : undefined,
        altoCm: camaForm.altoCm ? parseFloat(camaForm.altoCm) : undefined,
        notas: camaForm.notas.trim() || undefined,
      });
      await loadData();
      setShowCamaForm(false);
      resetCamaForm();
    } catch (error) {
      console.error("Error creando cama:", error);
      alert("Error al crear la cama.");
    } finally {
      setSaving(false);
    }
  };

  const handleCrearMaceta = async () => {
    setSaving(true);
    try {
      if (!macetaForm.nombre.trim()) {
        alert("El nombre de la maceta es obligatorio.");
        return;
      }
      if (!macetaForm.camaId) {
        alert("Debe seleccionar una cama.");
        return;
      }
      await macetasService.create({
        nombre: macetaForm.nombre.trim(),
        camaId: macetaForm.camaId,
        volumenLitros: macetaForm.volumenLitros
          ? parseFloat(macetaForm.volumenLitros)
          : undefined,
        ubicacion: macetaForm.ubicacion.trim() || undefined,
        notas: macetaForm.notas.trim() || undefined,
      });
      await loadData();
      setShowMacetaForm(false);
      resetMacetaForm();
    } catch (error) {
      console.error("Error creando maceta:", error);
      alert("Error al crear la maceta.");
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarRegistro = async () => {
    if (!cultivoSeleccionado) return;

    setSaving(true);
    try {
      const now = new Date();
      const fecha = new Date(registroForm.fecha);
      let payload: any = {};

      if (registroForm.tipo === "LUZ_AMBIENTE") {
        payload = {
          horasLuz: registroForm.horasLuz ? parseFloat(registroForm.horasLuz) : null,
          horasOscuridad: registroForm.horasOscuridad ? parseFloat(registroForm.horasOscuridad) : null,
          ppfd: registroForm.ppfd ? parseFloat(registroForm.ppfd) : null,
          temperaturaDia: registroForm.temperaturaDia ? parseFloat(registroForm.temperaturaDia) : null,
          temperaturaNoche: registroForm.temperaturaNoche ? parseFloat(registroForm.temperaturaNoche) : null,
          humedad: registroForm.humedad ? parseFloat(registroForm.humedad) : null,
        };
      } else if (registroForm.tipo === "RIEGO_NUTRICION") {
        payload = {
          volumenAgua: registroForm.volumenAgua ? parseFloat(registroForm.volumenAgua) : null,
          ph: registroForm.ph ? parseFloat(registroForm.ph) : null,
          ec: registroForm.ec ? parseFloat(registroForm.ec) : null,
          fertilizante: registroForm.fertilizante || null,
        };
      } else if (registroForm.tipo === "SANIDAD") {
        payload = {
          plagaHongo: registroForm.plagaHongo || null,
          severidad: registroForm.severidad ? parseInt(registroForm.severidad, 10) : null,
          tratamiento: registroForm.tratamiento || null,
          resultado: registroForm.resultado || null,
        };
      } else if (registroForm.tipo === "ETAPA") {
        payload = {
          etapaNueva: registroForm.etapa,
        };
      }

      await registrosCultivoService.create({
        cultivoId: cultivoSeleccionado.id,
        tipo: registroForm.tipo,
        fecha,
        payload,
        notas: registroForm.notas || undefined,
        createdAt: now,
        createdBy: user?.uid,
      });

      await loadRegistros(cultivoSeleccionado.id);
      setShowRegistroForm(false);
      resetRegistroForm();
    } catch (error) {
      console.error("Error guardando registro:", error);
      alert("Error al guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  const handleCambioEtapa = async () => {
    if (!cultivoSeleccionado) return;

    setSaving(true);
    try {
      const now = new Date();
      const nuevaEtapa = registroForm.etapa;

      await cultivosService.update(cultivoSeleccionado.id, {
        etapaActual: nuevaEtapa,
        updatedAt: now,
        updatedBy: user?.uid,
      });

      await registrosCultivoService.create({
        cultivoId: cultivoSeleccionado.id,
        tipo: "ETAPA",
        fecha: now,
        payload: {
          etapaAnterior: cultivoSeleccionado.etapaActual,
          etapaNueva: nuevaEtapa,
        },
        notas: "Cambio de etapa",
        createdAt: now,
        createdBy: user?.uid,
      });

      await loadData();
      await loadRegistros(cultivoSeleccionado.id);
      setShowCambioEtapa(false);
      setCultivoSeleccionado((prev) =>
        prev ? { ...prev, etapaActual: nuevaEtapa } : prev
      );
    } catch (error) {
      console.error("Error cambiando etapa:", error);
      alert("Error al cambiar la etapa.");
    } finally {
      setSaving(false);
    }
  };

  const registrosFiltrados = registros.filter((registro) => registro.tipo === registroTab);

  const ubicacionesDisponibles = useMemo(() => {
    if (filters.tipoUbicacion === "MACETA") return macetas;
    if (filters.tipoUbicacion === "CAMA") return camas;
    return [];
  }, [filters.tipoUbicacion, macetas, camas]);

  return (
    <div>
      <Header title="Cultivos" subtitle="Gestion y seguimiento de cultivos" />

      <div className="p-4 sm:p-6 lg:p-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vista vivero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div
                className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-600"
                draggable
                onDragStart={(event) => handleDragStart(event, { type: "new", origen: "palette" })}
              >
                <Leaf className="h-4 w-4" />
                Nuevo cultivo
              </div>
              <span className="text-sm text-slate-500">
                Arrastra un cultivo para moverlo o sueltalo en una cama/maceta para crear uno nuevo.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Camas</h3>
                  <span className="text-xs text-slate-500">Vista superior</span>
                </div>
                {camas.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-sm text-slate-500 text-center">
                    No hay camas cargadas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {camas.map((cama) => {
                      const key = buildUbicacionKey("CAMA", cama.id);
                      const cultivosCama = cultivos.filter(
                        (cultivo) => cultivo.camaId === cama.id && !cultivo.deletedAt
                      );
                      return (
                        <div
                          key={cama.id}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverTarget(key);
                          }}
                          onDragLeave={() => setDragOverTarget(null)}
                          onDrop={(event) => handleDropUbicacion(event, "CAMA", cama.id)}
                          className={`rounded-lg border p-3 min-h-[120px] transition ${
                            dragOverTarget === key
                              ? "border-primary-400 bg-primary-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{cama.nombre}</p>
                              {cama.ubicacion && (
                                <p className="text-xs text-slate-500">{cama.ubicacion}</p>
                              )}
                            </div>
                            {cama.capacidad && (
                              <span className="text-xs text-slate-500">Cap. {cama.capacidad}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cultivosCama.length === 0 ? (
                              <span className="text-xs text-slate-400">Arrastra aqui</span>
                            ) : (
                              cultivosCama.map((cultivo) => (
                                <span
                                  key={cultivo.id}
                                  draggable
                                  onDragStart={(event) =>
                                    handleDragStart(event, { type: "cultivo", cultivoId: cultivo.id })
                                  }
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 cursor-move"
                                >
                                  <Leaf className="h-3 w-3" />
                                  {cultivo.nombre}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Macetas</h3>
                  <span className="text-xs text-slate-500">Vista superior</span>
                </div>
                {macetas.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-sm text-slate-500 text-center">
                    No hay macetas cargadas.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {macetas.map((maceta) => {
                      const key = buildUbicacionKey("MACETA", maceta.id);
                      const cultivoMaceta = cultivos.find(
                        (cultivo) => cultivo.macetaId === maceta.id && !cultivo.deletedAt
                      );
                      const ocupada = macetasOcupadas.has(maceta.id);
                      const camaNombre = maceta.camaId
                        ? camas.find((cama) => cama.id === maceta.camaId)?.nombre
                        : null;
                      return (
                        <div
                          key={maceta.id}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverTarget(key);
                          }}
                          onDragLeave={() => setDragOverTarget(null)}
                          onDrop={(event) => handleDropUbicacion(event, "MACETA", maceta.id)}
                          className={`rounded-full border p-3 min-h-[110px] flex flex-col items-center justify-center text-center transition ${
                            dragOverTarget === key
                              ? "border-primary-400 bg-primary-50"
                              : ocupada
                              ? "border-slate-200 bg-slate-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-800">{maceta.nombre}</p>
                          {camaNombre && (
                            <p className="text-[10px] text-slate-400">Cama: {camaNombre}</p>
                          )}
                          {cultivoMaceta ? (
                            <span
                              draggable
                              onDragStart={(event) =>
                                handleDragStart(event, { type: "cultivo", cultivoId: cultivoMaceta.id })
                              }
                              className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700 cursor-move"
                            >
                              <Leaf className="h-3 w-3" />
                              {cultivoMaceta.nombre}
                            </span>
                          ) : (
                            <span className="mt-2 text-xs text-slate-400">Arrastra aqui</span>
                          )}
                          <span className="mt-1 text-[10px] text-slate-400">
                            {ocupada ? "Ocupada" : "Disponible"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Listado de Cultivos</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setShowCamaForm(true)}>
                  Crear cama
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowMacetaForm(true)}>
                  Crear maceta
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo cultivo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              <Input
                placeholder="Buscar por nombre o codigo"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Select
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                options={[
                  { value: "TODOS", label: "Estado: todos" },
                  ...ESTADOS.map((estado) => ({ value: estado, label: estado })),
                ]}
              />
              <Select
                value={filters.etapa}
                onChange={(e) => setFilters({ ...filters, etapa: e.target.value })}
                options={[
                  { value: "TODOS", label: "Etapa: todas" },
                  ...ETAPAS.map((etapa) => ({ value: etapa, label: etapa })),
                ]}
              />
              <Select
                value={filters.tipoUbicacion}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    tipoUbicacion: e.target.value,
                    ubicacionId: "",
                  })
                }
                options={[
                  { value: "TODOS", label: "Tipo ubicacion" },
                  ...TIPOS_UBICACION.map((tipo) => ({ value: tipo, label: tipo })),
                ]}
              />
              <Select
                value={filters.ubicacionId}
                onChange={(e) => setFilters({ ...filters, ubicacionId: e.target.value })}
                options={[
                  {
                    value: "",
                    label:
                      filters.tipoUbicacion === "MACETA"
                        ? "Maceta"
                        : filters.tipoUbicacion === "CAMA"
                        ? "Cama"
                        : "Ubicacion",
                  },
                  ...ubicacionesDisponibles.map((item) => ({
                    value: item.id,
                    label: item.nombre,
                  })),
                ]}
                disabled={filters.tipoUbicacion === "TODOS"}
              />
              <Select
                value={filters.geneticaId}
                onChange={(e) => setFilters({ ...filters, geneticaId: e.target.value })}
                options={[
                  { value: "", label: "Genetica" },
                  ...geneticas.map((genetica) => ({
                    value: genetica.id,
                    label: genetica.nombre,
                  })),
                ]}
              />
              <Select
                value={filters.ordenFechaInicio}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    ordenFechaInicio: e.target.value as "ASC" | "DESC",
                  })
                }
                options={[
                  { value: "DESC", label: "Fecha inicio (desc)" },
                  { value: "ASC", label: "Fecha inicio (asc)" },
                ]}
              />
            </div>

            {filteredCultivos.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Leaf className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No hay cultivos registrados</p>
              </div>
            ) : (
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Ubicacion</TableHead>
                    <TableHead>Genetica</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCultivos.map((cultivo) => (
                    <TableRow key={cultivo.id}>
                      <TableCell className="font-medium">{cultivo.nombre}</TableCell>
                      <TableCell>{cultivo.codigoInterno || "-"}</TableCell>
                      <TableCell>{getEstadoBadge(cultivo.estado)}</TableCell>
                      <TableCell>{getEtapaBadge(cultivo.etapaActual)}</TableCell>
                      <TableCell>
                        {cultivo.tipoUbicacion === "CAMA"
                          ? cultivo.cama?.nombre || "Sin cama"
                          : cultivo.maceta?.nombre || "Sin maceta"}
                      </TableCell>
                      <TableCell>{cultivo.genetica?.nombre || "-"}</TableCell>
                      <TableCell>{formatDate(new Date(cultivo.fechaInicio))}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerDetalle(cultivo)}
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(cultivo)}
                          >
                            <Edit className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(cultivo)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editingId ? "Editar Cultivo" : "Nuevo Cultivo"}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3">
            <Input
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo ubicacion</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tipoUbicacion: "CAMA",
                      camaId: "",
                      macetaId: "",
                    })
                  }
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                    formData.tipoUbicacion === "CAMA"
                      ? "border-primary-300 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Cama
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      tipoUbicacion: "MACETA",
                      camaId: "",
                      macetaId: "",
                    })
                  }
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                    formData.tipoUbicacion === "MACETA"
                      ? "border-primary-300 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  Maceta
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {formData.tipoUbicacion === "CAMA" ? "Camas disponibles" : "Macetas disponibles"}
              </label>
              {formData.tipoUbicacion === "CAMA" ? (
                camas.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                    No hay camas cargadas.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {camas.map((cama) => {
                      const selected = formData.camaId === cama.id;
                      return (
                        <button
                          key={cama.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, camaId: cama.id })}
                          className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                            selected
                              ? "border-primary-300 bg-primary-50 text-primary-700"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          <div className="font-medium">{cama.nombre}</div>
                          {cama.ubicacion && (
                            <div className="text-xs text-slate-500">{cama.ubicacion}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : macetas.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  No hay macetas cargadas.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {macetas.map((maceta) => {
                    const selected = formData.macetaId === maceta.id;
                    const ocupada = macetasOcupadas.has(maceta.id);
                    const disabled = ocupada && !selected;
                    return (
                      <button
                        key={maceta.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setFormData({ ...formData, macetaId: maceta.id })}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                          selected
                            ? "border-primary-300 bg-primary-50 text-primary-700"
                            : "border-slate-200 text-slate-600"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="font-medium">{maceta.nombre}</div>
                        <div className="text-xs text-slate-500">
                          {ocupada ? "Ocupada" : "Disponible"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genetica</label>
              {geneticas.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
                  No hay geneticas cargadas.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, geneticaId: "" })}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      formData.geneticaId === ""
                        ? "border-primary-300 bg-primary-50 text-primary-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Sin genetica
                  </button>
                  {geneticas.map((genetica) => (
                    <button
                      key={genetica.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, geneticaId: genetica.id })}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        formData.geneticaId === genetica.id
                          ? "border-primary-300 bg-primary-50 text-primary-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {genetica.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Etapa actual"
                value={formData.etapaActual}
                onChange={(e) =>
                  setFormData({ ...formData, etapaActual: e.target.value as EtapaCultivo })
                }
                options={ETAPAS.map((etapa) => ({ value: etapa, label: etapa }))}
                required
              />
              <Select
                label="Estado"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value as EstadoCultivo })
                }
                options={ESTADOS.map((estado) => ({ value: estado, label: estado }))}
                required
              />
              <Input
                label="Fecha inicio"
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                required
              />
              <Input
                label="Fecha fin"
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              rows={3}
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showCamaForm}
        onClose={() => {
          setShowCamaForm(false);
          resetCamaForm();
        }}
        title="Nueva cama"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={camaForm.nombre}
            onChange={(e) => setCamaForm({ ...camaForm, nombre: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Ancho (cm)"
              type="number"
              value={camaForm.anchoCm}
              onChange={(e) => setCamaForm({ ...camaForm, anchoCm: e.target.value })}
            />
            <Input
              label="Largo (cm)"
              type="number"
              value={camaForm.largoCm}
              onChange={(e) => setCamaForm({ ...camaForm, largoCm: e.target.value })}
            />
            <Input
              label="Alto (cm)"
              type="number"
              value={camaForm.altoCm}
              onChange={(e) => setCamaForm({ ...camaForm, altoCm: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Ubicacion"
              value={camaForm.ubicacion}
              onChange={(e) => setCamaForm({ ...camaForm, ubicacion: e.target.value })}
            />
            <Input
              label="Capacidad"
              type="number"
              value={camaForm.capacidad}
              onChange={(e) => setCamaForm({ ...camaForm, capacidad: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              rows={3}
              value={camaForm.notas}
              onChange={(e) => setCamaForm({ ...camaForm, notas: e.target.value })}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCrearCama} disabled={saving}>
              {saving ? "Guardando..." : "Crear cama"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCamaForm(false);
                resetCamaForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showMacetaForm}
        onClose={() => {
          setShowMacetaForm(false);
          resetMacetaForm();
        }}
        title="Nueva maceta"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            value={macetaForm.nombre}
            onChange={(e) => setMacetaForm({ ...macetaForm, nombre: e.target.value })}
            required
          />
          <Select
            label="Cama"
            value={macetaForm.camaId}
            onChange={(e) => setMacetaForm({ ...macetaForm, camaId: e.target.value })}
            options={[
              { value: "", label: "Seleccionar cama" },
              ...camas.map((cama) => ({ value: cama.id, label: cama.nombre })),
            ]}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Volumen (L)"
              type="number"
              value={macetaForm.volumenLitros}
              onChange={(e) =>
                setMacetaForm({ ...macetaForm, volumenLitros: e.target.value })
              }
            />
            <Input
              label="Ubicacion"
              value={macetaForm.ubicacion}
              onChange={(e) => setMacetaForm({ ...macetaForm, ubicacion: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              rows={3}
              value={macetaForm.notas}
              onChange={(e) => setMacetaForm({ ...macetaForm, notas: e.target.value })}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCrearMaceta} disabled={saving || camas.length === 0}>
              {saving ? "Guardando..." : "Crear maceta"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowMacetaForm(false);
                resetMacetaForm();
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetalle}
        onClose={() => setShowDetalle(false)}
        title={cultivoSeleccionado ? `Cultivo: ${cultivoSeleccionado.nombre}` : "Detalle"}
        size="xl"
      >
        {cultivoSeleccionado && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Estado</p>
                <div className="mt-1">{getEstadoBadge(cultivoSeleccionado.estado)}</div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Etapa</p>
                <div className="mt-1">{getEtapaBadge(cultivoSeleccionado.etapaActual)}</div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Ubicacion</p>
                <p className="font-medium">
                  {cultivoSeleccionado.tipoUbicacion === "CAMA"
                    ? cultivoSeleccionado.cama?.nombre || "Sin cama"
                    : cultivoSeleccionado.maceta?.nombre || "Sin maceta"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Genetica</p>
                <p className="font-medium">{cultivoSeleccionado.genetica?.nombre || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Fecha inicio</p>
                <p className="font-medium">{formatDate(new Date(cultivoSeleccionado.fechaInicio))}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Fecha fin</p>
                <p className="font-medium">
                  {cultivoSeleccionado.fechaFin ? formatDate(new Date(cultivoSeleccionado.fechaFin)) : "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => handleEdit(cultivoSeleccionado)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setRegistroForm((prev) => ({
                    ...prev,
                    etapa: cultivoSeleccionado.etapaActual,
                  }));
                  setShowCambioEtapa(true);
                }}
              >
                Cambiar etapa
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(cultivoSeleccionado)}>
                <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                Eliminar
              </Button>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {REGISTRO_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      registroTab === tab.key
                        ? "bg-primary-50 border-primary-300 text-primary-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                    onClick={() => setRegistroTab(tab.key)}
                    type="button"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Registros</h3>
                <Button
                  size="sm"
                  onClick={() => {
                    resetRegistroForm();
                    setRegistroForm((prev) => ({ ...prev, tipo: registroTab }));
                    setShowRegistroForm(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar registro
                </Button>
              </div>

              {registrosFiltrados.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No hay registros para esta seccion
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Detalle</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrosFiltrados.map((registro) => (
                      <TableRow key={registro.id}>
                        <TableCell>{formatDate(new Date(registro.fecha))}</TableCell>
                        <TableCell>
                          <code className="text-xs text-slate-600">{JSON.stringify(registro.payload)}</code>
                        </TableCell>
                        <TableCell>{registro.notas || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showRegistroForm}
        onClose={() => setShowRegistroForm(false)}
        title="Nuevo registro"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Tipo"
            value={registroForm.tipo}
            onChange={(e) =>
              setRegistroForm({
                ...registroForm,
                tipo: e.target.value as TipoRegistroCultivo,
              })
            }
            options={REGISTRO_TABS.map((tab) => ({ value: tab.key, label: tab.label }))}
          />
          <Input
            label="Fecha"
            type="datetime-local"
            value={registroForm.fecha}
            onChange={(e) => setRegistroForm({ ...registroForm, fecha: e.target.value })}
          />

          {registroForm.tipo === "ETAPA" && (
            <Select
              label="Etapa"
              value={registroForm.etapa}
              onChange={(e) =>
                setRegistroForm({ ...registroForm, etapa: e.target.value as EtapaCultivo })
              }
              options={ETAPAS.map((etapa) => ({ value: etapa, label: etapa }))}
            />
          )}

          {registroForm.tipo === "LUZ_AMBIENTE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Horas luz"
                type="number"
                value={registroForm.horasLuz}
                onChange={(e) => setRegistroForm({ ...registroForm, horasLuz: e.target.value })}
              />
              <Input
                label="Horas oscuridad"
                type="number"
                value={registroForm.horasOscuridad}
                onChange={(e) => setRegistroForm({ ...registroForm, horasOscuridad: e.target.value })}
              />
              <Input
                label="PPFD"
                type="number"
                value={registroForm.ppfd}
                onChange={(e) => setRegistroForm({ ...registroForm, ppfd: e.target.value })}
              />
              <Input
                label="Temperatura dia"
                type="number"
                value={registroForm.temperaturaDia}
                onChange={(e) => setRegistroForm({ ...registroForm, temperaturaDia: e.target.value })}
              />
              <Input
                label="Temperatura noche"
                type="number"
                value={registroForm.temperaturaNoche}
                onChange={(e) => setRegistroForm({ ...registroForm, temperaturaNoche: e.target.value })}
              />
              <Input
                label="Humedad"
                type="number"
                value={registroForm.humedad}
                onChange={(e) => setRegistroForm({ ...registroForm, humedad: e.target.value })}
              />
            </div>
          )}

          {registroForm.tipo === "RIEGO_NUTRICION" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Volumen agua"
                type="number"
                value={registroForm.volumenAgua}
                onChange={(e) => setRegistroForm({ ...registroForm, volumenAgua: e.target.value })}
              />
              <Input
                label="pH"
                type="number"
                value={registroForm.ph}
                onChange={(e) => setRegistroForm({ ...registroForm, ph: e.target.value })}
              />
              <Input
                label="EC"
                type="number"
                value={registroForm.ec}
                onChange={(e) => setRegistroForm({ ...registroForm, ec: e.target.value })}
              />
              <Input
                label="Fertilizante"
                value={registroForm.fertilizante}
                onChange={(e) => setRegistroForm({ ...registroForm, fertilizante: e.target.value })}
              />
            </div>
          )}

          {registroForm.tipo === "SANIDAD" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Plaga/Hongo"
                value={registroForm.plagaHongo}
                onChange={(e) => setRegistroForm({ ...registroForm, plagaHongo: e.target.value })}
              />
              <Input
                label="Severidad (1-5)"
                type="number"
                min="1"
                max="5"
                value={registroForm.severidad}
                onChange={(e) => setRegistroForm({ ...registroForm, severidad: e.target.value })}
              />
              <Input
                label="Tratamiento"
                value={registroForm.tratamiento}
                onChange={(e) => setRegistroForm({ ...registroForm, tratamiento: e.target.value })}
              />
              <Input
                label="Resultado"
                value={registroForm.resultado}
                onChange={(e) => setRegistroForm({ ...registroForm, resultado: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              rows={3}
              value={registroForm.notas}
              onChange={(e) => setRegistroForm({ ...registroForm, notas: e.target.value })}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAgregarRegistro} disabled={saving}>
              {saving ? "Guardando..." : "Guardar registro"}
            </Button>
            <Button variant="secondary" onClick={() => setShowRegistroForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCambioEtapa}
        onClose={() => setShowCambioEtapa(false)}
        title="Cambiar etapa"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Etapa nueva"
            value={registroForm.etapa}
            onChange={(e) => setRegistroForm({ ...registroForm, etapa: e.target.value as EtapaCultivo })}
            options={ETAPAS.map((etapa) => ({ value: etapa, label: etapa }))}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCambioEtapa} disabled={saving}>
              {saving ? "Guardando..." : "Actualizar"}
            </Button>
            <Button variant="secondary" onClick={() => setShowCambioEtapa(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setCultivoSeleccionado(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar cultivo"
        message={`Esta seguro de eliminar el cultivo "${cultivoSeleccionado?.nombre}"? Se marcara como finalizado.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="warning"
        loading={deleting}
      />
    </div>
  );
}
