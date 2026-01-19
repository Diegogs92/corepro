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
          "bg-success-100 text-success-600": variant === "success",
          "bg-warning-100 text-warning-600": variant === "warning",
          "bg-danger-100 text-danger-600": variant === "danger",
          "bg-slate-100 text-slate-600": variant === "default",
        },
        className
      )}
      {...props}
    />
  );
}
