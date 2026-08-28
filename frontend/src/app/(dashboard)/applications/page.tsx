"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Clock,
  Send,
  CheckCircle,
  Building,
  MapPin,
  List,
  LayoutGrid,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { JobApplication, FollowUp } from "@/types";
import { formatDate } from "@/lib/utils";

const PIPELINE_STAGES = [
  { key: "SAVED", label: "Saved Leads", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", badge: "default" as const },
  { key: "APPLIED", label: "Applied", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", badge: "indigo" as const },
  { key: "ASSESSMENT", label: "Assessment", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", badge: "amber" as const },
  { key: "INTERVIEW", label: "Interview", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", badge: "high" as const },
  { key: "OFFER", label: "Offer Received", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badge: "success" as const },
  { key: "REJECTED", label: "Archived", color: "bg-rose-500/20 text-rose-400 border-rose-500/30", badge: "critical" as const },
];

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const { data: applications, isLoading } = useQuery<JobApplication[]>({
    queryKey: ["applications"],
    queryFn: () => apiClient("/applications"),
  });

  const { data: followUps } = useQuery<FollowUp[]>({
    queryKey: ["follow-ups"],
    queryFn: () => apiClient("/applications/follow-ups"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient(`/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const resolveFollowUpMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      apiClient(`/applications/follow-ups/${id}/action`, {
        method: "POST",
        body: JSON.stringify({ status: action }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient("/applications", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setIsAddOpen(false);
      setCompanyName("");
      setRoleTitle("");
      setNotes("");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    createApplicationMutation.mutate({
      company_name: companyName,
      role_title: roleTitle,
      status,
      recruiter_name: recruiterName || null,
      recruiter_email: recruiterEmail || null,
      location: location || null,
      notes: notes || null,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Job Application Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track interview progression lifecycle from initial lead to offer with automated recruiter follow-ups
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 bg-secondary/70 rounded-xl border border-border/80 shadow-inner">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "kanban" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === "table" ? "bg-card text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-2 font-bold shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* Follow-up Recommendations Panel */}
      {followUps && followUps.length > 0 && (
        <Card className="border-indigo-500/30 bg-gradient-to-r from-card via-card to-indigo-500/5 shadow-md shadow-indigo-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
                <CardTitle className="text-sm">Follow-up Action Required</CardTitle>
              </div>
              <Badge variant="indigo" dot className="text-[10px] py-0.5 px-2 font-bold">
                {followUps.length} Pending Actions
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Applications with no recruiter response for 7+ days. Review pre-drafted follow-up templates below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUps.map((fu) => (
              <div
                key={fu.id}
                className="p-4 rounded-2xl bg-secondary/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 text-xs shadow-sm"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-xs">{fu.company_name}</span>
                    <span className="text-muted-foreground text-xs">({fu.role_title})</span>
                    <Badge variant="amber" className="text-[9px] py-0 px-1.5 font-mono">Due {formatDate(fu.due_date)}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic bg-card/60 p-2.5 rounded-xl border border-border/50 font-mono">
                    "{fu.suggested_message}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveFollowUpMutation.mutate({ id: fu.id, action: "SNOOZED" })}
                    className="text-[11px] h-8 px-3 font-bold"
                  >
                    Snooze (7d)
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => resolveFollowUpMutation.mutate({ id: fu.id, action: "COMPLETED" })}
                    className="text-[11px] h-8 px-3 gap-1.5 font-bold shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Sent</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Kanban Board View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageApps = applications?.filter((a) => a.status === stage.key) || [];
            return (
              <div key={stage.key} className="bg-secondary/40 rounded-3xl border border-border/70 p-3.5 space-y-3 min-w-[210px]">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground">{stage.label}</span>
                  <Badge variant={stage.badge} className="text-[9px] px-2 py-0 font-bold">
                    {stageApps.length}
                  </Badge>
                </div>

                <div className="space-y-3 min-h-[360px]">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-primary/40 hover:-translate-y-0.5 transition-all space-y-2 text-xs group"
                    >
                      <div>
                        <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{app.company_name}</h4>
                        <p className="text-[11px] text-muted-foreground truncate">{app.role_title}</p>
                      </div>

                      {app.location && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {app.location}
                        </p>
                      )}

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{formatDate(app.applied_at)}</span>
                        <select
                          value={app.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                          className="bg-secondary rounded-lg px-2 py-1 border border-border text-[10px] focus:outline-none font-sans font-bold"
                        >
                          {PIPELINE_STAGES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/60 text-muted-foreground border-b border-border font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Company & Role</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Recruiter</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 pr-6 text-right">Update Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-foreground">{app.company_name}</div>
                      <div className="text-muted-foreground text-[11px]">{app.role_title}</div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          app.status === "OFFER"
                            ? "success"
                            : app.status === "INTERVIEW"
                            ? "critical"
                            : app.status === "ASSESSMENT"
                            ? "amber"
                            : "indigo"
                        }
                        dot={app.status === "OFFER" || app.status === "INTERVIEW"}
                        className="text-[9px] py-0.5 px-2"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{formatDate(app.applied_at)}</td>
                    <td className="p-4 text-muted-foreground">{app.recruiter_name || "—"}</td>
                    <td className="p-4 text-muted-foreground">{app.location || "—"}</td>
                    <td className="p-4 pr-6 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                        className="bg-secondary text-xs rounded-xl px-3 py-1.5 border border-border focus:outline-none font-semibold"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Add Application Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Application to Pipeline">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Company Name *</label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Analytics"
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Role Title *</label>
              <input
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Junior Data Analyst"
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Remote"
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Recruiter Name</label>
              <input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Recruiter Email</label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="pooja@company.com"
                className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key talking points or application notes..."
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createApplicationMutation.isPending} className="font-bold">
              Save Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

