"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Lock, Mail, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return;
    setLoading(true);
    setError(null);
    try {
      await register(email, password, fullName);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-2xl overflow-hidden animate-fade-in bg-card/90 backdrop-blur-2xl">
      <div className="h-1 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
      <CardHeader className="text-center p-6 pb-2">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-primary/30 mb-3 hover:scale-105 transition-transform">
          <Sparkles className="w-7 h-7" />
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
          Create Apex OS Account
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="font-bold text-foreground block mb-1 text-[11px]">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-secondary/80 rounded-xl pl-10 pr-3 py-2.5 text-xs border border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1 text-[11px]">University / Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
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
            <span>Register & Initialize Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

