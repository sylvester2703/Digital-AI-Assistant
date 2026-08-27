"use client";

import React, { useState } from "react";
import { Search, Bell, Sun, Moon, Sparkles, Command, Check } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Badge } from "@/components/ui/Badge";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { AssistantDrawer } from "@/components/assistant/AssistantDrawer";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Search / Command bar trigger */}
        <div className="flex-1 max-w-md">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-secondary/70 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground text-xs transition-all shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search tasks, courses, jobs, or type a command...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-card rounded border border-border text-muted-foreground shadow-sm">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick AI Trigger */}
          <button
            onClick={() => setAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/10 to-indigo-500/10 hover:from-primary/20 hover:to-indigo-500/20 border border-primary/30 text-primary text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI Assistant</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-2xl border border-border shadow-xl p-3 z-50 animate-slide-down">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-xs font-bold tracking-tight">Notifications</span>
                  <Badge variant="critical" className="text-[10px] py-0">1 Critical</Badge>
                </div>
                <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
                    <p className="font-semibold text-rose-500 text-[11px]">Schedule Conflict Alert</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Technical Interview overlaps CS401 Lecture at 2:00 PM.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-secondary/60 border border-border text-xs">
                    <p className="font-semibold text-foreground text-[11px]">High Match Opportunity</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Apex Analytics posted Junior Data Analyst (92% Match).
                    </p>
                  </div>
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
