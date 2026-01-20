"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {user?.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
