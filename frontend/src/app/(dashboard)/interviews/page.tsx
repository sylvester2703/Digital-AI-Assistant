"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Video,
  Sparkles,
  ExternalLink,
  Clock,
  CheckSquare,
  Building,
  Calendar,
  AlertTriangle,
  Code,
  HelpCircle,
  FileCheck,
  Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Interview, InterviewPrep } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function InterviewsPage() {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [prepData, setPrepData] = useState<InterviewPrep | null>(null);

  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["interviews"],
    queryFn: () => apiClient("/interviews"),
  });

  const generatePrepMutation = useMutation({
    mutationFn: (interviewId: string) =>
      apiClient<InterviewPrep>(`/interviews/${interviewId}/prep`),
    onSuccess: (data) => {
      setPrepData(data);
    },
  });

  const handleOpenPrep = (interview: Interview) => {
    setSelectedInterview(interview);
    generatePrepMutation.mutate(interview.id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Interview Center & AI Prep Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recruiter interview commitments, schedule conflict protection, and grounded role-specific AI preparation kits
          </p>
        </div>
        <Badge variant="high" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          Prep Engine Ready
        </Badge>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center col-span-2 py-16">Loading interview schedules...</p>
        ) : interviews && interviews.length > 0 ? (
          interviews.map((iv) => (
            <Card
              key={iv.id}
              className={`hover:border-primary/50 hover:-translate-y-1 transition-all group shadow-sm ${
                iv.conflicts_detected ? "border-rose-500/40" : ""
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider font-mono bg-secondary/80 px-2 py-0.5 rounded border border-border/60">
                      Round {iv.round_number} • {iv.round_name}
                    </span>
                    <CardTitle className="text-base font-extrabold group-hover:text-primary transition-colors">
                      {iv.company_name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">{iv.role_title}</p>
                  </div>
                  <Badge
                    variant={iv.status === "SCHEDULED" ? "critical" : "indigo"}
                    dot={iv.status === "SCHEDULED"}
                    className="text-[10px] py-0.5 px-2"
                  >
                    {iv.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
                {/* Time & Conflict Pill */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                  iv.conflicts_detected ? "bg-rose-500/10 border-rose-500/30" : "bg-secondary/40 border-border/70"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-card border border-border flex items-center justify-center text-primary flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground font-mono">
                        {formatDate(iv.start_at)} ({formatTime(iv.start_at)} – {formatTime(iv.end_at)})
                      </div>
                      <span className="text-[10px] text-muted-foreground">{iv.interview_type}</span>
                    </div>
                  </div>

                  {iv.conflicts_detected && (
                    <Badge variant="critical" dot className="text-[9px] py-0 px-2">
                      Schedule Conflict
                    </Badge>
                  )}
                </div>

                {iv.interviewer_info && (
                  <p className="text-[11px] text-muted-foreground bg-secondary/30 p-2 rounded-xl border border-border/50">
                    <strong className="text-foreground font-bold">Interviewer:</strong> {iv.interviewer_info}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2.5">
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => handleOpenPrep(iv)}
                    className="text-xs flex-1 gap-2 font-bold h-9 shadow-md shadow-primary/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>Generate AI Prep Kit</span>
                  </Button>

                  {iv.meeting_link && (
                    <a
                      href={iv.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover shadow-md shadow-primary/20 h-9"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 col-span-2 text-xs text-muted-foreground bg-card/60 backdrop-blur-sm rounded-3xl border border-dashed border-border p-8 space-y-2">
            <Video className="w-10 h-10 mx-auto opacity-40 text-muted-foreground mb-2" />
            <h3 className="text-sm font-bold text-foreground">No interviews scheduled yet</h3>
            <p className="text-xs text-muted-foreground">Keep applying to jobs in your radar to generate recruiter screen invites.</p>
          </div>
        )}
      </div>

      {/* AI Interview Prep Kit Modal */}
      {selectedInterview && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedInterview(null);
            setPrepData(null);
          }}
          title={`AI Interview Prep Kit — ${selectedInterview.company_name}`}
          description={`${selectedInterview.role_title} • Round ${selectedInterview.round_number}: ${selectedInterview.round_name}`}
          maxWidth="2xl"
        >
          {generatePrepMutation.isPending ? (
            <div className="py-16 text-center text-xs text-muted-foreground space-y-3">
              <span className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
              <p className="font-bold text-foreground">Synthesizing role requirements & expected technical domains...</p>
              <p className="text-[11px] text-muted-foreground">Compiling sample SQL scenarios, technical questions, and company context.</p>
            </div>
          ) : prepData ? (
            <div className="space-y-5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Company & Role Overview */}
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/80 space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground text-xs">
                  <Building className="w-4 h-4 text-primary" />
                  <span>Company Context & Target Focus</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{prepData.company_overview}</p>
                <p className="text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                  <strong className="text-foreground">Role Focus:</strong> {prepData.role_summary}
                </p>
              </div>

              {/* Top Skills Tags */}
              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Key Evaluated Competencies</span>
                <div className="flex flex-wrap gap-1.5">
                  {prepData.top_skills.map((skill) => (
                    <Badge key={skill} variant="indigo" className="text-[10px] py-0.5 px-2 font-bold">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Technical Questions */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span>Expected Technical Questions</span>
                </div>
                <div className="space-y-2.5">
                  {prepData.technical_questions.map((tq, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-card border border-border space-y-1 shadow-sm">
                      <p className="font-bold text-foreground">Q{i + 1}: {tq.question}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-primary font-bold">Recommended Framing:</strong> {tq.key_focus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Coding / SQL & Python Challenges */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span>Sample Live SQL / Python Scenarios</span>
                </div>
                <div className="space-y-2.5">
                  {prepData.sql_questions?.map((sq, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-secondary/40 border border-border/80 space-y-2">
                      <p className="font-bold text-foreground">SQL Task: {sq.question}</p>
                      <pre className="font-mono text-[10px] bg-card p-3 rounded-xl border border-border overflow-x-auto text-primary leading-relaxed shadow-inner">
                        {sq.sample_syntax}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to Ask Interviewer */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>High-Impact Questions to Ask Your Interviewer</span>
                </div>
                <ul className="space-y-1.5 text-muted-foreground p-3.5 bg-secondary/40 rounded-2xl border border-border text-xs">
                  {prepData.questions_to_ask.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 24-Hour Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>24-Hour Final Preparation Checklist</span>
                </div>
                <div className="space-y-2">
                  {prepData.preparation_checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-foreground bg-card p-2.5 rounded-xl border border-border">
                      <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}

