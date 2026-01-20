"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario autenticado - obtener datos adicionales de Firestore
        try {
          const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              username: userData.username,
              email: userData.email || null,
            });
          } else {
            // Si no existe documento en Firestore, usar datos de Firebase Auth
            const virtualEmail = firebaseUser.email || "";
            const username = virtualEmail.replace("@thegreenboys.local", "");
            setUser({
              uid: firebaseUser.uid,
              username: username,
              email: firebaseUser.email,
            });
          }
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
          // Fallback a datos de Firebase Auth
          const virtualEmail = firebaseUser.email || "";
          const username = virtualEmail.replace("@thegreenboys.local", "");
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
    try {
      // Convertir username a email virtual para Firebase Auth
      const virtualEmail = `${username}@thegreenboys.local`;

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
