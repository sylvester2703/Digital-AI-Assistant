import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "critical" | "high" | "medium" | "low" | "success" | "neutral" | "outline";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/20",
    critical: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold",
    high: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    medium: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    low: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    neutral: "bg-secondary text-secondary-foreground border-border",
    outline: "border border-border text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border tracking-wide select-none transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
