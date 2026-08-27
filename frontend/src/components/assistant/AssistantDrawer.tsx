"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, Sparkles, X, ChevronRight, CheckCircle2, Wrench } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AssistantQueryResponse } from "@/types";
import { Button } from "@/components/ui/Button";

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
      content: "Hello Alex! I am your AI Student & Career Assistant. How can I assist your productivity and career goals today?",
      suggestedActions: [
        { label: "What's important today?", action: "QUERY", query: "What's important today?" },
        { label: "Show approaching deadlines", action: "QUERY", query: "Show approaching deadlines" },
        { label: "Top jobs above 80% match", action: "QUERY", query: "Show jobs above 80% match" },
      ],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card h-full border-l border-border shadow-2xl z-10 flex flex-col animate-slide-down">
        {/* Drawer Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight leading-none">AI Command Assistant</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Grounded in your real academics & career data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
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
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-sm"
                    : "bg-secondary/70 border border-border text-foreground rounded-tl-none space-y-2"
                }`}
              >
                {/* Tool calls execution trace badge */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="pb-1 mb-1 border-b border-border/40 space-y-1">
                    {msg.toolCalls.map((tc, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-1.5 text-[10px] text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
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
                        className="text-[10px] font-semibold px-2 py-1 rounded-md bg-card hover:bg-muted border border-border text-foreground transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-primary" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/40 rounded-xl max-w-xs">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>Querying database tools and synthesizing recommendations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-border bg-card">
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
              placeholder="Ask your assistant anything..."
              className="flex-1 bg-secondary text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground border border-border"
            />
            <Button type="submit" size="sm" loading={loading} disabled={!input.trim()}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
