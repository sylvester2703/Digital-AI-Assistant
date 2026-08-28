"use client";

import React from "react";
import Link from "next/link";
import {
  Settings,
  Link2,
  Shield,
  Bell,
  Palette,
  User,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const sections = [
    {
      title: "Connected Accounts & OAuth",
      description: "Manage authorized Google Workspace, Classroom, Gmail, and Telegram sync tokens",
      href: "/settings/connected-accounts",
      icon: Link2,
      badge: "4 Services",
      badgeVariant: "emerald" as const,
    },
    {
      title: "Student & Career Profile",
      description: "Update academic degree, target locations, work mode preferences, and skills inventory",
      href: "/profile",
      icon: User,
      badge: "Active",
      badgeVariant: "indigo" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">System Preferences & Settings</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure integration pipelines, security attributes, database configurations, and display preferences
          </p>
        </div>
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          System v2.4.0
        </Badge>
      </div>

      {/* Main Settings Navigation */}
      <div className="grid grid-cols-1 gap-4">
        {sections.map((sec) => (
          <Link key={sec.href} href={sec.href}>
            <Card className="hover:border-primary/50 hover:bg-secondary/40 transition-all p-5 shadow-sm group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <sec.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                        {sec.title}
                      </h3>
                      <Badge variant={sec.badgeVariant} className="text-[9px] py-0 px-2 font-bold">
                        {sec.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {sec.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Security & System Info Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <CardTitle className="text-sm font-extrabold text-foreground">Security & Storage</CardTitle>
            </div>
            <CardDescription className="text-xs">Database isolation and token state</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border/70">
              <span className="font-medium text-foreground">API Encryption</span>
              <Badge variant="emerald" className="text-[9px]">AES-256 Enabled</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border/70">
              <span className="font-medium text-foreground">Session Integrity</span>
              <Badge variant="indigo" className="text-[9px]">JWT Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-extrabold text-foreground">AI Copilot Engine</CardTitle>
            </div>
            <CardDescription className="text-xs">Grounded inference parameters</CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border/70">
              <span className="font-medium text-foreground">Default Model</span>
              <span className="font-mono text-[10px] text-primary font-bold">Gemini 2.5 Flash</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50 border border-border/70">
              <span className="font-medium text-foreground">Deterministic Grounding</span>
              <Badge variant="emerald" className="text-[9px]">Strict Verified</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
