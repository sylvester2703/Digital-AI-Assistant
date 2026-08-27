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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Interview Center & AI Prep Hub</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Recruiter interview commitments, schedule conflict protection, and grounded role-specific AI preparation kits
        </p>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center col-span-2 py-10">Loading interview schedules...</p>
        ) : interviews && interviews.length > 0 ? (
          interviews.map((iv) => (
            <Card
              key={iv.id}
              className={`hover:border-primary/40 transition-all ${
                iv.conflicts_detected ? "border-rose-500/30" : ""
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                      Round {iv.round_number} • {iv.round_name}
                    </span>
                    <CardTitle className="text-base font-bold mt-0.5">{iv.company_name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">{iv.role_title}</p>
                  </div>
                  <Badge variant={iv.status === "SCHEDULED" ? "critical" : "neutral"}>
                    {iv.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3 text-xs">
                {/* Time & Conflict */}
                <div className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <div className="font-bold text-foreground">
                        {formatDate(iv.start_at)} ({formatTime(iv.start_at)} – {formatTime(iv.end_at)})
                      </div>
                      <span className="text-[10px] text-muted-foreground">{iv.interview_type}</span>
                    </div>
                  </div>

                  {iv.conflicts_detected && (
                    <Badge variant="critical" className="text-[9px] gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>Conflict</span>
                    </Badge>
                  )}
                </div>

                {iv.interviewer_info && (
                  <p className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">Interviewer:</strong> {iv.interviewer_info}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenPrep(iv)}
                    className="text-xs flex-1 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Prep Kit</span>
                  </Button>

                  {iv.meeting_link && (
                    <a
                      href={iv.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary-hover shadow-sm"
                    >
                      <span>Join Call</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 col-span-2 text-xs text-muted-foreground bg-card rounded-2xl border border-dashed border-border p-6">
            No interviews scheduled right now. Keep applying to job opportunities!
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
            <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
              <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
              <p>Analyzing job requirements, expected interview domains, and compiling structured prep guide...</p>
            </div>
          ) : prepData ? (
            <div className="space-y-5 text-xs">
              {/* Company & Role Overview */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>Company Context & Target Focus</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{prepData.company_overview}</p>
                <p className="text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                  <strong className="text-foreground">Role Focus:</strong> {prepData.role_summary}
                </p>
              </div>

              {/* Top Skills Tags */}
              <div className="space-y-1.5">
                <span className="font-bold text-foreground block">Key Evaluated Competencies</span>
                <div className="flex flex-wrap gap-1">
                  {prepData.top_skills.map((skill) => (
                    <Badge key={skill} variant="default" className="text-[10px]">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Technical Questions */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Expected Technical Questions</span>
                </div>
                <div className="space-y-2">
                  {prepData.technical_questions.map((tq, i) => (
                    <div key={i} className="p-3 rounded-xl bg-card border border-border space-y-1">
                      <p className="font-semibold text-foreground">Q{i + 1}: {tq.question}</p>
                      <p className="text-[11px] text-muted-foreground">
                        <strong className="text-primary">Key Focus:</strong> {tq.key_focus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Coding / SQL & Python Challenges */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sample Live SQL / Python Scenarios</span>
                </div>
                <div className="space-y-2">
                  {prepData.sql_questions?.map((sq, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border space-y-1">
                      <p className="font-semibold text-foreground">SQL Task: {sq.question}</p>
                      <pre className="font-mono text-[10px] bg-card p-2 rounded border border-border/80 overflow-x-auto text-primary">
                        {sq.sample_syntax}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions to Ask Interviewer */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>High-Impact Questions to Ask Your Interviewer</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground p-3 bg-secondary/40 rounded-xl border border-border">
                  {prepData.questions_to_ask.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>

              {/* 24-Hour Checklist */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>24-Hour Final Preparation Checklist</span>
                </div>
                <div className="space-y-1.5">
                  {prepData.preparation_checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-foreground">
                      <CheckSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>{item}</span>
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
