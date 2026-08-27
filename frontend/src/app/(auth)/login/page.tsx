"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

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
    <Card className="border-border shadow-2xl overflow-hidden animate-fade-in">
      <div className="h-1.5 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
      <CardHeader className="text-center p-6 pb-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Sign In to Apex OS</CardTitle>
        <CardDescription className="text-xs">
          Personal AI Student & Career Assistant
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 pt-4 space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs animate-slide-down">
            {error}
          </div>
        )}

        {/* 1-Click Demo Login Trigger */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary text-xs">One-Click Demonstration</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono font-bold">
              Instant
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Sign in as pre-seeded student <strong>Alex Rivera</strong> with active courses, conflict alerts, and interview invites.
          </p>
          <Button
            type="button"
            onClick={handleDemoLogin}
            loading={demoLoading}
            className="w-full h-8 text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Pre-Seeded Demo</span>
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Or Sign In With Email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">University / Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full h-9 text-xs font-semibold mt-2 gap-1.5">
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create Account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
