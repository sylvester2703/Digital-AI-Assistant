"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  ExternalLink,
  Trash2,
  AlertCircle,
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
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("PERSONAL");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events"],
    queryFn: () => apiClient("/calendar"),
  });

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
      setLocation("");
      setMeetingUrl("");
      setStartAt("");
      setEndAt("");
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/calendar/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt || !endAt) return;

    createEventMutation.mutate({
      title,
      description,
      event_type: eventType,
      start_at: new Date(startAt).toISOString(),
      end_at: new Date(endAt).toISOString(),
      location: location || null,
      meeting_url: meetingUrl || null,
    });
  };

  const conflictsList = events?.filter((e) => e.has_conflict) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar & Conflict Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified schedule with deterministic overlap detection and meeting links
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </Button>
        </div>
      </div>

      {/* Conflict Alert Section */}
      {conflictsList.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-slide-down">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Schedule Conflict Warning</span>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {conflictsList.map((c) => (
              <div key={c.id} className="p-2.5 rounded-lg bg-card/60 border border-rose-500/20 text-foreground">
                <span className="font-semibold text-rose-500">{c.title}:</span>{" "}
                {c.conflict_notes || "Overlaps with another scheduled event."}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Agenda</CardTitle>
          <CardDescription>All academic lectures, labs, deadlines, and scheduled recruiter interviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground text-center py-8">Loading calendar schedule...</p>
          ) : events && events.length > 0 ? (
            events.map((ev) => (
              <div
                key={ev.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                  ev.has_conflict ? "bg-rose-500/5 border-rose-500/30" : "bg-card border-border hover:border-primary/40 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="text-center w-24 flex-shrink-0 font-mono text-[11px] bg-secondary/80 p-2 rounded-lg border border-border">
                    <div className="font-bold text-primary">{formatTime(ev.start_at)}</div>
                    <div className="text-[10px] text-muted-foreground">{formatDate(ev.start_at)}</div>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm truncate">{ev.title}</h3>
                      <Badge
                        variant={
                          ev.event_type === "INTERVIEW"
                            ? "critical"
                            : ev.event_type === "CLASS"
                            ? "default"
                            : ev.event_type === "EXAM"
                            ? "high"
                            : "neutral"
                        }
                        className="text-[9px]"
                      >
                        {ev.event_type}
                      </Badge>
                      {ev.has_conflict && (
                        <Badge variant="critical" className="text-[9px]">
                          Conflict
                        </Badge>
                      )}
                    </div>
                    {ev.description && <p className="text-xs text-muted-foreground">{ev.description}</p>}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ev.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
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
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary-hover shadow-sm"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    onClick={() => deleteEventMutation.mutate(ev.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-muted-foreground">
              No calendar events scheduled. Click "Add Event" above to create one.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Calendar Event">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1">Event Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS401 Machine Learning Lecture or Technical Interview"
              className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-foreground block mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-secondary rounded-xl px-3 py-2 text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              >
                <option value="CLASS">Class / Lecture</option>
                <option value="INTERVIEW">Interview</option>
                <option value="MEETING">Meeting</option>
                <option value="EXAM">Exam / Quiz</option>
                <option value="DEADLINE">Deadline</option>
                <option value="PERSONAL">Personal</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Location (Optional)</label>
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
