"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Inbox,
  GraduationCap,
  Briefcase,
  Layers,
  Video,
  BarChart3,
  Bot,
  User,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/Badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "critical" | "default" | "high" | "success" | "indigo";
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Planner", href: "/planner", icon: CheckSquare, badge: "1 Critical", badgeVariant: "critical" },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Inbox", href: "/inbox", icon: Inbox, badge: "3 New", badgeVariant: "default" },
  { label: "Academics", href: "/academics", icon: GraduationCap },
  { label: "Jobs Hub", href: "/jobs", icon: Briefcase, badge: "92% Fit", badgeVariant: "success" },
  { label: "Applications", href: "/applications", icon: Layers },
  { label: "Interviews", href: "/interviews", icon: Video, badge: "Today", badgeVariant: "critical" },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { label: "AI Assistant", href: "/assistant", icon: Bot, badge: "Live", badgeVariant: "indigo" },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Connected Accounts", href: "/settings/connected-accounts", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-card/90 backdrop-blur-xl border-r border-border/70 flex flex-col transition-all duration-300 z-30 select-none shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
        <Link href="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-primary/25 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm tracking-tight leading-none bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                Apex OS
              </span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">Student & Career AI</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors hidden md:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-5">
        {/* Main Section */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2.5 mb-1.5 block">
              Workspace
            </span>
          )}
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && !isActive && (
                      <Badge
                        variant={item.badgeVariant || "neutral"}
                        dot={item.badgeVariant === "critical" || item.badgeVariant === "indigo"}
                        className="text-[9px] py-0 px-1.5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Intelligence Section */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-2.5 mb-1.5 block">
              Intelligence & Tools
            </span>
          )}
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && !isActive && (
                      <Badge variant={item.badgeVariant || "neutral"} dot className="text-[9px] py-0 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/60">
        <div className={cn("flex items-center gap-2.5 p-1.5 rounded-xl bg-secondary/40 border border-border/50", collapsed && "justify-center p-1")}>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
            {user?.full_name ? user.full_name[0].toUpperCase() : "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-xs font-bold text-foreground truncate leading-tight">{user?.full_name || "Alex Rivera"}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user?.email || "alex.rivera@university.edu"}</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

