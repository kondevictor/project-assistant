"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MEETING_TYPES = [
  { value: "google_meet", label: "Google Meet", icon: Video },
  { value: "zoom", label: "Zoom", icon: Video },
  { value: "teams", label: "Microsoft Teams", icon: Video },
  { value: "in_person", label: "In Person", icon: MapPin },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  location: "",
  meetingUrl: "",
  meetingType: "google_meet",
};

export function ScheduleMeetingDialog({
  projectId,
  organizerId,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  organizerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          organizerId,
          title: form.title,
          description: form.description || null,
          startTime: form.startTime,
          endTime: form.endTime,
          location: form.location || null,
          meetingUrl: form.meetingUrl || null,
          meetingType: form.meetingType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to schedule meeting");
        return;
      }

      reset();
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      console.error("Failed to schedule meeting:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-title">Title *</Label>
            <Input
              id="meeting-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Weekly Standup"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-description">Description</Label>
            <Textarea
              id="meeting-description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Meeting agenda..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meeting-start">Start Time *</Label>
              <Input
                id="meeting-start"
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="meeting-end">End Time *</Label>
              <Input
                id="meeting-end"
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-type">Meeting Type</Label>
            <Select value={form.meetingType} onValueChange={(value) => setForm({ ...form, meetingType: value })}>
              <SelectTrigger id="meeting-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-url">Meeting URL</Label>
            <div className="flex gap-2">
              <Input
                id="meeting-url"
                value={form.meetingUrl}
                onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                placeholder="https://meet.google.com/..."
              />
              <Button type="button" variant="outline" onClick={() => setForm({ ...form, meetingUrl: "https://meet.google.com/new", meetingType: "google_meet" })}>
                Generate
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-location">Location</Label>
            <Input
              id="meeting-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Conference Room A or Online"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.title.trim() || !form.startTime || !form.endTime}>
              {saving ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}