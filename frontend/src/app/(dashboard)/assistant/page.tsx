"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  Sparkles,
  Wrench,
  ChevronRight,
  Clock,
  Briefcase,
  Video,
  CheckCircle2,
  Zap,
  Layers,
  ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AssistantQueryResponse } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: any[];
  suggestedActions?: any[];
}

export default function AssistantPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to your AI Student & Career Copilot Studio! I am directly grounded in your verified workspace records: coursework syllabi, active tasks, schedule conflicts, recruiter interview rounds, extracted inbox facts, and matched career roles.\n\nHow can I accelerate your productivity today?",
      suggestedActions: [
        { label: "What's important today?", action: "QUERY", query: "What's important today?" },
        { label: "Check schedule conflicts", action: "QUERY", query: "Do I have any schedule conflicts?" },
        { label: "Top jobs above 80%", action: "QUERY", query: "Show jobs above 80% match" },
        { label: "Which applications need follow-up?", action: "QUERY", query: "Which applications need follow-up?" },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiClient<AssistantQueryResponse>("/assistant/query", {
        method: "POST",
        body: JSON.stringify({ query: q }),
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: res.reply,
        toolCalls: res.tool_calls,
        suggestedActions: res.suggested_actions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error executing query: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (act: any) => {
    if (act.action === "NAVIGATE" && act.route) {
      router.push(act.route);
    } else if (act.action === "QUERY" && act.query) {
      handleSend(act.query);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">AI Copilot Studio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic AI grounded with direct query access to your verified academic and career databases
          </p>
        </div>
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          Gemini 2.5 Intelligence Engine
        </Badge>
      </div>

      {/* Main Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl border-border/80 bg-card/90 backdrop-blur-2xl">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl rounded-3xl p-5 text-xs ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-primary to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-primary/20"
                    : "bg-secondary/60 border border-border/80 text-foreground rounded-tl-none space-y-3.5 shadow-sm"
                }`}
              >
                {/* Tool Executions Trace */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="pb-2 border-b border-border/50 space-y-1.5">
                    <span className="text-[9px] uppercase font-mono font-extrabold text-muted-foreground tracking-wider block">
                      Deterministic Tools Executed
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.toolCalls.map((tc, tIdx) => (
                        <div
                          key={tIdx}
                          className="flex items-center gap-1.5 text-[10px] text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 font-bold"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>{tc.tool_name}()</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">{msg.content}</div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleAction(act)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-card hover:bg-muted border border-border/80 text-foreground transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95"
                      >
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground p-4 bg-secondary/40 rounded-3xl max-w-md border border-border/60">
              <span className="h-3 w-3 rounded-full bg-primary animate-ping flex-shrink-0" />
              <span>Querying database models and compiling grounded intelligence...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/80 bg-card/80 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your tasks, courses, conflicts, interviews, or matched career roles..."
              className="flex-1 bg-secondary/80 text-xs rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border/80 text-foreground placeholder:text-muted-foreground transition-all"
            />
            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              disabled={!input.trim()}
              className="h-11 px-6 gap-2 font-bold shadow-md shadow-primary/20"
            >
              <Send className="w-4 h-4" />
              <span>Ask AI</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
