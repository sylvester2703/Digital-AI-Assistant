"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, Zap, Calendar, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const { login, loginDemoUser } = useAuth();
  const [email, setEmail] = useState("alex.rivera@university.edu");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try the 1-click demo button below.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      await loginDemoUser();
    } catch (err: any) {
      setError(err.message || "Failed to initialize demo session.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Feature Badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 shadow-sm backdrop-blur-md">
          <Zap className="w-3 h-3 text-indigo-400 mr-1 inline" /> AI Student OS
        </Badge>
        <Badge variant="critical" dot className="text-[10px] py-1 px-3 shadow-sm backdrop-blur-md">
          <Calendar className="w-3 h-3 text-rose-500 mr-1 inline" /> Conflict Radar
        </Badge>
        <Badge variant="success" dot className="text-[10px] py-1 px-3 shadow-sm backdrop-blur-md">
          <Briefcase className="w-3 h-3 text-emerald-400 mr-1 inline" /> 92% Match Engine
        </Badge>
      </div>

      <Card className="border-border/80 shadow-2xl overflow-hidden animate-fade-in bg-card/90 backdrop-blur-2xl">
        <div className="h-1 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
        <CardHeader className="text-center p-6 pb-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-3 hover:scale-105 transition-transform">
            <Sparkles className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
            Sign In to Apex OS
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-medium">
            Personal AI Student & Career Operating System
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-4 space-y-4 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold animate-slide-down flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Instant Demo Card */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/15 via-indigo-500/10 to-emerald-500/10 border border-primary/30 space-y-2.5 overflow-hidden group shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="font-extrabold text-primary text-xs tracking-wide">Interactive Demo Access</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono font-bold border border-primary/30">
                1-Click
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Explore pre-loaded profile for student <strong>Alex Rivera</strong> with active courses, scheduled interviews, live conflict alerts, and AI chat.
            </p>
            <Button
              type="button"
              variant="gradient"
              onClick={handleDemoLogin}
              loading={demoLoading}
              className="w-full h-9 text-xs font-bold gap-2 shadow-md hover:shadow-primary/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Pre-Seeded Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
            <span className="relative bg-card px-3 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Or Sign In With Email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="font-bold text-foreground block mb-1 text-[11px]">University / Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full bg-secondary/80 rounded-xl pl-10 pr-3 py-2.5 text-xs border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1 text-[11px]">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-secondary/80 rounded-xl pl-10 pr-3 py-2.5 text-xs border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full h-10 text-xs font-bold mt-2 gap-2">
              <span>Sign In to Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="pt-2 text-center text-[11px] text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

