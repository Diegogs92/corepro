import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getStockStatus(cantidadActual: number, stockMinimo: number): 'critico' | 'bajo' | 'ok' {
  if (cantidadActual <= stockMinimo * 0.5) return 'critico';
  if (cantidadActual <= stockMinimo) return 'bajo';
  return 'ok';
}

export function formatUsername(username: string | null | undefined): string {
  if (!username) return "";
  const atIndex = username.indexOf("@");
  return atIndex === -1 ? username : username.slice(0, atIndex);
}
