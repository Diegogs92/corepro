import { Card, CardContent } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  format?: "currency" | "number";
  variant?: "default" | "success" | "danger" | "warning";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  format = "currency",
  variant = "default",
}: StatCardProps) {
  const formattedValue =
    format === "currency" && typeof value === "number"
      ? formatCurrency(value)
      : value;

  const iconColorClass = {
    default: "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
    success: "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    danger: "bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400",
    warning: "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
  }[variant];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formattedValue}
            </p>
            {trend && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{trend.label}</p>
            )}
          </div>
          <div className={`rounded-full p-3 ${iconColorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
