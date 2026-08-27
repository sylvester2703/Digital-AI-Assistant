"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
        "Welcome to your AI Student & Career Assistant Studio! I have direct access to your database records: tasks, upcoming deadlines, class schedules, recruiter interviews, inbox facts, and matched job opportunities.\n\nHow can I help you today?",
      suggestedActions: [
        { label: "What's important today?", action: "QUERY", query: "What's important today?" },
        { label: "Check schedule conflicts", action: "QUERY", query: "Do I have any schedule conflicts?" },
        { label: "Top matched jobs above 80%", action: "QUERY", query: "Show jobs above 80% match" },
        { label: "Which applications need follow-up?", action: "QUERY", query: "Which applications need follow-up?" },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);

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
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Assistant Studio</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Grounded intelligence assistant with direct access to your verified academic & career databases
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden shadow-sm">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-sm"
                    : "bg-secondary/60 border border-border text-foreground rounded-tl-none space-y-3"
                }`}
              >
                {/* Tool Executions Trace */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="pb-2 border-b border-border/50 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Deterministic Tools Executed
                    </span>
                    {msg.toolCalls.map((tc, tIdx) => (
                      <div
                        key={tIdx}
                        className="flex items-center gap-1.5 text-[11px] text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-lg"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>{tc.tool_name}()</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleAction(act)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-foreground transition-colors flex items-center gap-1.5 shadow-sm"
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-4 bg-secondary/30 rounded-2xl max-w-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
              <span>Querying database models and formulating grounded recommendations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your tasks, schedule, emails, or matched career opportunities..."
              className="flex-1 bg-secondary text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 border border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" loading={loading} disabled={!input.trim()} className="h-10 px-5 gap-1.5">
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
