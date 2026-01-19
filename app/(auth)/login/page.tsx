"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Usuario o contraseña incorrectos");
      } else if (err.code === "auth/invalid-email") {
        setError("El formato del email es inválido");
      } else {
        setError("Error al iniciar sesión. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600">CorePro</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Sistema de Gestión Administrativa
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@corepro.com"
              required
              disabled={loading}
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />

            {error && (
              <div className="rounded-md bg-danger-50 dark:bg-danger-900/30 p-3">
                <p className="text-sm text-danger-600 dark:text-danger-300">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 rounded-md bg-slate-50 dark:bg-slate-700/40 p-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <strong>Nota:</strong> Este es un sistema de uso interno. Si no
              tienes credenciales de acceso, contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
