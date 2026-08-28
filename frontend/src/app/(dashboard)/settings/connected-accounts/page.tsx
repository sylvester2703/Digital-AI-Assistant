"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Mail,
  Calendar,
  GraduationCap,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  PowerOff,
  Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConnectedAccount } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ConnectedAccountsPage() {
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<ConnectedAccount | null>(null);

  const { data: accounts, isLoading } = useQuery<ConnectedAccount[]>({
    queryKey: ["connected-accounts"],
    queryFn: () => apiClient("/integrations/accounts"),
  });

  const toggleConnectionMutation = useMutation({
    mutationFn: ({ provider, is_connected }: { provider: string; is_connected: boolean }) =>
      apiClient(`/integrations/accounts/${provider}`, {
        method: "PATCH",
        body: JSON.stringify({ is_connected }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connected-accounts"] });
      setSelectedAccount(null);
    },
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "GMAIL":
        return <Mail className="w-5 h-5 text-rose-500" />;
      case "GOOGLE_CALENDAR":
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case "GOOGLE_CLASSROOM":
        return <GraduationCap className="w-5 h-5 text-emerald-500" />;
      case "TELEGRAM":
        return <Send className="w-5 h-5 text-sky-400" />;
      default:
        return <Settings className="w-5 h-5 text-primary" />;
    }
  };

  const getProviderDescription = (provider: string) => {
    switch (provider) {
      case "GMAIL":
        return "Extracts interview invites, recruiter follow-ups, and coursework deadlines with verified confidence ratings.";
      case "GOOGLE_CALENDAR":
        return "Two-way agenda synchronization, interview scheduling, and deterministic conflict detection.";
      case "GOOGLE_CLASSROOM":
        return "Syncs enrolled courses, assignment deadlines, and instructor announcements directly to your planner.";
      case "TELEGRAM":
        return "Sends urgent daily morning briefings, interview countdown reminders, and immediate schedule conflict alerts.";
      default:
        return "Enterprise external integration.";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Connected Accounts & Integrations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage authorized external service connections with transparent permissions and explicit disconnection controls
          </p>
        </div>
        <Badge variant="indigo" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          OAuth 2.0 Security Layer
        </Badge>
      </div>

      {/* Integration Safety Notice */}
      <div className="p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/80 flex items-start gap-3.5 text-xs shadow-sm">
        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <span className="font-bold text-foreground text-xs">OAuth 2.0 & Token Encrypted Safety</span>
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Your integration tokens are securely encrypted. In development and demo mode, the system operates seamlessly with seed-grounded mock pipelines without failing.
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center col-span-2 py-16">Loading connection statuses...</p>
        ) : accounts && accounts.length > 0 ? (
          accounts.map((acc) => (
            <Card key={acc.id} className="hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center flex-shrink-0 shadow-inner">
                      {getProviderIcon(acc.provider)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-extrabold text-foreground">{acc.provider.replace("_", " ")}</CardTitle>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {acc.account_email || "Authorized Service"}
                      </p>
                    </div>
                  </div>

                  <Badge variant={acc.is_connected ? "emerald" : "neutral"} dot={acc.is_connected} className="text-[9px] py-0.5 px-2">
                    {acc.is_connected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  {getProviderDescription(acc.provider)}
                </p>

                {acc.scopes && (
                  <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/50 text-[10px] text-muted-foreground font-mono truncate">
                    Scopes: {acc.scopes}
                  </div>
                )}

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {acc.last_synced_at ? `Last sync: ${formatDate(acc.last_synced_at)}` : "Not synced"}
                  </span>
                  <Button
                    size="sm"
                    variant={acc.is_connected ? "outline" : "gradient"}
                    onClick={() =>
                      toggleConnectionMutation.mutate({
                        provider: acc.provider,
                        is_connected: !acc.is_connected,
                      })
                    }
                    loading={toggleConnectionMutation.isPending}
                    className="text-xs h-8 px-3 font-bold"
                  >
                    {acc.is_connected ? "Disconnect" : "Connect Account"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 col-span-2 text-xs text-muted-foreground bg-card rounded-2xl border border-dashed border-border p-6">
            No external accounts discovered.
          </div>
        )}
      </div>
    </div>
  );
}

