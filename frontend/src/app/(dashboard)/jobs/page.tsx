"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  Filter,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Job } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("ALL");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["jobs", search, selectedRole, selectedWorkMode],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append("query", search);
      if (selectedRole !== "ALL") params.append("role", selectedRole);
      if (selectedWorkMode !== "ALL") params.append("work_mode", selectedWorkMode);
      return apiClient(`/jobs?${params.toString()}`);
    },
  });

  const applyMutation = useMutation({
    mutationFn: (job: Job) =>
      apiClient("/applications", {
        method: "POST",
        body: JSON.stringify({
          job_id: job.id,
          company_name: job.company_name,
          role_title: job.title,
          status: "APPLIED",
          location: job.location,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setSelectedJob(null);
    },
  });

  const saveJobMutation = useMutation({
    mutationFn: (job: Job) =>
      apiClient("/applications", {
        method: "POST",
        body: JSON.stringify({
          job_id: job.id,
          company_name: job.company_name,
          role_title: job.title,
          status: "SAVED",
          location: job.location,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const roleKeywords = [
    { label: "All Roles", value: "ALL" },
    { label: "Data Analyst", value: "Data Analyst" },
    { label: "Business Analyst", value: "Business Analyst" },
    { label: "AI / ML Intern", value: "Data Science" },
    { label: "Python Developer", value: "Python" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Career Opportunities Hub</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Deterministic multi-factor matching, skill gap discovery, and legitimate authorized sourcing
        </p>
      </div>

      {/* Role Keyword Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 overflow-x-auto">
        {roleKeywords.map((r) => (
          <button
            key={r.value}
            onClick={() => setSelectedRole(r.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              selectedRole === r.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role title, company, skills (e.g. SQL, Python, Power BI)..."
            className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          />
        </div>

        <select
          value={selectedWorkMode}
          onChange={(e) => setSelectedWorkMode(e.target.value)}
          className="bg-card border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground shadow-sm"
        >
          <option value="ALL">All Work Modes</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">Onsite</option>
        </select>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center col-span-2 py-12">Computing multi-factor matches...</p>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => {
            const score = job.match_score || 0;
            return (
              <Card
                key={job.id}
                className="hover:border-primary/40 transition-all flex flex-col justify-between group shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider font-mono">
                        {job.source_name}
                      </span>
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <span className="text-foreground">{job.company_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {job.location} ({job.work_mode})
                        </span>
                      </p>
                    </div>

                    {/* Deterministic Match Score Badge */}
                    <div className="text-center p-2 rounded-xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 border border-primary/30 flex-shrink-0">
                      <div className="text-sm font-black text-primary font-mono">{score}%</div>
                      <div className="text-[8px] uppercase tracking-wider font-bold text-primary">Match</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>

                  {/* Skills Alignment */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
                      <span>Skills Match</span>
                      <span className="text-emerald-500 font-bold">{job.matched_skills.length} matched</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills.map((sk) => (
                        <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                      {job.missing_skills.slice(0, 2).map((sk) => (
                        <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Salary & Freshness */}
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {job.min_salary ? formatCurrency(job.min_salary, job.salary_currency) : "Competitive"}
                    </span>
                    <span>Posted {formatDate(job.posted_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                      className="text-xs flex-1"
                    >
                      View Breakdown
                    </Button>
                    {job.is_applied ? (
                      <Badge variant="success" className="text-xs px-3 py-1.5 h-8">
                        Applied ✓
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => applyMutation.mutate(job)}
                        loading={applyMutation.isPending}
                        className="text-xs flex-1 gap-1"
                      >
                        <span>Apply & Track</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16 col-span-2 text-xs text-muted-foreground bg-card rounded-2xl border border-dashed border-border p-6">
            No job matches found matching your filters.
          </div>
        )}
      </div>

      {/* Match Details Modal */}
      {selectedJob && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedJob(null)}
          title={`${selectedJob.title} — Match Breakdown`}
          description={`${selectedJob.company_name} • ${selectedJob.location} (${selectedJob.work_mode})`}
        >
          <div className="space-y-4 text-xs">
            {/* Match Score Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/30 flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-primary">{selectedJob.match_score}% Compatibility Score</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Calculated using deterministic multi-factor weighting</p>
              </div>
              <Badge variant="high" className="text-xs px-2.5 py-1">
                Strong Fit
              </Badge>
            </div>

            {/* Rationale */}
            {selectedJob.match_rationale && (
              <div className="p-3 rounded-xl bg-secondary/50 border border-border space-y-1">
                <span className="font-bold text-foreground block">Match Rationale</span>
                <p className="text-muted-foreground leading-relaxed">{selectedJob.match_rationale}</p>
              </div>
            )}

            {/* Skills Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-500 block">Matched Skills ({selectedJob.matched_skills.length})</span>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.matched_skills.map((s) => (
                    <Badge key={s} variant="success" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-500 block">Missing Skills ({selectedJob.missing_skills.length})</span>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.missing_skills.map((s) => (
                    <Badge key={s} variant="high" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <span className="font-bold text-foreground block">Full Job Description</span>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto p-3 bg-secondary/30 rounded-xl border border-border">
                {selectedJob.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => saveJobMutation.mutate(selectedJob)}>
                <Bookmark className="w-3.5 h-3.5 mr-1" />
                <span>Save for Later</span>
              </Button>
              <Button size="sm" onClick={() => applyMutation.mutate(selectedJob)}>
                <span>Track Application in Pipeline</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
