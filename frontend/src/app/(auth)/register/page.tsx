"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Lock, Mail, User, ArrowRight } from "lucide-react";
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
    <Card className="border-border shadow-2xl overflow-hidden animate-fade-in">
      <div className="h-1.5 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
      <CardHeader className="text-center p-6 pb-2">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white shadow-lg mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Create Apex OS Account</CardTitle>
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-secondary rounded-xl pl-9 pr-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">University / Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
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
            <span>Register & Start</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="pt-2 text-center text-[11px] text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
