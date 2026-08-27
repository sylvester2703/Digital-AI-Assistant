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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Intelligence</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Course curriculum, coursework assignments, and automated deadline sync
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddAssignmentOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </Button>
        </div>
      </div>

      {/* Google Classroom Integration Status Card */}
      <div className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Google Classroom Connectivity</span>
              <Badge variant="success" className="text-[9px]">Active Sync</Badge>
            </div>
            <p className="text-muted-foreground text-[11px] mt-0.5">
              Assignments and announcements are incrementally synchronized to your planner without duplicates.
            </p>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground flex-shrink-0 font-mono">Last Synced: 15m ago</span>
      </div>

      {/* Courses Grid */}
      <div>
        <h2 className="text-sm font-bold tracking-tight mb-3">Enrolled Courses (Fall 2026)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses && courses.length > 0 ? (
            courses.map((c) => (
              <Card key={c.id} className="border-t-4" style={{ borderTopColor: c.color }}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">{c.code}</span>
                    <span className="text-[10px] text-muted-foreground">{c.term}</span>
                  </div>
                  <CardTitle className="text-xs font-bold mt-1 line-clamp-1">{c.title}</CardTitle>
                  <CardDescription className="text-[11px] truncate">{c.instructor || "Faculty Instructor"}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-1 text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>Semester Active</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Coursework & Assignment Deadlines</CardTitle>
                <CardDescription>Track submission status and auto-synced planner priorities</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAssignments ? (
                <p className="text-xs text-muted-foreground text-center py-6">Loading assignments...</p>
              ) : assignments && assignments.length > 0 ? (
                assignments.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl bg-secondary/40 border border-border/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() =>
                          updateSubmissionMutation.mutate({
                            id: a.id,
                            status: a.submission_status === "SUBMITTED" ? "PENDING" : "SUBMITTED",
                          })
                        }
                        className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                          a.submission_status === "SUBMITTED"
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-muted-foreground/40 hover:border-primary text-transparent hover:text-primary"
                        }`}
                        title="Toggle Submission Status"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-primary">[{a.course_code}]</span>
                          <span
                            className={`font-semibold truncate ${
                              a.submission_status === "SUBMITTED" ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {a.title}
                          </span>
                        </div>
                        {a.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{a.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            Due: {formatDate(a.due_at)} {formatTime(a.due_at)}
                          </span>
                          <Badge variant={a.priority === "HIGH" ? "high" : "medium"} className="text-[9px] py-0">
                            {a.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={a.submission_status === "SUBMITTED" ? "success" : "neutral"}
                      className="text-[9px] flex-shrink-0"
                    >
                      {a.submission_status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No assignments listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Announcements (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <CardTitle>Course Announcements</CardTitle>
              </div>
              <CardDescription>Direct notices from faculty instructors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements && announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-primary font-bold">{ann.course_code}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(ann.posted_at)}</span>
                    </div>
                    <h4 className="font-bold text-foreground">{ann.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{ann.content}</p>
                    {ann.author_name && (
                      <p className="text-[10px] text-foreground font-medium pt-1">— {ann.author_name}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No announcements posted.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Assignment Modal */}
      <Modal isOpen={isAddAssignmentOpen} onClose={() => setIsAddAssignmentOpen(false)} title="Add Course Assignment">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Course *</label>
            <select
              required
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
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
            <label className="font-semibold text-foreground block mb-1">Assignment Title *</label>
            <input
              required
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="e.g. Lab 5: SQL Window Functions"
              className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Description</label>
            <textarea
              rows={2}
              value={assignmentDesc}
              onChange={(e) => setAssignmentDesc(e.target.value)}
              placeholder="Required deliverables, guidelines..."
              className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Due Date & Time *</label>
              <input
                required
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createAssignmentMutation.isPending}>
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
