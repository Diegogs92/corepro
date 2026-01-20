"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  CreditCard,
  Users,
  UserCog,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Ventas",
    href: "/ventas",
    icon: ShoppingCart,
  },
  {
    name: "Socios",
    href: "/socios",
    icon: Users,
  },
  {
    name: "Productos",
    href: "/productos",
    icon: Package,
  },
  {
    name: "Stock",
    href: "/stock",
    icon: Package,
  },
  {
    name: "Gastos",
    href: "/gastos",
    icon: CreditCard,
  },
  {
    name: "Usuarios",
    href: "/usuarios",
    icon: UserCog,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex w-full md:w-64 flex-col bg-white dark:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 md:h-screen">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center gap-3 border-b border-slate-200 dark:border-slate-700 px-6">
        <Image
          src="/logo.svg"
          alt="The Green Boys"
          width={40}
          height={40}
          className="h-10 w-10"
          priority
        />
        <h1 className="text-xl font-bold text-brand-teal dark:text-brand-sage">
          The Green Boys
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex md:flex-col flex-row gap-2 md:gap-1 px-3 py-3 md:py-4 overflow-x-auto md:overflow-visible">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-slate-100 whitespace-nowrap"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
          {theme === "light" ? "Tema Oscuro" : "Tema Claro"}
        </button>
      </div>
    </div>
  );
}
