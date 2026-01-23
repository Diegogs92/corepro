"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { formatUsername } from "@/lib/utils";

interface User {
  uid: string;
  username: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth || !db) return
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const normalizeUsername = (value: string | null) => formatUsername(value || "");
        // Usuario autenticado - obtener datos adicionales de Firestore
        try {
          const userDoc = await getDoc(doc(db!, "usuarios", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const username = normalizeUsername(userData.username || firebaseUser.email);
            setUser({
              uid: firebaseUser.uid,
              username: username,
              email: userData.email || null,
            });
          } else {
            // Si no existe documento en Firestore, usar datos de Firebase Auth
            const username = normalizeUsername(firebaseUser.email);
            try {
              await setDoc(doc(db!, "usuarios", firebaseUser.uid), {
                username: username,
                nombre: username,
                apellido: null,
                email: null,
                rol: "OPERADOR",
                activo: true,
                fechaCreacion: serverTimestamp(),
                telefono: null,
                avatar: null,
                notas: null,
              });
            } catch (writeError) {
              console.warn("No se pudo crear el usuario en Firestore:", writeError);
            }
            setUser({
              uid: firebaseUser.uid,
              username: username,
              email: firebaseUser.email,
            });
          }
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
          // Fallback a datos de Firebase Auth
          const username = normalizeUsername(firebaseUser.email);
          setUser({
            uid: firebaseUser.uid,
            username: username,
            email: firebaseUser.email,
          });
        }
      } else {
        // No hay usuario autenticado
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      // Convertir username a email virtual para Firebase Auth
      const virtualEmail = `${username}@thegardenboys.local`;

      // Intentar autenticar con Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        virtualEmail,
        password
      );

      // Firebase Auth onAuthStateChanged se encargará de actualizar el estado
      return;
    } catch (error: any) {
      console.error("Error en signIn:", error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase not initialized')
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
