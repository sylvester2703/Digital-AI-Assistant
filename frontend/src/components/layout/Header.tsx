"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Sun, Moon, Sparkles, Command, Check, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/Badge";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { AssistantDrawer } from "@/components/assistant/AssistantDrawer";
import Link from "next/link";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="h-16 bg-card/85 backdrop-blur-xl border-b border-border/70 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
        {/* Search / Command bar trigger */}
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/70 text-muted-foreground hover:text-foreground text-xs transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="truncate">Search tasks, courses, jobs, or run commands...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono bg-card rounded-md border border-border text-muted-foreground shadow-sm">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Clock Pill */}
          {currentTime && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/40 border border-border/50 text-[11px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentTime}</span>
            </div>
          )}

          {/* Quick AI Trigger */}
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-primary via-indigo-500 to-primary text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.02] active:scale-95 transition-all bg-[length:200%_auto] hover:bg-right"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span className="hidden sm:inline">Ask AI Copilot</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border/60 transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent hover:border-border/60 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-84 bg-card/95 backdrop-blur-2xl rounded-2xl border border-border/80 shadow-2xl p-4 z-50 animate-slide-down space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-tight text-foreground">Notifications</span>
                    <Badge variant="critical" dot className="text-[9px] py-0 px-1.5">1 Critical</Badge>
                  </div>
                  <button onClick={() => setNotifOpen(false)} className="text-[10px] text-muted-foreground hover:text-foreground font-semibold">
                    Close
                  </button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <Link
                    href="/calendar"
                    onClick={() => setNotifOpen(false)}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 block hover:bg-rose-500/15 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-rose-500 text-[11px]">Schedule Conflict Alert</p>
                      <ArrowRight className="w-3 h-3 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-1 leading-snug">
                      Technical Interview overlaps CS401 ML Lecture at 2:00 PM today.
                    </p>
                  </Link>

                  <Link
                    href="/jobs"
                    onClick={() => setNotifOpen(false)}
                    className="p-3 rounded-xl bg-secondary/60 border border-border block hover:bg-secondary transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-foreground text-[11px]">High Match Opportunity</p>
                      <ArrowRight className="w-3 h-3 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-muted-foreground text-[11px] mt-1 leading-snug">
                      Apex Analytics Solutions posted Junior Data Analyst (92% Match).
                    </p>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* Slide-out AI Assistant Drawer */}
      <AssistantDrawer isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}

