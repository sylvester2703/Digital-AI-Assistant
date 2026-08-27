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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Productive Insights</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real metrics derived from your database activity, academic progression, and career pipeline
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Applications</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">
                {trends?.career_funnel
                  ? (Object.values(trends.career_funnel) as number[]).reduce((a, b) => a + b, 0)
                  : 0}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active pipeline tracking</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Coursework Completion</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-500">
                {trends?.academic_workload?.completion_rate_percent || 100}%
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {trends?.academic_workload?.submitted_assignments || 0} of{" "}
                {trends?.academic_workload?.total_assignments || 0} submitted
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Task Completion</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-400">
                {trends?.academic_workload?.active_courses || 4} Enrolled
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active semester courses</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Pipeline Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Application Conversion Funnel</CardTitle>
            <CardDescription>Volume of applications at each hiring pipeline stage</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
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
        <Card>
          <CardHeader>
            <CardTitle>Planner Priority Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by deterministic urgency</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {taskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
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
                      borderRadius: "0.75rem",
                      fontSize: "12px",
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Market Demand Skills in Your Saved & Matched Roles</CardTitle>
            <CardDescription>Frequency of skill requirements found across parsed job listings</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="skill" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="demand" fill="#10b981" radius={[6, 6, 0, 0]} />
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
