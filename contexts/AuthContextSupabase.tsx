"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { formatUsername } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (authUser: SupabaseUser) => {
    try {
      // Get user data from usuarios table
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error || !data) {
        // Fallback to auth metadata
        const username = formatUsername(authUser.email || "");
        setUser({
          uid: authUser.id,
          username,
          email: authUser.email || null,
        });
        return;
      }

      setUser({
        uid: authUser.id,
        username: (data as any).username,
        email: (data as any).email || null,
      });
    } catch (error) {
      console.error("Error in loadUserData:", error);
      const username = formatUsername(authUser.email || "");
      setUser({
        uid: authUser.id,
        username,
        email: authUser.email || null,
      });
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Convert username to virtual email for Supabase Auth
      const virtualEmail = `${username}@thegardenboys.local`;

      // Sign in with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: password,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error in signIn:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
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
