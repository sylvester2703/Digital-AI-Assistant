"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  Bell,
  ExternalLink,
  Layers,
  Sparkles,
  BookMarked,
  Award,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Course, Assignment, Announcement } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

export default function AcademicsPage() {
  const queryClient = useQueryClient();
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => apiClient("/courses"),
  });

  const { data: assignments, isLoading: loadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["assignments"],
    queryFn: () => apiClient("/assignments"),
  });

  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: () => apiClient("/courses/announcements"),
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient(`/assignments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ submission_status: status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient("/assignments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setIsAddAssignmentOpen(false);
      setAssignmentTitle("");
      setAssignmentDesc("");
      setDueAt("");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !assignmentTitle.trim() || !dueAt) return;

    createAssignmentMutation.mutate({
      course_id: selectedCourseId,
      title: assignmentTitle,
      description: assignmentDesc,
      due_at: new Date(dueAt).toISOString(),
      priority,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Academic Intelligence</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Course curriculum, coursework deliverables, and automated syllabus deadline synchronization
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button size="sm" onClick={() => setIsAddAssignmentOpen(true)} className="gap-2 font-bold shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </Button>
        </div>
      </div>

      {/* Google Classroom Integration Status Card */}
      <div className="p-4 rounded-3xl bg-secondary/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 text-xs shadow-sm">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-xs">Google Classroom Active Synchronizer</span>
              <Badge variant="success" dot className="text-[9px] py-0 px-2">Active Feed</Badge>
            </div>
            <p className="text-muted-foreground text-[11px] mt-0.5 truncate">
              Course syllabus deadlines, professor notices, and materials are automatically mapped without duplicates.
            </p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground flex-shrink-0 font-mono bg-card px-2.5 py-1 rounded-xl border border-border">
          Synced 5m ago
        </span>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Enrolled Courses (Fall 2026)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses && courses.length > 0 ? (
            courses.map((c) => (
              <Card key={c.id} className="hover:-translate-y-1 transition-all overflow-hidden border-border/70 group">
                <div className="h-1.5" style={{ backgroundColor: c.color || "#6366f1" }} />
                <CardHeader className="p-4 pb-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold text-primary">{c.code}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{c.term}</span>
                  </div>
                  <CardTitle className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {c.title}
                  </CardTitle>
                  <CardDescription className="text-[11px] truncate">{c.instructor || "Faculty Instructor"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/50">
                  <span className="font-medium text-foreground">Active Term</span>
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Enrolled
                  </span>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Loading courses...</p>
          )}
        </div>
      </div>

      {/* Assignments & Announcements Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Coursework & Project Deadlines</CardTitle>
                <CardDescription>Track submission status and auto-synced planner priorities</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAssignments ? (
                <p className="text-xs text-muted-foreground text-center py-10">Loading assignments...</p>
              ) : assignments && assignments.length > 0 ? (
                assignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl bg-secondary/40 border border-border/70 flex items-center justify-between gap-3 text-xs hover:border-primary/40 hover:bg-secondary/60 transition-all group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() =>
                          updateSubmissionMutation.mutate({
                            id: a.id,
                            status: a.submission_status === "SUBMITTED" ? "PENDING" : "SUBMITTED",
                          })
                        }
                        className={`mt-0.5 h-5 w-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                          a.submission_status === "SUBMITTED"
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                            : "border-muted-foreground/40 hover:border-primary text-transparent hover:text-primary"
                        }`}
                        title="Toggle Submission Status"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-extrabold text-primary">[{a.course_code}]</span>
                          <span
                            className={`font-bold text-xs truncate group-hover:text-primary transition-colors ${
                              a.submission_status === "SUBMITTED" ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {a.title}
                          </span>
                        </div>
                        {a.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{a.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            Due: {formatDate(a.due_at)} {formatTime(a.due_at)}
                          </span>
                          <Badge variant={a.priority === "HIGH" ? "high" : a.priority === "CRITICAL" ? "critical" : "medium"} className="text-[9px] py-0 px-1.5">
                            {a.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={a.submission_status === "SUBMITTED" ? "success" : "indigo"}
                      dot={a.submission_status === "SUBMITTED"}
                      className="text-[9px] py-0.5 px-2 flex-shrink-0"
                    >
                      {a.submission_status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No assignments listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <CardTitle>Course Announcements</CardTitle>
              </div>
              <CardDescription>Direct syllabus notices from faculty instructors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements && announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-2xl bg-secondary/50 border border-border/70 space-y-1.5 text-xs hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-primary font-bold">[{ann.course_code}]</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{formatDate(ann.posted_at)}</span>
                    </div>
                    <h4 className="font-bold text-foreground">{ann.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{ann.content}</p>
                    {ann.author_name && (
                      <p className="text-[10px] text-foreground font-semibold pt-1">— {ann.author_name}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-8">No announcements posted.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Assignment Modal */}
      <Modal isOpen={isAddAssignmentOpen} onClose={() => setIsAddAssignmentOpen(false)} title="Add Course Assignment">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Course *</label>
            <select
              required
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            >
              <option value="">Select a course...</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Assignment Title *</label>
            <input
              required
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="e.g. Lab 5: SQL Window Functions"
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Description</label>
            <textarea
              rows={2}
              value={assignmentDesc}
              onChange={(e) => setAssignmentDesc(e.target.value)}
              placeholder="Required deliverables, guidelines, or syllabus notes..."
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Due Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createAssignmentMutation.isPending} className="font-bold">
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

