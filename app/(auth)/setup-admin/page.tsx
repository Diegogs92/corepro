"use client";

import { useState } from "react";
import { createAdminUser } from "@/lib/firestore/init-admin";
import Button from "@/components/ui/Button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState<any>(null);

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const user = await createAdminUser();
      setSuccess(true);
      setAdminInfo({
        username: "admin",
        password: "admin123",
        uid: user?.uid,
      });
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Error al crear usuario admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-teal dark:text-brand-sage">
              The Green Boys
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Inicialización del Sistema
            </p>
          </div>

          {!success && !error && (
            <div className="space-y-6">
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/30 p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Este proceso creará el usuario administrador inicial del sistema.
                  Solo debe ejecutarse una vez.
                </p>
              </div>

              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p><strong>Usuario:</strong> admin</p>
                <p><strong>Contraseña:</strong> admin123</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  (Cambiar contraseña después del primer inicio de sesión)
                </p>
              </div>

              <Button
                onClick={handleCreateAdmin}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando usuario...
                  </>
                ) : (
                  "Crear Usuario Admin"
                )}
              </Button>
            </div>
          )}

          {success && adminInfo && (
            <div className="space-y-6">
              <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-16 w-16" />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Usuario Admin Creado
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  El usuario administrador ha sido creado exitosamente
                </p>
              </div>

              <div className="rounded-md bg-slate-50 dark:bg-slate-700/40 p-4 space-y-2 text-sm">
                <p><strong>Usuario:</strong> {adminInfo.username}</p>
                <p><strong>Contraseña:</strong> {adminInfo.password}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  UID: {adminInfo.uid}
                </p>
              </div>

              <Button
                onClick={() => window.location.href = "/login"}
                className="w-full"
                size="lg"
              >
                Ir a Iniciar Sesión
              </Button>

              <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Importante:</strong> Cambia la contraseña después de iniciar sesión
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-6">
              <div className="flex items-center justify-center text-danger-600 dark:text-danger-400">
                <XCircle className="h-16 w-16" />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Error
                </h2>
                <p className="text-sm text-danger-600 dark:text-danger-300">
                  {error}
                </p>
              </div>

              <Button
                onClick={() => {
                  setError("");
                  setSuccess(false);
                }}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Intentar Nuevamente
              </Button>

              <Button
                onClick={() => window.location.href = "/login"}
                className="w-full"
                size="lg"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
