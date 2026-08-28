"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Video,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Trash2,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CalendarEvent } from "@/types";
import { formatTime, formatDate } from "@/lib/utils";

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split("T")[0]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("COURSE");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  // Fetch events
  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events"],
    queryFn: () => apiClient("/calendar"),
  });

  // Create Event Mutation
  const createEventMutation = useMutation({
    mutationFn: (data: any) =>
      apiClient("/calendar", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setIsAddOpen(false);
      setTitle("");
      setDescription("");
      setStartAt("");
      setEndAt("");
      setLocation("");
      setMeetingUrl("");
    },
  });

  // Delete Event Mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/calendar/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt || !endAt) return;
    createEventMutation.mutate({
      title,
      description,
      event_type: eventType,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      location,
      meeting_url: meetingUrl,
    });
  };

  const conflicts = events?.filter((e) => e.has_conflict) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Schedule & Calendar Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified schedule synchronizing university timetable, interviews, and deadlines
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-2 font-bold shadow-md shadow-primary/20">
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Conflict Radar Box */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3 animate-slide-down shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse flex-shrink-0" />
            <h3 className="text-xs font-extrabold text-rose-500 uppercase tracking-wider">
              {conflicts.length} Overlapping Schedule Conflict(s) Detected
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conflicts.map((conf) => (
              <div key={conf.id} className="p-3.5 rounded-2xl bg-card border border-rose-500/30 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge variant="critical" dot className="text-[9px] py-0 px-2">
                    Overlap: {conf.event_type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {formatTime(conf.start_at)} - {formatTime(conf.end_at)}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground truncate">{conf.title}</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{conf.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Agenda Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Master Schedule Feed</CardTitle>
            <CardDescription>All academic classes, recitations, interview calls, and exam slots</CardDescription>
          </div>
          <Badge variant="indigo" dot className="text-[10px] py-0.5 px-2.5">
            Live Feed
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-12">Loading schedule timeline...</p>
          ) : events && events.length > 0 ? (
            events.map((ev) => (
              <div
                key={ev.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  ev.has_conflict
                    ? "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60"
                    : "bg-secondary/40 border-border/70 hover:border-primary/40 hover:bg-secondary/70"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="text-center w-20 bg-card/90 p-2.5 rounded-xl border border-border flex-shrink-0 shadow-inner">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {formatDate(ev.start_at)}
                    </span>
                    <span className="block text-xs font-black text-primary font-mono mt-0.5">
                      {formatTime(ev.start_at)}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">{ev.title}</h3>
                      <Badge
                        variant={
                          ev.event_type === "INTERVIEW"
                            ? "high"
                            : ev.event_type === "EXAM"
                            ? "critical"
                            : ev.event_type === "ASSIGNMENT"
                            ? "amber"
                            : "indigo"
                        }
                        dot={ev.event_type === "INTERVIEW"}
                        className="text-[9px] py-0 px-2"
                      >
                        {ev.event_type}
                      </Badge>
                      {ev.has_conflict && (
                        <Badge variant="critical" dot className="text-[9px] py-0 px-1.5">
                          Time Conflict
                        </Badge>
                      )}
                    </div>
                    {ev.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{ev.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5 flex-wrap">
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {ev.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {formatTime(ev.start_at)} – {formatTime(ev.end_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {ev.meeting_url && (
                    <a
                      href={ev.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 hover:bg-primary-hover shadow-md shadow-primary/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteEventMutation.mutate(ev.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-card/60 backdrop-blur-sm rounded-3xl border border-dashed border-border p-8 space-y-2">
              <CalendarIcon className="w-10 h-10 text-muted-foreground mx-auto opacity-40 mb-2" />
              <h3 className="text-sm font-bold text-foreground">No events on your schedule</h3>
              <p className="text-xs text-muted-foreground">Add classes, study blocks, or interview reminders.</p>
              <Button size="sm" onClick={() => setIsAddOpen(true)} className="mt-4 font-bold">
                Add Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Schedule Event">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Event Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS401 Lecture or Recruiter Screen Call"
              className="w-full bg-secondary rounded-xl px-3.5 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Category</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2.5 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                <option value="COURSE">Course Lecture / Lab</option>
                <option value="INTERVIEW">Job Interview</option>
                <option value="EXAM">Final / Midterm Exam</option>
                <option value="ASSIGNMENT">Assignment Due</option>
                <option value="STUDY">Focus Study Block</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Physical Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Room 304 or Zoom"
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Start Time *</label>
              <input
                required
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">End Time *</label>
              <input
                required
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Meeting Link (Google Meet / Zoom URL)</label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="pt-3 border-t border-border/60 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createEventMutation.isPending}>
              Save Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
