import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import type { Usuario, RolUsuario } from "@/lib/types";

// Colección de usuarios en Firestore
const usuariosCollection = collection(db, "usuarios");

/**
 * Convertir Timestamp de Firestore a Date
 */
const timestampToDate = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

/**
 * Obtener todos los usuarios
 */
export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const querySnapshot = await getDocs(
      query(usuariosCollection, orderBy("fechaCreacion", "desc"))
    );
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol: data.rol as RolUsuario,
        activo: data.activo,
        fechaCreacion: timestampToDate(data.fechaCreacion),
        ultimoAcceso: data.ultimoAcceso ? timestampToDate(data.ultimoAcceso) : undefined,
        telefono: data.telefono,
        avatar: data.avatar,
        notas: data.notas,
      } as Usuario;
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
};

/**
 * Obtener un usuario por ID
 */
export const getUsuario = async (id: string): Promise<Usuario | null> => {
  try {
    const docSnap = await getDoc(doc(db, "usuarios", id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        username: data.username,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        rol: data.rol as RolUsuario,
        activo: data.activo,
        fechaCreacion: timestampToDate(data.fechaCreacion),
        ultimoAcceso: data.ultimoAcceso ? timestampToDate(data.ultimoAcceso) : undefined,
        telefono: data.telefono,
        avatar: data.avatar,
        notas: data.notas,
      } as Usuario;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    throw error;
  }
};

/**
 * Crear un nuevo usuario (Firebase Auth + Firestore)
 */
export const createUsuario = async (
  userData: Omit<Usuario, "id" | "fechaCreacion" | "ultimoAcceso"> & { password: string }
): Promise<Usuario> => {
  try {
    // 1. Crear usuario en Firebase Authentication con email virtual
    const virtualEmail = `${userData.username}@thegardenboys.local`;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      virtualEmail,
      userData.password
    );

    // 2. Guardar datos adicionales en Firestore
    const usuarioData = {
      username: userData.username,
      nombre: userData.nombre,
      apellido: userData.apellido || null,
      email: userData.email || null,
      rol: userData.rol,
      activo: userData.activo,
      fechaCreacion: Timestamp.now(),
      telefono: userData.telefono || null,
      avatar: userData.avatar || null,
      notas: userData.notas || null,
    };

    // Usar el UID de Firebase Auth como ID del documento en Firestore
    await updateDoc(doc(db, "usuarios", userCredential.user.uid), usuarioData);

    return {
      id: userCredential.user.uid,
      ...usuarioData,
      fechaCreacion: new Date(),
    } as Usuario;
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    // Mensajes de error más específicos
    if (error.code === "auth/email-already-in-use") {
      throw new Error("El nombre de usuario ya está en uso");
    }
    throw error;
  }
};

/**
 * Actualizar un usuario existente
 */
export const updateUsuario = async (
  id: string,
  updates: Partial<Omit<Usuario, "id" | "fechaCreacion">>
): Promise<void> => {
  try {
    const updateData: any = {};

    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
    if (updates.apellido !== undefined) updateData.apellido = updates.apellido || null;
    if (updates.email !== undefined) updateData.email = updates.email || null;
    if (updates.rol !== undefined) updateData.rol = updates.rol;
    if (updates.activo !== undefined) updateData.activo = updates.activo;
    if (updates.telefono !== undefined) updateData.telefono = updates.telefono || null;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar || null;
    if (updates.notas !== undefined) updateData.notas = updates.notas || null;
    if (updates.ultimoAcceso !== undefined) {
      updateData.ultimoAcceso = Timestamp.fromDate(updates.ultimoAcceso);
    }

    await updateDoc(doc(db, "usuarios", id), updateData);
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
};

/**
 * Eliminar un usuario (solo marca como inactivo)
 */
export const deleteUsuario = async (id: string): Promise<void> => {
  try {
    // En lugar de eliminar, marcamos como inactivo
    await updateDoc(doc(db, "usuarios", id), {
      activo: false,
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
};

/**
 * Buscar usuarios por nombre de usuario
 */
export const searchUsuariosByUsername = async (username: string): Promise<Usuario[]> => {
  try {
    const q = query(
      usuariosCollection,
      where("username", ">=", username),
      where("username", "<=", username + "\uf8ff")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: timestampToDate(data.fechaCreacion),
        ultimoAcceso: data.ultimoAcceso ? timestampToDate(data.ultimoAcceso) : undefined,
      } as Usuario;
    });
  } catch (error) {
    console.error("Error buscando usuarios:", error);
    throw error;
  }
};
