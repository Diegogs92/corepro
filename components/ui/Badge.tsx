import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "default";
}

export default function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400": variant === "success",
          "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400": variant === "warning",
          "bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400": variant === "danger",
          "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300": variant === "default",
        },
        className
      )}
      {...props}
    />
  );
}
