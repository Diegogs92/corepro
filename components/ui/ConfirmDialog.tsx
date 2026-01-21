import React, { useEffect } from "react";
import Button from "./Button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIconColor = () => {
    switch (variant) {
      case "danger":
        return "text-red-600";
      case "warning":
        return "text-amber-600";
      case "primary":
        return "text-primary-600";
      default:
        return "text-primary-600";
    }
  };

  const getBgColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-50";
      case "warning":
        return "bg-amber-50";
      case "primary":
        return "bg-primary-50";
      default:
        return "bg-primary-50";
    }
  };

  const getButtonVariant = (): "primary" | "danger" => {
    return variant === "danger" ? "danger" : "primary";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Dialog Content */}
        <div
          className="relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className={`flex items-start gap-3 p-4 rounded-lg ${getBgColor()}`}>
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />
              </div>
              <p className="text-sm text-slate-700">{message}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-slate-600 hover:text-slate-900"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={getButtonVariant()}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Procesando..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
