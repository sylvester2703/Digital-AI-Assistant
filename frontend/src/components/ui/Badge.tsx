import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "success"
    | "neutral"
    | "outline"
    | "indigo"
    | "amber"
    | "emerald";
  dot?: boolean;
}

export function Badge({ className, variant = "default", dot = false, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary border-primary/25",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold",
    critical: "bg-rose-500/15 text-rose-500 border-rose-500/30 font-bold",
    high: "bg-amber-500/15 text-amber-500 border-amber-500/30 font-semibold",
    medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold",
    neutral: "bg-secondary text-secondary-foreground border-border/80",
    outline: "border border-border text-muted-foreground bg-transparent",
  };

  const dotColors = {
    default: "bg-primary",
    indigo: "bg-indigo-400",
    amber: "bg-amber-400",
    emerald: "bg-emerald-400",
    critical: "bg-rose-500 animate-pulse",
    high: "bg-amber-500",
    medium: "bg-blue-400",
    low: "bg-slate-400",
    success: "bg-emerald-400",
    neutral: "bg-muted-foreground",
    outline: "bg-muted-foreground",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-wide select-none transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", dotColors[variant])} />}
      <span>{children}</span>
    </div>
  );
}

