"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Video,
  ArrowUpRight,
  Plus,
  Mail,
  Calendar as CalendarIcon,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatTime, formatDate } from "@/lib/utils";
import { Task, CalendarEvent, Job, EmailMessage, DashboardMetrics } from "@/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Queries
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: () => apiClient("/analytics/overview"),
  });

  const { data: todayTasks } = useQuery<Task[]>({
    queryKey: ["tasks", "today"],
    queryFn: () => apiClient("/tasks?status=TODO"),
  });

  const { data: todayEvents } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", "today"],
    queryFn: () => apiClient("/calendar"),
  });

  const { data: topJobs } = useQuery<Job[]>({
    queryKey: ["jobs", "top"],
    queryFn: () => apiClient("/jobs?min_match=75"),
  });

  const { data: importantEmails } = useQuery<EmailMessage[]>({
    queryKey: ["emails", "important"],
    queryFn: () => apiClient("/emails?only_actionable=true"),
  });

  // Complete Task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiClient(`/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "COMPLETED" }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  // Convert Email Fact to Task mutation
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

  const criticalCount = metrics?.critical_tasks_count || 0;
  const nextIv = metrics?.next_interview;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Intelligence Hero Banner */}
      <div className="relative p-6 rounded-3xl bg-gradient-to-r from-card via-card/95 to-primary/10 border border-border/80 shadow-lg shadow-black/5 overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 via-indigo-500/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" dot className="text-[10px] py-0.5 px-2.5">
                Daily Intelligence Brief
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {metrics?.today_date_str || "Friday, August 29, 2026"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome back, {metrics?.greeting_name || user?.full_name || "Alex"}.
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              You have <span className="font-bold text-rose-500">{criticalCount} critical task</span> and{" "}
              {nextIv ? (
                <span>
                  an upcoming technical interview with <span className="font-bold text-foreground">{nextIv.company}</span> at {nextIv.start_at}
                </span>
              ) : (
                "no interviews scheduled today"
              )}
              . All databases and integration feeds are actively synchronized.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link href="/planner">
              <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 h-9">
                <span>View Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link href="/assistant">
              <Button size="sm" variant="gradient" className="text-xs font-bold gap-2 h-9 shadow-md shadow-primary/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Copilot</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Deterministic Conflict Alert Banner (if active) */}
      {metrics?.has_schedule_conflicts && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs animate-slide-down shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-rose-500 text-xs tracking-wide">
                Schedule Conflict Detected
              </span>
              <p className="text-muted-foreground text-[11px] mt-0.5 truncate">
                Your Technical Interview with Apex Analytics (2:00 PM) overlaps CS401 Machine Learning Lecture (1:30 PM - 3:00 PM).
              </p>
            </div>
          </div>
          <Link href="/calendar" className="flex-shrink-0">
            <Button size="sm" variant="destructive" className="h-8 text-xs font-bold gap-1.5">
              <span>Resolve in Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Stat Summary Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Tasks */}
        <Card className="hover:border-rose-500/40 hover:-translate-y-0.5 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Critical Tasks</p>
              <h3 className="text-2xl font-black text-rose-500">{criticalCount}</h3>
              <p className="text-[10px] text-muted-foreground">High priority focus items</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Approaching Deadlines */}
        <Card className="hover:border-amber-500/40 hover:-translate-y-0.5 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Deadlines</p>
              <h3 className="text-2xl font-black text-foreground">{metrics?.upcoming_deadlines_count || 0}</h3>
              <p className="text-[10px] text-muted-foreground">Assignments & projects</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Next Interview */}
        <Card className="hover:border-primary/40 hover:-translate-y-0.5 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Next Interview</p>
              <h3 className="text-sm font-black text-foreground truncate">{nextIv ? nextIv.company : "None Scheduled"}</h3>
              <p className="text-[10px] text-muted-foreground truncate">{nextIv ? nextIv.start_at : "All clear today"}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
              <Video className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Top Job Matches */}
        <Card className="hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Top Job Fits</p>
              <h3 className="text-2xl font-black text-emerald-400">{metrics?.top_job_matches_count || 0}</h3>
              <p className="text-[10px] text-muted-foreground">Above 75% compatibility</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Main 2-Column Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Priority Tasks & Today's Schedule (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Tasks Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Priority Action Items</CardTitle>
                <CardDescription>Ranked by deterministic deadline urgency and impact score</CardDescription>
              </div>
              <Link href="/planner">
                <Button size="sm" variant="ghost" className="text-xs font-bold gap-1">
                  <span>Open Planner</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks && todayTasks.length > 0 ? (
                todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-secondary/50 border border-border/70 flex items-center justify-between gap-3 hover:bg-secondary/80 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        className="mt-0.5 h-5 w-5 rounded-lg border border-muted-foreground/40 hover:border-primary flex items-center justify-center text-transparent hover:text-primary transition-colors flex-shrink-0"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={
                              task.priority === "CRITICAL"
                                ? "critical"
                                : task.priority === "HIGH"
                                ? "high"
                                : "medium"
                            }
                            dot={task.priority === "CRITICAL"}
                            className="text-[9px] py-0 px-2"
                          >
                            {task.priority} (Score {task.calculated_score})
                          </Badge>
                          {task.due_at && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(task.due_at)}
                            </span>
                          )}
                          <span className="text-[9px] text-muted-foreground bg-card px-1.5 py-0.5 rounded border border-border font-mono">
                            {task.source_type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                  <p className="font-bold">No active tasks pending!</p>
                  <p className="text-[11px] mt-0.5">All priority focus items are completed.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule & Agenda</CardTitle>
                <CardDescription>Synchronized classes, labs, deadlines, and recruiter commitments</CardDescription>
              </div>
              <Link href="/calendar">
                <Button size="sm" variant="ghost" className="text-xs font-bold gap-1">
                  <span>Full Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayEvents && todayEvents.length > 0 ? (
                todayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      ev.has_conflict ? "bg-rose-500/10 border-rose-500/30" : "bg-secondary/40 border-border/70 hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="text-center w-16 font-mono font-bold text-xs text-primary bg-card/80 p-2 rounded-xl border border-border flex-shrink-0">
                        {formatTime(ev.start_at)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-xs truncate">{ev.title}</span>
                          {ev.has_conflict && (
                            <Badge variant="critical" dot className="text-[9px] py-0 px-1.5">
                              Overlap Alert
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {ev.location || (ev.meeting_url ? "Google Meet Video Call" : "No location specified")}
                        </p>
                      </div>
                    </div>

                    {ev.meeting_url && (
                      <a
                        href={ev.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover shadow-md shadow-primary/20 flex-shrink-0"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-muted-foreground">
                  <CalendarIcon className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
                  <p className="font-bold">No events on your calendar today</p>
                  <p className="text-[11px] mt-0.5">Great time for self-paced project and interview prep.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Top Matched Jobs & Actionable Emails (1 span) */}
        <div className="space-y-6">
          {/* Top Job Opportunities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Career Matches</CardTitle>
                <CardDescription>Tailored to your skills profile</CardDescription>
              </div>
              <Link href="/jobs">
                <Button size="sm" variant="ghost" className="text-xs font-bold">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {topJobs && topJobs.length > 0 ? (
                topJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3.5 rounded-2xl bg-secondary/50 border border-border/70 space-y-2 hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-foreground leading-tight">{job.title}</h4>
                        <p className="text-[10px] text-muted-foreground">{job.company_name} • {job.location}</p>
                      </div>
                      <Badge variant="success" dot className="font-extrabold text-[10px] py-0.5 px-2">
                        {job.match_score}% Fit
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.matched_skills.slice(0, 3).map((sk) => (
                        <span key={sk} className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No matching jobs calculated yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Email Intelligence */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actionable Emails</CardTitle>
                <CardDescription>Intelligence extracted from messages</CardDescription>
              </div>
              <Link href="/inbox">
                <Button size="sm" variant="ghost" className="text-xs font-bold">
                  Inbox
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {importantEmails && importantEmails.length > 0 ? (
                importantEmails.slice(0, 3).map((email) => {
                  const firstFact = email.extracted_facts?.[0];
                  return (
                    <div key={email.id} className="p-3.5 rounded-2xl bg-secondary/50 border border-border/70 space-y-2 hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="indigo" className="text-[9px] py-0 px-2 font-bold">
                          {email.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{formatDate(email.received_at)}</span>
                      </div>
                      <p className="text-xs font-bold text-foreground truncate">{email.subject}</p>
                      {firstFact && !firstFact.converted_to_task && (
                        <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-border/40">
                          <span className="text-[10px] text-muted-foreground truncate">{firstFact.value}</span>
                          <button
                            onClick={() => convertFactMutation.mutate(firstFact.id)}
                            className="text-[10px] font-bold text-primary hover:underline flex-shrink-0 flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Task</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No urgent actionable emails pending.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

