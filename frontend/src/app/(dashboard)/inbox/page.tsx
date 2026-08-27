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
    },
  });

  const categories = [
    { label: "All Inbox", value: "ALL" },
    { label: "Interviews", value: "INTERVIEW" },
    { label: "Opportunities", value: "JOB_OPPORTUNITY" },
    { label: "Assignments", value: "ASSIGNMENT" },
    { label: "Exams", value: "EXAM" },
    { label: "College", value: "COLLEGE" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox & Email Intelligence</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Deterministic extraction of interview invites, deadlines, and actionable tasks with confidence safety
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              selectedCategory === cat.value
                ? "bg-primary text-primary-foreground shadow-sm"
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
        <div className="lg:col-span-5 space-y-2.5">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-10">Syncing inbox messages...</p>
          ) : emails && emails.length > 0 ? (
            emails.map((email) => {
              const isSelected = selectedEmail?.id === email.id;
              return (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmailId(email.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? "bg-primary/10 border-primary/40 shadow-sm"
                      : "bg-card border-border hover:border-border/80 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground truncate">{email.sender_name || email.sender_email}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatDate(email.received_at)}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-xs truncate leading-snug">{email.subject}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{email.snippet}</p>

                  <div className="pt-1 flex items-center justify-between">
                    <Badge
                      variant={
                        email.category === "INTERVIEW"
                          ? "critical"
                          : email.category === "ASSIGNMENT"
                          ? "high"
                          : "neutral"
                      }
                      className="text-[9px]"
                    >
                      {email.category}
                    </Badge>
                    {email.is_actionable && (
                      <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Action Detected
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border p-6 text-xs text-muted-foreground">
              No emails found in this category.
            </div>
          )}
        </div>

        {/* Right Pane: Email Detail & Intelligence Card (7 cols) */}
        <div className="lg:col-span-7">
          {selectedEmail ? (
            <div className="space-y-4">
              {/* Extracted Facts Card (AI Safety Layer) */}
              {selectedEmail.extracted_facts && selectedEmail.extracted_facts.length > 0 && (
                <Card className="border-primary/30 bg-gradient-to-r from-card to-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm">Structured Extracted Intelligence</CardTitle>
                      </div>
                      <Badge variant="default" className="text-[9px]">
                        AI Safety Grounded
                      </Badge>
                    </div>
                    <CardDescription>
                      Facts extracted with confidence scores. Review and convert into planner tasks with full user control.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {selectedEmail.extracted_facts.map((fact: ExtractedFact) => (
                      <div
                        key={fact.id}
                        className="p-3 rounded-xl bg-card border border-border/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-primary font-bold">{fact.fact_type}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                              {fact.fact_nature} • {Math.round(fact.confidence * 100)}% Confidence
                            </span>
                          </div>
                          <p className="font-medium text-foreground text-xs">{fact.value}</p>
                          {fact.evidence && (
                            <p className="text-[10px] text-muted-foreground italic">"{fact.evidence}"</p>
                          )}
                        </div>

                        {fact.converted_to_task ? (
                          <Badge variant="success" className="gap-1 flex-shrink-0 text-[10px]">
                            <CheckCircle className="w-3 h-3" />
                            <span>In Planner</span>
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => convertFactMutation.mutate(fact.id)}
                            loading={convertFactMutation.isPending}
                            className="text-[11px] h-7 px-2.5 gap-1 flex-shrink-0"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Task</span>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-foreground">{selectedEmail.subject}</h2>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>
                          From: <strong className="text-foreground">{selectedEmail.sender_name}</strong> &lt;{selectedEmail.sender_email}&gt;
                        </span>
                        <span>•</span>
                        <span>{formatDate(selectedEmail.received_at)} {formatTime(selectedEmail.received_at)}</span>
                      </div>
                    </div>
                    <Badge variant={selectedEmail.category === "INTERVIEW" ? "critical" : "neutral"}>
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
            <Card className="p-12 text-center text-xs text-muted-foreground">
              Select an email on the left to review parsed details and extracted facts.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
