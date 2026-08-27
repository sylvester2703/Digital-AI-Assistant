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
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { JobApplication, FollowUp } from "@/types";
import { formatDate } from "@/lib/utils";

const PIPELINE_STAGES = [
  { key: "SAVED", label: "Saved", color: "border-slate-500" },
  { key: "APPLIED", label: "Applied", color: "border-blue-500" },
  { key: "ASSESSMENT", label: "Assessment", color: "border-amber-500" },
  { key: "INTERVIEW", label: "Interview", color: "border-purple-500" },
  { key: "OFFER", label: "Offer", color: "border-emerald-500" },
  { key: "REJECTED", label: "Rejected", color: "border-rose-500" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Application Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track submission lifecycle from saved to offer with automated recruiter follow-up recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-secondary rounded-xl border border-border">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "kanban" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground"
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-card text-foreground shadow-sm font-semibold" : "text-muted-foreground"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* Follow-up Recommendations Panel */}
      {followUps && followUps.length > 0 && (
        <Card className="border-indigo-500/30 bg-gradient-to-r from-card via-card to-indigo-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <CardTitle className="text-sm">Follow-up Action Recommended</CardTitle>
              </div>
              <Badge variant="high" className="text-[10px]">
                {followUps.length} Pending
              </Badge>
            </div>
            <CardDescription>
              Applications with no response recorded after 7+ days. Review pre-drafted follow-up emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {followUps.map((fu) => (
              <div
                key={fu.id}
                className="p-3.5 rounded-xl bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{fu.company_name}</span>
                    <span className="text-muted-foreground">({fu.role_title})</span>
                    <Badge variant="neutral" className="text-[9px]">Due {formatDate(fu.due_date)}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground italic bg-secondary/40 p-2 rounded-lg border border-border/40">
                    "{fu.suggested_message}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveFollowUpMutation.mutate({ id: fu.id, action: "SNOOZED" })}
                    className="text-[11px] h-7 px-2.5"
                  >
                    Snooze (7d)
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveFollowUpMutation.mutate({ id: fu.id, action: "COMPLETED" })}
                    className="text-[11px] h-7 px-2.5 gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
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
              <div key={stage.key} className="bg-secondary/40 rounded-2xl border border-border/80 p-3 space-y-3 min-w-[200px]">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{stage.label}</span>
                  <Badge variant="neutral" className="text-[9px] px-1.5 py-0">
                    {stageApps.length}
                  </Badge>
                </div>

                <div className="space-y-2.5 min-h-[350px]">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-card border border-border shadow-sm hover:border-primary/40 transition-all space-y-2 text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-foreground truncate">{app.company_name}</h4>
                        <p className="text-[11px] text-muted-foreground truncate">{app.role_title}</p>
                      </div>

                      {app.location && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {app.location}
                        </p>
                      )}

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-muted-foreground">
                        <span>{formatDate(app.applied_at)}</span>
                        <select
                          value={app.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                          className="bg-secondary rounded px-1.5 py-0.5 border border-border text-[9px] focus:outline-none"
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
              <thead className="bg-secondary/60 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Company & Role</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5">Recruiter</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-foreground">{app.company_name}</div>
                      <div className="text-muted-foreground text-[11px]">{app.role_title}</div>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          app.status === "OFFER"
                            ? "success"
                            : app.status === "INTERVIEW"
                            ? "critical"
                            : app.status === "ASSESSMENT"
                            ? "high"
                            : "neutral"
                        }
                        className="text-[9px]"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-muted-foreground">{formatDate(app.applied_at)}</td>
                    <td className="p-3.5 text-muted-foreground">{app.recruiter_name || "—"}</td>
                    <td className="p-3.5 text-muted-foreground">{app.location || "—"}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                        className="bg-secondary text-xs rounded-lg px-2 py-1 border border-border focus:outline-none"
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
              <label className="font-semibold text-foreground block mb-1">Company Name *</label>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Analytics"
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Role Title *</label>
              <input
                required
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Junior Data Analyst"
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, Remote"
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Recruiter Name</label>
              <input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="font-semibold text-foreground block mb-1">Recruiter Email</label>
              <input
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="pooja@company.com"
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key talking points or application notes..."
              className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createApplicationMutation.isPending}>
              Save Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
