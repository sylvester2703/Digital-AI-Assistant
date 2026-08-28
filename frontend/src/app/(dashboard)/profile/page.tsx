"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  FileText,
  Upload,
  ExternalLink,
  Sparkles,
  MapPin,
  Laptop,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Profile, UserSkill } from "@/types";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [skillName, setSkillName] = useState("");
  const [proficiency, setProficiency] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT">("INTERMEDIATE");

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: () => apiClient("/profile"),
  });

  const { data: resumes } = useQuery<any[]>({
    queryKey: ["resumes"],
    queryFn: () => apiClient("/resumes"),
  });

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updated: Partial<Profile>) =>
      apiClient("/profile", {
        method: "PUT",
        body: JSON.stringify(updated),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  // Add Skill Mutation
  const addSkillMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient("/profile/skills", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsAddSkillOpen(false);
      setSkillName("");
    },
  });

  // Delete Skill Mutation
  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) =>
      apiClient(`/profile/skills/${skillId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    addSkillMutation.mutate({
      skill_name: skillName,
      proficiency,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Student & Career Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your verified competencies, target roles, academic credentials, and stored resume versions
          </p>
        </div>
        <Badge variant="emerald" dot className="text-[10px] py-1 px-3 w-fit shadow-sm">
          Profile Verified
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Personal Info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic & Target Preferences */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-extrabold text-foreground">Academic & Career Target Profile</CardTitle>
              </div>
              <CardDescription className="text-xs">Informs our deterministic multi-factor job compatibility model</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Education Institution</label>
                  <input
                    defaultValue={profile?.education || "University of Engineering & Technology"}
                    onBlur={(e) => updateProfileMutation.mutate({ education: e.target.value })}
                    className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Degree & Branch</label>
                  <input
                    defaultValue={profile?.degree ? `${profile.degree} - ${profile.branch}` : "B.Tech - Computer Science"}
                    onBlur={(e) => updateProfileMutation.mutate({ degree: e.target.value })}
                    className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Target Roles</label>
                  <input
                    defaultValue={profile?.target_roles?.join(", ") || "Data Analyst, Business Analyst, AI/ML Intern"}
                    onBlur={(e) =>
                      updateProfileMutation.mutate({
                        target_roles: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Target Locations</label>
                  <input
                    defaultValue={profile?.target_locations?.join(", ") || "Pune, Mumbai, Bangalore, Remote"}
                    onBlur={(e) =>
                      updateProfileMutation.mutate({
                        target_locations: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Work Mode Preference</label>
                  <select
                    defaultValue={profile?.remote_pref || "ANY"}
                    onChange={(e) => updateProfileMutation.mutate({ remote_pref: e.target.value as any })}
                    className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
                  >
                    <option value="ANY">Any (Remote / Hybrid / Onsite)</option>
                    <option value="REMOTE">Remote Only</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ONSITE">Onsite</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground block">Graduation Year</label>
                  <input
                    type="number"
                    defaultValue={profile?.grad_year || 2026}
                    onBlur={(e) => updateProfileMutation.mutate({ grad_year: Number(e.target.value) })}
                    className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Management */}
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-extrabold text-foreground">Skills & Technical Competencies</CardTitle>
                <CardDescription className="text-xs">Used to compute match scores and identify skill gaps</CardDescription>
              </div>
              <Button size="sm" variant="gradient" onClick={() => setIsAddSkillOpen(true)} className="gap-1.5 text-xs font-bold h-9">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </Button>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl bg-secondary/50 border border-border/80 flex items-center justify-between gap-2 text-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-foreground text-xs">{s.skill_name}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="indigo" className="text-[9px] py-0 px-2 font-bold">
                            {s.proficiency}
                          </Badge>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSkillMutation.mutate(s.id)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground col-span-2 py-8 text-center bg-card rounded-2xl border border-dashed border-border">
                    No skills added yet. Add your top technical competencies to improve role matching.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stored Resumes (1 col) */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-extrabold text-foreground">Resume Versions</CardTitle>
              </div>
              <CardDescription className="text-xs">Managed resume copies with keyword extraction</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3.5 text-xs">
              {resumes && resumes.length > 0 ? (
                resumes.map((r) => (
                  <div key={r.id} className="p-4 rounded-2xl bg-secondary/50 border border-border/80 space-y-2.5 hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-foreground">{r.title}</span>
                      {r.is_primary && (
                        <Badge variant="emerald" className="text-[9px] py-0 px-2 font-bold">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{r.target_role || "General Profile"}</p>
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Version {r.version_number}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Parsed & Active
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-muted-foreground bg-card rounded-2xl border border-dashed border-border p-4">
                  No resumes uploaded.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal isOpen={isAddSkillOpen} onClose={() => setIsAddSkillOpen(false)} title="Add Technical Skill">
        <form onSubmit={handleAddSkillSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Skill Name *</label>
            <input
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. SQL, Python, Power BI, FastAPI"
              className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">Proficiency Level</label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value as any)}
              className="w-full bg-secondary/80 rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            >
              <option value="BEGINNER">Beginner (1-2 Projects)</option>
              <option value="INTERMEDIATE">Intermediate (Comfortable writing code/queries)</option>
              <option value="ADVANCED">Advanced (Production / Coursework lead)</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border/60 flex justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" size="sm" loading={addSkillMutation.isPending} className="font-bold">
              Add Skill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

