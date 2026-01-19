"use client";

import { createContext, useContext, useEffect, useState } from "react";

// MODO DEMO - Usuario mock para pruebas sin Firebase
interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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

  useEffect(() => {
    // MODO DEMO: Usuario automático sin autenticación
    const mockUser = {
      uid: "demo-user-123",
      email: "demo@corepro.com",
    };
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // MODO DEMO: Simular login exitoso
    const mockUser = {
      uid: "demo-user-123",
      email: email,
    };
    setUser(mockUser);
  };

  const signOut = async () => {
    // MODO DEMO: Simular logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
