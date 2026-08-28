"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, Sparkles, X, ChevronRight, CheckCircle2, Wrench, Zap } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AssistantQueryResponse } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: any[];
  suggestedActions?: any[];
}

export function AssistantDrawer({ isOpen, onClose }: AssistantDrawerProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello Alex! I am your AI Student & Career Assistant Copilot. How can I assist your productivity and career goals today?",
      suggestedActions: [
        { label: "What's important today?", action: "QUERY", query: "What's important today?" },
        { label: "Show approaching deadlines", action: "QUERY", query: "Show approaching deadlines" },
        { label: "Top jobs above 80% match", action: "QUERY", query: "Show jobs above 80% match" },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  if (!isOpen) return null;

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
        { role: "assistant", content: `Sorry, I encountered an issue retrieving data: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.action === "NAVIGATE" && action.route) {
      onClose();
      router.push(action.route);
    } else if (action.action === "QUERY" && action.query) {
      handleSend(action.query);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-2xl h-full border-l border-border/80 shadow-2xl z-10 flex flex-col animate-slide-down">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-secondary/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center shadow-md shadow-primary/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold tracking-tight text-foreground">AI Copilot Assistant</h3>
                <Badge variant="indigo" dot className="text-[8px] py-0 px-1.5 font-bold">Grounded</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Direct query access to your student databases</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-3xl p-4 text-xs ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-primary to-indigo-600 text-white font-medium rounded-tr-none shadow-md shadow-primary/20"
                    : "bg-secondary/60 border border-border/80 text-foreground rounded-tl-none space-y-2.5 shadow-sm"
                }`}
              >
                {/* Tool calls execution trace badge */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="pb-1 mb-1 border-b border-border/40 space-y-1">
                    {msg.toolCalls.map((tc, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-1.5 text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-lg font-bold">
                        <Wrench className="w-3 h-3" />
                        <span>Executed {tc.tool_name}()</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Suggested Next Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95"
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
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground p-3.5 bg-secondary/40 rounded-2xl max-w-xs border border-border/60">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
              <span>Querying verified databases...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-border/80 bg-card/90 backdrop-blur-xl">
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
              placeholder="Ask anything about your tasks, schedule, or jobs..."
              className="flex-1 bg-secondary/80 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground border border-border/80"
            />
            <Button type="submit" variant="gradient" size="sm" loading={loading} disabled={!input.trim()} className="font-bold shadow-md shadow-primary/20">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

