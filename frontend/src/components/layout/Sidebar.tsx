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
  badgeVariant?: "critical" | "default" | "high";
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Planner", href: "/planner", icon: CheckSquare, badge: "1 Critical", badgeVariant: "critical" },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Inbox", href: "/inbox", icon: Inbox, badge: "3 New", badgeVariant: "default" },
  { label: "Academics", href: "/academics", icon: GraduationCap },
  { label: "Jobs Hub", href: "/jobs", icon: Briefcase, badge: "92%", badgeVariant: "high" },
  { label: "Applications", href: "/applications", icon: Layers },
  { label: "Interviews", href: "/interviews", icon: Video, badge: "Today", badgeVariant: "critical" },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { label: "AI Assistant", href: "/assistant", icon: Bot },
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
        "h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-300 z-30 select-none",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-none">Apex Assistant</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Student & Career OS</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors hidden md:flex"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {/* Main Section */}
        <div className="space-y-1">
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5">
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
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && !isActive && (
                      <Badge variant={item.badgeVariant || "neutral"} className="text-[9px] px-1.5 py-0">
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
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5">
              Intelligence & Settings
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
                  "flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-border/60">
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
            {user?.full_name ? user.full_name[0].toUpperCase() : "A"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col">
              <span className="text-xs font-semibold truncate leading-none">{user?.full_name || "Alex Rivera"}</span>
              <span className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email || "alex.rivera@university.edu"}</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
