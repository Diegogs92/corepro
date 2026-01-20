import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Usuario } from '@/lib/types';

const COLLECTION_NAME = 'usuarios';

// ============================================================================
// CREATE
// ============================================================================

export async function createUsuario(usuario: Omit<Usuario, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...usuario,
      fechaCreacion: Timestamp.fromDate(usuario.fechaCreacion),
      ultimoAcceso: usuario.ultimoAcceso ? Timestamp.fromDate(usuario.ultimoAcceso) : null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

// ============================================================================
// READ
// ============================================================================

export async function getUsuarios(): Promise<Usuario[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('nombre', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion.toDate(),
        ultimoAcceso: data.ultimoAcceso ? data.ultimoAcceso.toDate() : undefined,
      } as Usuario;
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        fechaCreacion: data.fechaCreacion.toDate(),
        ultimoAcceso: data.ultimoAcceso ? data.ultimoAcceso.toDate() : undefined,
      } as Usuario;
    }

    return null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

export async function getUsuariosByRol(rol: string): Promise<Usuario[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('rol', '==', rol),
      orderBy('nombre', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion.toDate(),
        ultimoAcceso: data.ultimoAcceso ? data.ultimoAcceso.toDate() : undefined,
      } as Usuario;
    });
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    throw error;
  }
}

export async function getUsuariosActivos(): Promise<Usuario[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('activo', '==', true),
      orderBy('nombre', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion.toDate(),
        ultimoAcceso: data.ultimoAcceso ? data.ultimoAcceso.toDate() : undefined,
      } as Usuario;
    });
  } catch (error) {
    console.error('Error al obtener usuarios activos:', error);
    throw error;
  }
}

// ============================================================================
// UPDATE
// ============================================================================

export async function updateUsuario(
  id: string,
  updates: Partial<Omit<Usuario, 'id' | 'fechaCreacion'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = { ...updates };

    if (updates.ultimoAcceso) {
      updateData.ultimoAcceso = Timestamp.fromDate(updates.ultimoAcceso);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

export async function updateUltimoAcceso(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ultimoAcceso: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error al actualizar último acceso:', error);
    throw error;
  }
}

export async function toggleUsuarioActivo(id: string, activo: boolean): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { activo });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    throw error;
  }
}

// ============================================================================
// DELETE
// ============================================================================

export async function deleteUsuario(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
}

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

export async function getEstadisticasUsuarios() {
  try {
    const usuarios = await getUsuarios();

    return {
      totalUsuarios: usuarios.length,
      usuariosActivos: usuarios.filter(u => u.activo).length,
      usuariosInactivos: usuarios.filter(u => !u.activo).length,
      admins: usuarios.filter(u => u.rol === 'ADMIN').length,
      gerentes: usuarios.filter(u => u.rol === 'GERENTE').length,
      vendedores: usuarios.filter(u => u.rol === 'VENDEDOR').length,
      operadores: usuarios.filter(u => u.rol === 'OPERADOR').length,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    throw error;
  }
}
