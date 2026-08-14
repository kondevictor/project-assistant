"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Video, Users, Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const MEETING_TYPES = [
  { value: "google_meet", label: "Google Meet", icon: Video },
  { value: "zoom", label: "Zoom", icon: Video },
  { value: "teams", label: "Microsoft Teams", icon: Video },
  { value: "in_person", label: "In Person", icon: MapPin },
];

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  meetingUrl: string | null;
  meetingType: string | null;
  status: string;
  projectId: string;
  project?: { name: string };
  organizer?: { name: string | null; email: string };
  attendees?: Array<{
    id: string;
    status: string;
    user?: { name: string | null; email: string } | null;
    stakeholder?: { name: string; email: string | null } | null;
  }>;
  transcription?: { status: string } | null;
}

interface Project {
  id: string;
  name: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingUrl: "",
    meetingType: "google_meet",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchMeetings(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async (projectId: string) => {
    try {
      const response = await fetch(`/api/meetings?projectId=${projectId}`);
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const url = editingMeeting
        ? `/api/meetings/${editingMeeting.id}`
        : "/api/meetings";
      const method = editingMeeting ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectId: selectedProject,
          organizerId: "demo-user-clerk-id",
        }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingMeeting(null);
        resetForm();
        fetchMeetings(selectedProject);
      }
    } catch (error) {
      console.error("Failed to save meeting:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMeetings(selectedProject);
      }
    } catch (error) {
      console.error("Failed to delete meeting:", error);
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || "",
      startTime: meeting.startTime.slice(0, 16),
      endTime: meeting.endTime.slice(0, 16),
      location: meeting.location || "",
      meetingUrl: meeting.meetingUrl || "",
      meetingType: meeting.meetingType || "google_meet",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
      meetingUrl: "",
      meetingType: "google_meet",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const generateGoogleMeetLink = () => {
    setFormData({ ...formData, meetingUrl: `https://meet.google.com/new`, meetingType: "google_meet" });
  };

  const generateZoomLink = () => {
    setFormData({ ...formData, meetingUrl: `https://zoom.us/j/new`, meetingType: "zoom" });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage project meetings</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingMeeting(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingMeeting ? "Edit Meeting" : "Schedule Meeting"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Weekly Standup"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Meeting agenda..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time *</label>
                    <Input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Meeting Type</label>
                  <Select
                    value={formData.meetingType}
                    onValueChange={(value) => setFormData({ ...formData, meetingType: value })}
                  >
                    <SelectTrigger>
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
                <div>
                  <label className="text-sm font-medium">Meeting URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.meetingUrl}
                      onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
                      placeholder="https://meet.google.com/..."
                    />
                    <Button type="button" variant="outline" onClick={generateGoogleMeetLink}>
                      Generate
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Conference Room A or Online"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingMeeting ? "Update" : "Schedule"} Meeting
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-500 mb-4">Schedule your first meeting to get started</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule First Meeting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(meeting.startTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDateTime(meeting.endTime)}
                      </div>
                      {meeting.project && (
                        <span className="text-blue-600">{meeting.project.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {meeting.meetingUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(meeting.meetingUrl!, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(meeting)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(meeting.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {meeting.description && (
                  <p className="text-gray-600 mb-3">{meeting.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {meeting.location && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {meeting.location}
                    </div>
                  )}
                  {meeting.meetingType && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Video className="w-4 h-4" />
                      {MEETING_TYPES.find((t) => t.value === meeting.meetingType)?.label}
                    </div>
                  )}
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? "s" : ""}
                    </div>
                  )}
                  {meeting.transcription && (
                    <Badge variant="outline">
                      {meeting.transcription.status === "completed" ? "Transcribed" : "Transcription pending"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
