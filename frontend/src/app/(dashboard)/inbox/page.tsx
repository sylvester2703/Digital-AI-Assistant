"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inbox as InboxIcon,
  Mail,
  CheckCircle,
  Plus,
  Sparkles,
  Video,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmailMessage, ExtractedFact } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const { data: emails, isLoading } = useQuery<EmailMessage[]>({
    queryKey: ["emails", selectedCategory],
    queryFn: () => {
      const param = selectedCategory === "ALL" ? "" : `?category=${selectedCategory}`;
      return apiClient(`/emails${param}`);
    },
  });

  const selectedEmail = emails?.find((e) => e.id === selectedEmailId) || (emails && emails.length > 0 ? emails[0] : null);

  const convertFactMutation = useMutation({
    mutationFn: (factId: string) =>
      apiClient(`/emails/facts/${factId}/convert-to-task`, {
        method: "POST",
        body: JSON.stringify({ priority: "HIGH" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const categories = [
    { label: "All Messages", value: "ALL" },
    { label: "Interviews", value: "INTERVIEW" },
    { label: "Career Leads", value: "JOB_OPPORTUNITY" },
    { label: "Assignments", value: "ASSIGNMENT" },
    { label: "Exams", value: "EXAM" },
    { label: "University", value: "COLLEGE" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Inbox & Intelligence Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated fact extraction for interview invites, coursework deadlines, and recruiter follow-ups
          </p>
        </div>
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          AI Fact Extractor Active
        </Badge>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2 overflow-x-auto select-none">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Email List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-12">Syncing inbox messages...</p>
          ) : emails && emails.length > 0 ? (
            emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all text-xs space-y-2 select-none ${
                    isSelected
                      ? "bg-card border-primary/50 shadow-md shadow-primary/10 ring-1 ring-primary/40 -translate-y-0.5"
                      : "bg-secondary/40 border-border/70 hover:border-border hover:bg-secondary/70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground truncate">{email.sender_name || email.sender_email}</span>
                    <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0">{formatDate(email.received_at)}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-xs truncate leading-snug">{email.subject}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal">{email.snippet}</p>

                  <div className="pt-1.5 flex items-center justify-between">
                    <Badge
                      variant={
                        email.category === "INTERVIEW"
                          ? "critical"
                          : email.category === "ASSIGNMENT"
                          ? "high"
                          : "indigo"
                      }
                      dot={email.category === "INTERVIEW"}
                      className="text-[9px] py-0 px-2"
                    >
                      {email.category}
                    </Badge>
                    {email.is_actionable && (
                      <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary animate-spin-slow" />
                        Action Extracted
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-card/60 backdrop-blur-sm rounded-3xl border border-dashed border-border p-6 text-xs text-muted-foreground">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
              <p className="font-bold text-foreground">No emails found in this category.</p>
            </div>
          )}
        </div>

        {/* Right Pane: Email Detail & Intelligence Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedEmail ? (
            <div className="space-y-4">
              {/* Extracted Facts Card (AI Safety Layer) */}
              {selectedEmail.extracted_facts && selectedEmail.extracted_facts.length > 0 && (
                <Card className="border-primary/40 bg-gradient-to-br from-card via-card to-primary/5 shadow-md shadow-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm">Structured AI Intelligence</CardTitle>
                      </div>
                      <Badge variant="indigo" dot className="text-[9px] py-0.5 px-2">
                        Deterministic Grounding
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Extracted actionable facts with evidence citations. One-click conversion to planner tasks.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-1">
                    {selectedEmail.extracted_facts.map((fact: ExtractedFact) => (
                      <div
                        key={fact.id}
                        className="p-3.5 rounded-2xl bg-secondary/60 border border-border/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] text-primary font-extrabold uppercase">{fact.fact_type}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-card border border-border text-muted-foreground font-mono">
                              {fact.fact_nature} • {Math.round(fact.confidence * 100)}% Confidence
                            </span>
                          </div>
                          <p className="font-bold text-foreground text-xs">{fact.value}</p>
                          {fact.evidence && (
                            <p className="text-[10px] text-muted-foreground italic line-clamp-2">"{fact.evidence}"</p>
                          )}
                        </div>

                        {fact.converted_to_task ? (
                          <Badge variant="success" dot className="gap-1 flex-shrink-0 text-[10px] py-1 px-2.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Planner</span>
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => convertFactMutation.mutate(fact.id)}
                            loading={convertFactMutation.isPending}
                            className="text-[11px] h-8 px-3 gap-1.5 flex-shrink-0 font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Tasks</span>
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Message Body Card */}
              <Card>
                <CardHeader className="border-b border-border/60 pb-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-base font-extrabold tracking-tight text-foreground">{selectedEmail.subject}</h2>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span>
                          From: <strong className="text-foreground">{selectedEmail.sender_name}</strong> &lt;{selectedEmail.sender_email}&gt;
                        </span>
                        <span>•</span>
                        <span className="font-mono">{formatDate(selectedEmail.received_at)} {formatTime(selectedEmail.received_at)}</span>
                      </div>
                    </div>
                    <Badge variant={selectedEmail.category === "INTERVIEW" ? "critical" : "indigo"} className="text-[10px] py-0.5 px-2">
                      {selectedEmail.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedEmail.body_text || selectedEmail.snippet}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-16 text-center text-xs text-muted-foreground">
              Select an email on the left to review parsed details and extracted facts.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
