import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
          {
            "bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md dark:bg-primary-500 dark:hover:bg-primary-600 focus-visible:ring-primary-600":
              variant === "primary",
            "bg-slate-200 text-slate-900 shadow-sm hover:bg-slate-300 hover:shadow-md dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500 focus-visible:ring-slate-400":
              variant === "secondary",
            "bg-danger-500 text-white shadow-sm hover:bg-danger-600 hover:shadow-md dark:bg-danger-600 dark:hover:bg-danger-700 focus-visible:ring-danger-500":
              variant === "danger",
            "text-slate-700 hover:bg-slate-100 hover:shadow-sm dark:hover:bg-slate-700 dark:text-slate-300 focus-visible:ring-slate-400":
              variant === "ghost",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
