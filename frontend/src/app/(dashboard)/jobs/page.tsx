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
  ArrowRight,
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Career Opportunities Radar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic multi-factor matching, skill gap discovery, and legitimate university sourcing
          </p>
        </div>
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          92% High Match Active
        </Badge>
      </div>

      {/* Role Keyword Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-2 overflow-x-auto select-none">
        {roleKeywords.map((r) => (
          <button
            key={r.value}
            onClick={() => setSelectedRole(r.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedRole === r.value
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
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
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search role title, company, skills (e.g. SQL, Python, Power BI, Tableau)..."
            className="w-full bg-card border border-border/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm text-foreground"
          />
        </div>

        <select
          value={selectedWorkMode}
          onChange={(e) => setSelectedWorkMode(e.target.value)}
          className="bg-card border border-border/80 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground shadow-sm font-semibold"
        >
          <option value="ALL">All Work Modes</option>
          <option value="REMOTE">Remote Only</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">Onsite</option>
        </select>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center col-span-2 py-16">Computing multi-factor matches...</p>
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => {
            const score = job.match_score || 0;
            return (
              <Card
                key={job.id}
                className="hover:border-primary/50 hover:-translate-y-1 transition-all flex flex-col justify-between group shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="text-[9px] uppercase font-mono font-extrabold text-muted-foreground tracking-wider bg-secondary/80 px-2 py-0.5 rounded border border-border/60 inline-block">
                        {job.source_name}
                      </span>
                      <CardTitle className="text-sm sm:text-base font-extrabold group-hover:text-primary transition-colors truncate">
                        {job.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
                        <span className="text-foreground font-bold">{job.company_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {job.location} ({job.work_mode})
                        </span>
                      </p>
                    </div>

                    {/* Deterministic Match Score Pill */}
                    <div className="text-center p-2.5 rounded-2xl bg-gradient-to-tr from-primary/15 via-indigo-500/10 to-emerald-500/10 border border-primary/30 flex-shrink-0 shadow-sm">
                      <div className="text-base font-black text-primary font-mono">{score}%</div>
                      <div className="text-[8px] uppercase tracking-wider font-extrabold text-primary">Compatibility</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3.5">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{job.description}</p>

                  {/* Skills Alignment Chips */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-muted-foreground font-bold flex items-center justify-between">
                      <span>Skills Compatibility</span>
                      <span className="text-emerald-400 font-extrabold">{job.matched_skills.length} matched</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {job.matched_skills.map((sk) => (
                        <span key={sk} className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          ✓ {sk}
                        </span>
                      ))}
                      {job.missing_skills.slice(0, 2).map((sk) => (
                        <span key={sk} className="text-[9px] px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/80">
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Salary & Freshness */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="font-bold text-foreground">
                      {job.min_salary ? formatCurrency(job.min_salary, job.salary_currency) : "Competitive Pay"}
                    </span>
                    <span>Posted {formatDate(job.posted_at)}</span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedJob(job)}
                      className="text-xs flex-1 font-bold h-9"
                    >
                      View Breakdown
                    </Button>
                    {job.is_applied ? (
                      <Badge variant="success" dot className="text-xs px-3.5 py-1.5 h-9 justify-center flex-1 font-bold">
                        Applied in Pipeline ✓
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => applyMutation.mutate(job)}
                        loading={applyMutation.isPending}
                        className="text-xs flex-1 gap-1.5 font-bold h-9 shadow-md shadow-primary/20"
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
          <div className="text-center py-16 col-span-2 text-xs text-muted-foreground bg-card/60 backdrop-blur-sm rounded-3xl border border-dashed border-border p-8 space-y-2">
            <Briefcase className="w-10 h-10 mx-auto opacity-40 text-muted-foreground mb-2" />
            <h3 className="text-sm font-bold text-foreground">No jobs matching your query</h3>
            <p className="text-xs text-muted-foreground">Try clearing search filters or selecting All Roles.</p>
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-indigo-500/10 to-emerald-500/10 border border-primary/30 flex items-center justify-between">
              <div>
                <span className="text-base font-extrabold text-primary">{selectedJob.match_score}% Compatibility Score</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">Calculated using deterministic multi-factor profile weighting</p>
              </div>
              <Badge variant="success" dot className="text-xs px-3 py-1 font-bold">
                Strong Fit
              </Badge>
            </div>

            {/* Rationale */}
            {selectedJob.match_rationale && (
              <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border/80 space-y-1">
                <span className="font-bold text-foreground block">Match Analysis</span>
                <p className="text-muted-foreground leading-relaxed">{selectedJob.match_rationale}</p>
              </div>
            )}

            {/* Skills Comparison */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-400 block">Matched Skills ({selectedJob.matched_skills.length})</span>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.matched_skills.map((s) => (
                    <Badge key={s} variant="success" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="font-bold text-amber-400 block">Missing Skills ({selectedJob.missing_skills.length})</span>
                <div className="flex flex-wrap gap-1">
                  {selectedJob.missing_skills.map((s) => (
                    <Badge key={s} variant="amber" className="text-[10px]">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <span className="font-bold text-foreground block">Job Description</span>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto p-3.5 bg-secondary/40 rounded-2xl border border-border text-xs">
                {selectedJob.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => saveJobMutation.mutate(selectedJob)} className="font-bold">
                <Bookmark className="w-3.5 h-3.5 mr-1" />
                <span>Save Lead</span>
              </Button>
              <Button size="sm" variant="gradient" onClick={() => applyMutation.mutate(selectedJob)} className="font-bold">
                <span>Add to Application Pipeline</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

