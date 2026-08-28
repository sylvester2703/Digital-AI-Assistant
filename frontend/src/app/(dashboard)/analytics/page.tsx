"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  PieChart as PieIcon,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

export default function AnalyticsPage() {
  const { data: trends, isLoading } = useQuery<any>({
    queryKey: ["analytics-trends"],
    queryFn: () => apiClient("/analytics/trends"),
  });

  const funnelData = trends?.career_funnel
    ? Object.entries(trends.career_funnel).map(([key, value]) => ({
        stage: key,
        count: value,
      }))
    : [];

  const taskData = trends?.task_priority_distribution
    ? Object.entries(trends.task_priority_distribution).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const skillData = trends?.skills_in_demand
    ? Object.entries(trends.skills_in_demand).map(([key, value]) => ({
        skill: key,
        demand: value,
      }))
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Analytics & Performance Insights</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real metrics derived from your database activity, academic progression, and career pipeline
          </p>
        </div>
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          Live Database Telemetry
        </Badge>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="hover:border-primary/40 hover:-translate-y-1 transition-all group shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Total Applications</p>
              <h3 className="text-2xl font-extrabold text-primary font-mono tracking-tight">
                {trends?.career_funnel
                  ? (Object.values(trends.career_funnel) as number[]).reduce((a, b) => a + b, 0)
                  : 0}
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> Active career pipeline
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/40 hover:-translate-y-1 transition-all group shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Coursework Completion</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
                {trends?.academic_workload?.completion_rate_percent || 100}%
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">
                {trends?.academic_workload?.submitted_assignments || 0} of{" "}
                {trends?.academic_workload?.total_assignments || 0} assignments submitted
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-indigo-500/40 hover:-translate-y-1 transition-all group shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Active Enrolled Courses</p>
              <h3 className="text-2xl font-extrabold text-indigo-400 font-mono tracking-tight">
                {trends?.academic_workload?.active_courses || 4} Subjects
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">Spring 2026 Semester</p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Pipeline Funnel Chart */}
        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-extrabold text-foreground">Application Conversion Funnel</CardTitle>
            </div>
            <CardDescription className="text-xs">Volume of applications at each hiring stage</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 h-72">
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} stroke="hsl(var(--foreground))" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No pipeline data yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-sm font-extrabold text-foreground">Planner Priority Distribution</CardTitle>
            </div>
            <CardDescription className="text-xs">Breakdown of tasks by deterministic urgency</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 h-72">
            {taskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {taskData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No task distribution data.
              </div>
            )}
          </CardContent>
        </Card>

        {/* In-Demand Skills Frequency */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-sm font-extrabold text-foreground">Market Demand Skills in Your Saved & Matched Roles</CardTitle>
            </div>
            <CardDescription className="text-xs">Frequency of skill requirements found across parsed job listings</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 h-72">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} stroke="hsl(var(--foreground))" />
                  <XAxis dataKey="skill" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="demand" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No skill frequency metrics yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

