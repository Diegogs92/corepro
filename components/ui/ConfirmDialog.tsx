import React from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

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
  const getIconColor = () => {
    switch (variant) {
      case "danger":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "primary":
        return "text-primary-600 dark:text-primary-400";
      default:
        return "text-primary-600 dark:text-primary-400";
    }
  };

  const getBgColor = () => {
    switch (variant) {
      case "danger":
        return "bg-red-50 dark:bg-red-900/20";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "primary":
        return "bg-primary-50 dark:bg-primary-900/20";
      default:
        return "bg-primary-50 dark:bg-primary-900/20";
    }
  };

  const getButtonVariant = (): "primary" | "danger" => {
    return variant === "danger" ? "danger" : "primary";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className={`flex items-center gap-4 p-4 rounded-lg ${getBgColor()}`}>
          <div className="flex-shrink-0">
            <AlertTriangle className={`h-8 w-8 ${getIconColor()}`} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
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
    </Modal>
  );
}
