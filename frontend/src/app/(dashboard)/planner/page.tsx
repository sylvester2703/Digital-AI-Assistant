"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Task } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [activeTab, setActiveTab] = useState<"all" | "today" | "upcoming" | "overdue" | "completed">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [dueAt, setDueAt] = useState("");
  const [duration, setDuration] = useState(30);

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", activeTab],
    queryFn: () => {
      const param = activeTab === "all" ? "" : `?view=${activeTab}`;
      return apiClient(`/tasks${param}`);
    },
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient("/tasks", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setDueAt("");
    },
  });

  // Update Task Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/tasks/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTaskMutation.mutate({
      title,
      description,
      priority,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      estimated_duration_minutes: duration,
      status: "TODO",
    });
  };

  const kanbanColumns = [
    { title: "To Do", status: "TODO", badge: "default" as const },
    { title: "In Progress", status: "IN_PROGRESS", badge: "high" as const },
    { title: "Completed", status: "COMPLETED", badge: "success" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Productivity Planner</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize daily focus blocks with deterministic priority scoring and duration estimates
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-secondary/70 rounded-xl border border-border/80 shadow-inner">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "list" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "kanban" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2 font-bold shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2 overflow-x-auto select-none">
        {(["all", "today", "upcoming", "overdue", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-12">Loading planner tasks...</p>
          ) : tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl bg-card/85 backdrop-blur-sm border border-border/70 flex items-center justify-between gap-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-sm group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: task.id,
                        status: task.status === "COMPLETED" ? "TODO" : "COMPLETED",
                      })
                    }
                    className={`mt-0.5 h-5 w-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
                      task.status === "COMPLETED"
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                        : "border-muted-foreground/40 hover:border-primary text-transparent hover:text-primary"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div className="min-w-0 space-y-1">
                    <h3
                      className={`text-xs sm:text-sm font-bold truncate group-hover:text-primary transition-colors ${
                        task.status === "COMPLETED" ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge
                        variant={
                          task.priority === "CRITICAL"
                            ? "critical"
                            : task.priority === "HIGH"
                            ? "high"
                            : task.priority === "MEDIUM"
                            ? "medium"
                            : "low"
                        }
                        dot={task.priority === "CRITICAL"}
                        className="text-[9px] py-0 px-2"
                      >
                        {task.priority} (Score {task.calculated_score})
                      </Badge>
                      {task.due_at && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {formatDate(task.due_at)} {formatTime(task.due_at)}
                        </span>
                      )}
                      {task.estimated_duration_minutes && (
                        <span className="text-[10px] text-muted-foreground font-mono bg-secondary/80 px-2 py-0.5 rounded-md border border-border/60">
                          {task.estimated_duration_minutes}m
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/60 font-mono">
                        {task.source_type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-card/60 backdrop-blur-sm rounded-3xl border border-dashed border-border p-8 space-y-2">
              <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto opacity-40 mb-2" />
              <h3 className="text-sm font-bold text-foreground">No tasks in this view</h3>
              <p className="text-xs text-muted-foreground">Add a new task to organize your study schedule.</p>
              <Button size="sm" onClick={() => setIsCreateOpen(true)} className="mt-4 font-bold">
                Add Task
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map((col) => {
            const colTasks = tasks?.filter((t) => t.status === col.status) || [];
            return (
              <div key={col.status} className="bg-secondary/40 rounded-3xl border border-border/70 p-4 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">{col.title}</h3>
                  <Badge variant={col.badge} className="text-[10px] py-0 px-2 font-bold">
                    {colTasks.length}
                  </Badge>
                </div>

                <div className="space-y-3 min-h-[320px]">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-foreground line-clamp-2 leading-tight">{task.title}</span>
                        <Badge
                          variant={task.priority === "CRITICAL" ? "critical" : task.priority === "HIGH" ? "high" : "medium"}
                          dot={task.priority === "CRITICAL"}
                          className="text-[9px] py-0 px-1.5"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.due_at && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(task.due_at)}
                        </p>
                      )}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground font-mono">{task.source_type}</span>
                        <div className="flex gap-1.5 text-[10px] font-bold">
                          {col.status !== "TODO" && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: task.id, status: "TODO" })}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              ← To Do
                            </button>
                          )}
                          {col.status !== "IN_PROGRESS" && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: task.id, status: "IN_PROGRESS" })}
                              className="text-primary hover:underline"
                            >
                              In Progress
                            </button>
                          )}
                          {col.status !== "COMPLETED" && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ id: task.id, status: "COMPLETED" })}
                              className="text-emerald-400 hover:underline"
                            >
                              Done →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Dialog */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Action Task">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Task Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Complete ML Assignment 3 or Review SQL questions"
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add relevant instructions, syllabus notes, or links..."
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                <option value="CRITICAL">Critical (Score 85+)</option>
                <option value="HIGH">High (Score 70+)</option>
                <option value="MEDIUM">Medium (Score 50)</option>
                <option value="LOW">Low (Score 30)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Est. Duration (Minutes)</label>
              <input
                type="number"
                min={5}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Due Date & Time</label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createTaskMutation.isPending} className="font-bold">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

