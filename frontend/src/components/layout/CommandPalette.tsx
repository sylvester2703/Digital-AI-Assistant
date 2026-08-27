"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, CheckSquare, Calendar, Mail, Briefcase, GraduationCap, Video, ArrowRight, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/Badge";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ tasks: [], events: [], emails: [], jobs: [], assignments: [], interviews: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Live search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], events: [], emails: [], jobs: [], assignments: [], interviews: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiClient<any>(`/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const navigateTo = (url: string) => {
    onClose();
    router.push(url);
  };

  const totalResults =
    (results.tasks?.length || 0) +
    (results.events?.length || 0) +
    (results.emails?.length || 0) +
    (results.jobs?.length || 0) +
    (results.assignments?.length || 0) +
    (results.interviews?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-10 flex flex-col animate-slide-down">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-border/60 gap-3">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search anything in your OS..."
            className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onClose} className="text-xs text-muted-foreground px-1.5 py-0.5 rounded border border-border">
            ESC
          </button>
        </div>

        {/* Search Results / Navigation Presets */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {loading && <p className="text-xs text-muted-foreground text-center py-4">Searching database...</p>}

          {!query && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2">Quick Navigation</span>
              {[
                { label: "Go to Daily Planner", url: "/planner", icon: CheckSquare },
                { label: "View Calendar & Conflicts", url: "/calendar", icon: Calendar },
                { label: "Open Inbox Intelligence", url: "/inbox", icon: Mail },
                { label: "Explore Matched Jobs", url: "/jobs", icon: Briefcase },
                { label: "Open AI Assistant", url: "/assistant", icon: GraduationCap },
              ].map((item) => (
                <button
                  key={item.url}
                  onClick={() => navigateTo(item.url)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-secondary transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {query && totalResults === 0 && !loading && (
            <p className="text-xs text-muted-foreground text-center py-6">No matching records found for "{query}".</p>
          )}

          {/* Tasks Results */}
          {results.tasks?.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2">Tasks</span>
              {results.tasks.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => navigateTo(t.link)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-secondary text-left group"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{t.title}</span>
                  </div>
                  <Badge variant={t.priority === "CRITICAL" ? "critical" : "neutral"} className="text-[9px]">
                    {t.priority}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Jobs Results */}
          {results.jobs?.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2">Jobs</span>
              {results.jobs.map((j: any) => (
                <button
                  key={j.id}
                  onClick={() => navigateTo(j.link)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs hover:bg-secondary text-left group"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{j.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{j.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
