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
    <div className="space-y-6">
      {/* 1. Intelligence Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-card via-card to-primary/10 border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Daily Briefing</span>
            <span className="text-xs text-muted-foreground">• {metrics?.today_date_str || "Today"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good morning, {metrics?.greeting_name || "Alex"}.
          </h1>
          <p className="text-xs text-muted-foreground max-w-2xl">
            You have <span className="font-semibold text-foreground">{criticalCount} critical task</span> and{" "}
            {nextIv ? (
              <span>
                an upcoming interview with <span className="font-semibold text-foreground">{nextIv.company}</span> at {nextIv.start_at}
              </span>
            ) : (
              "no interviews scheduled today"
            )}
            . All your schedules and applications are synced.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/planner">
            <Button size="sm" variant="outline">
              Open Planner
            </Button>
          </Link>
          <Link href="/assistant">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Assistant</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Deterministic Conflict Alert Banner (if any) */}
      {metrics?.has_schedule_conflicts && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs animate-slide-down">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div>
              <span className="font-bold text-rose-500">Schedule Conflict Detected</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Your Technical Interview with Apex Analytics (2:00 PM) overlaps with CS401 Machine Learning Lecture (1:30 PM - 3:00 PM).
              </p>
            </div>
          </div>
          <Link href="/calendar">
            <Button size="sm" variant="destructive" className="h-7 text-xs">
              Resolve in Calendar
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Stat Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Tasks */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Critical Tasks</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-500">{criticalCount}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">High priority focus items</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Approaching Deadlines */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Deadlines</p>
              <h3 className="text-2xl font-bold mt-1">{metrics?.upcoming_deadlines_count || 0}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Assignments & projects</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Next Interview */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Next Interview</p>
              <h3 className="text-sm font-bold mt-1 truncate">{nextIv ? nextIv.company : "None Scheduled"}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{nextIv ? nextIv.start_at : "All clear"}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Top Job Matches */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Top Job Matches</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-500">{metrics?.top_job_matches_count || 0}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Above 75% compatibility</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
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
                <Button size="sm" variant="ghost" className="text-xs gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {todayTasks && todayTasks.length > 0 ? (
                todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between gap-3 hover:bg-secondary/80 transition-colors group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        className="mt-0.5 h-4 w-4 rounded border border-muted-foreground/40 hover:border-primary flex items-center justify-center text-transparent hover:text-primary transition-colors flex-shrink-0"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={task.priority === "CRITICAL" ? "critical" : task.priority === "HIGH" ? "high" : "medium"} className="text-[9px] py-0">
                            {task.priority} (Score {task.calculated_score})
                          </Badge>
                          {task.due_at && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatTime(task.due_at)}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/80 font-mono">[{task.source_type}]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No active tasks. You are all caught up!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Synchronized classes, labs, and interview commitments</CardDescription>
              </div>
              <Link href="/calendar">
                <Button size="sm" variant="ghost" className="text-xs gap-1">
                  <span>Calendar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayEvents && todayEvents.length > 0 ? (
                todayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      ev.has_conflict ? "bg-rose-500/10 border-rose-500/30" : "bg-secondary/40 border-border/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-center w-14 font-mono font-bold text-[11px] text-primary">
                        {formatTime(ev.start_at)}
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{ev.title}</span>
                          {ev.has_conflict && <Badge variant="critical" className="text-[9px]">Overlap</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {ev.location || (ev.meeting_url ? "Online Meeting" : "No location specified")}
                        </p>
                      </div>
                    </div>

                    {ev.meeting_url && (
                      <a
                        href={ev.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold flex items-center gap-1 hover:bg-primary-hover shadow-sm"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No scheduled events today. Great day for self-directed study!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Matched Jobs & Important Emails (1 span) */}
        <div className="space-y-6">
          {/* Top Job Opportunities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Role Matches</CardTitle>
                <CardDescription>Tailored to your skills and preferences</CardDescription>
              </div>
              <Link href="/jobs">
                <Button size="sm" variant="ghost" className="text-xs">
                  All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {topJobs && topJobs.length > 0 ? (
                topJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3 rounded-xl bg-secondary/50 border border-border/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{job.title}</h4>
                        <p className="text-[11px] text-muted-foreground">{job.company_name} • {job.location}</p>
                      </div>
                      <Badge variant="high" className="font-bold text-[10px]">
                        {job.match_score}% Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills.slice(0, 3).map((sk) => (
                        <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded bg-card border border-border text-foreground">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No job matches calculated yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Email Intelligence */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actionable Emails</CardTitle>
                <CardDescription>Parsed from your inbox</CardDescription>
              </div>
              <Link href="/inbox">
                <Button size="sm" variant="ghost" className="text-xs">
                  Inbox
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {importantEmails && importantEmails.length > 0 ? (
                importantEmails.slice(0, 3).map((email) => {
                  const firstFact = email.extracted_facts?.[0];
                  return (
                    <div key={email.id} className="p-3 rounded-xl bg-secondary/50 border border-border/80 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="default" className="text-[9px]">
                          {email.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(email.received_at)}</span>
                      </div>
                      <p className="text-xs font-semibold truncate">{email.subject}</p>
                      {firstFact && !firstFact.converted_to_task && (
                        <div className="pt-1 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-muted-foreground truncate">{firstFact.value}</span>
                          <button
                            onClick={() => convertFactMutation.mutate(firstFact.id)}
                            className="text-[10px] font-bold text-primary hover:underline flex-shrink-0 flex items-center gap-0.5"
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
                <div className="text-center py-6 text-xs text-muted-foreground">
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
