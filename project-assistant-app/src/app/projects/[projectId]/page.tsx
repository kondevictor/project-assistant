"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2, Calendar, Users, FileText, Clock, AlertTriangle,
  Plus, Download, ChevronDown, ChevronUp, Bell, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskRow } from "@/components/task/task-row";
import { StageMenu } from "@/components/project/stage-menu";
import { NewTaskSheet } from "@/components/task/new-task-sheet";

interface Project {
  id: string;
  name: string;
  description: string | null;
  stage: string;
  startDate: string | null;
  targetDate: string | null;
  owner: { name: string | null; email: string };
  phases: Array<{
    id: string;
    name: string;
    isMilestone: boolean;
    dueDate: string | null;
    completedAt: string | null;
    tasks: any[];
  }>;
  tasks: any[];
  stakeholders: any[];
  meetings: any[];
  events: any[];
  stakeholderTasks: any[];
  generatedDocuments: any[];
}

interface ProjectEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: string;
  user?: { name: string | null } | null;
}

interface StakeholderTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  reminderSent: boolean;
  stakeholder: { name: string; email: string | null };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Event form state
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "custom",
  });

  // Stakeholder task form state
  const [showStakeholderTaskDialog, setShowStakeholderTaskDialog] = useState(false);
  const [stakeholderTaskForm, setStakeholderTaskForm] = useState({
    stakeholderId: "",
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  // Document generation state
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [generatingDoc, setGeneratingDoc] = useState(false);

  // Report generation state
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!eventForm.title) return;

    try {
      await fetch("/api/project-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          ...eventForm,
        }),
      });
      setShowEventDialog(false);
      setEventForm({ title: "", description: "", type: "custom" });
      fetchProject();
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  };

  const handleAddStakeholderTask = async () => {
    if (!stakeholderTaskForm.stakeholderId || !stakeholderTaskForm.title) return;

    try {
      await fetch("/api/stakeholder-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          ...stakeholderTaskForm,
        }),
      });
      setShowStakeholderTaskDialog(false);
      setStakeholderTaskForm({
        stakeholderId: "",
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      fetchProject();
    } catch (error) {
      console.error("Failed to add stakeholder task:", error);
    }
  };

  const handleGenerateDocument = async () => {
    if (!selectedDocType) return;
    setGeneratingDoc(true);

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          templateType: selectedDocType,
        }),
      });
      const data = await response.json();

      // Download the file
      if (data.base64) {
        const byteCharacters = atob(data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }

      setShowDocumentDialog(false);
      setSelectedDocType("");
      fetchProject();
    } catch (error) {
      console.error("Failed to generate document:", error);
    } finally {
      setGeneratingDoc(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch("/api/projects/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await response.json();

      // Download the report
      if (data.base64) {
        const byteCharacters = atob(data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      await fetch("/api/stakeholder-tasks/send-reminders", {
        method: "POST",
      });
      alert("Reminders sent for tasks due within 24 hours!");
    } catch (error) {
      console.error("Failed to send reminders:", error);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "status_change": return <BarChart3 className="w-4 h-4" />;
      case "milestone_reached": return <CheckCircle2 className="w-4 h-4" />;
      case "stakeholder_added": return <Users className="w-4 h-4" />;
      case "meeting_scheduled": return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

  if (!project) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-600">Project not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>Owner: {project.owner?.name || project.owner?.email}</span>
            {project.targetDate && (
              <span>Target: {formatDate(project.targetDate)}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <StageMenu projectId={project.id} stage={project.stage as any} />
          <Button variant="outline" onClick={handleSendReminders}>
            <Bell className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button variant="outline" onClick={handleGenerateReport} disabled={generatingReport}>
            <FileText className="w-4 h-4 mr-2" />
            {generatingReport ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders ({project.stakeholders?.length || 0})</TabsTrigger>
          <TabsTrigger value="meetings">Meetings ({project.meetings?.length || 0})</TabsTrigger>
          <TabsTrigger value="events">Events ({project.events?.length || 0})</TabsTrigger>
          <TabsTrigger value="tasks">Stakeholder Tasks ({project.stakeholderTasks?.length || 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({project.generatedDocuments?.length || 0})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Phases */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Phases</CardTitle>
              </div>
            </CardHeader>
<CardContent>
                {project.phases?.length === 0 ? (
                  <p className="text-gray-500">No phases yet</p>
                ) : (
                  <div className="space-y-4">
                    {project.phases?.map((phase) => (
                      <div key={phase.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{phase.name}</h3>
                          {phase.isMilestone && (
                            <Badge variant="outline">Milestone</Badge>
                          )}
                          {phase.completedAt && (
                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {phase.tasks.length > 0 && (
                            <div className="space-y-2 mt-3">
                              {phase.tasks.map((task: any) => (
                                <TaskRow key={task.id} task={task} />
                              ))}
                            </div>
                          )}
                          <NewTaskSheet
                            projectId={project.id}
                            phases={project.phases?.map(p => ({ id: p.id, name: p.name })) || []}
                            defaultPhaseId={phase.id}
                            triggerLabel="Add Task"
                            stakeholders={project.stakeholders?.map((s: any) => ({ id: s.id, name: s.name })) || []}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
          </Card>

          {/* Unphased Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.tasks?.map((task: any) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
              <NewTaskSheet
                projectId={project.id}
                phases={project.phases?.map(p => ({ id: p.id, name: p.name })) || []}
                triggerLabel="Add Task"
                stakeholders={project.stakeholders?.map((s: any) => ({ id: s.id, name: s.name })) || []}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stakeholders Tab */}
      {activeTab === "stakeholders" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Stakeholders</h2>
            <Button onClick={() => window.open("/stakeholders", "_blank")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stakeholder
            </Button>
          </div>

          {project.stakeholders?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stakeholders yet</h3>
                <p className="text-gray-500 mb-4">Add stakeholders to manage project contacts</p>
                <Button onClick={() => window.open("/stakeholders", "_blank")}>
                  Add Stakeholders
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {project.stakeholders?.map((stakeholder: any) => (
                <Card key={stakeholder.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                    <Badge variant="outline">{stakeholder.role}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      {stakeholder.email && (
                        <p className="text-gray-600">{stakeholder.email}</p>
                      )}
                      {stakeholder.company && (
                        <p className="text-gray-500">{stakeholder.company}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === "meetings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Meetings</h2>
            <Button onClick={() => window.open("/meetings", "_blank")}>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>

          {project.meetings?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
                <p className="text-gray-500 mb-4">Schedule meetings for this project</p>
                <Button onClick={() => window.open("/meetings", "_blank")}>
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.meetings?.map((meeting: any) => (
                <Card key={meeting.id}>
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(meeting.startTime)} • {meeting.meetingType || "Meeting"}
                        </p>
                        {meeting.transcription && (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            Transcribed
                          </Badge>
                        )}
                      </div>
                      {meeting.meetingUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(meeting.meetingUrl, "_blank")}>
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Project Events</h2>
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Project Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Event</SelectItem>
                        <SelectItem value="status_change">Status Change</SelectItem>
                        <SelectItem value="milestone_reached">Milestone Reached</SelectItem>
                        <SelectItem value="stakeholder_added">Stakeholder Added</SelectItem>
                        <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="Event title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={eventForm.description}
                      onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                      placeholder="Event details"
                    />
                  </div>
                  <Button onClick={handleAddEvent}>Add Event</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {project.events?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-500 mb-4">Track project updates and milestones</p>
                <Button onClick={() => setShowEventDialog(true)}>
                  Add First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.events?.map((event: ProjectEvent) => (
                <Card key={event.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span>{formatDate(event.createdAt)}</span>
                          {event.user && <span>• {event.user.name}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stakeholder Tasks Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Stakeholder Tasks</h2>
            <Dialog open={showStakeholderTaskDialog} onOpenChange={setShowStakeholderTaskDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Stakeholder Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Stakeholder</label>
                    <Select
                      value={stakeholderTaskForm.stakeholderId}
                      onValueChange={(v) => setStakeholderTaskForm({ ...stakeholderTaskForm, stakeholderId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select stakeholder" />
                      </SelectTrigger>
                      <SelectContent>
                        {project.stakeholders?.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={stakeholderTaskForm.title}
                      onChange={(e) => setStakeholderTaskForm({ ...stakeholderTaskForm, title: e.target.value })}
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={stakeholderTaskForm.description}
                      onChange={(e) => setStakeholderTaskForm({ ...stakeholderTaskForm, description: e.target.value })}
                      placeholder="Task details"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={stakeholderTaskForm.priority}
                        onValueChange={(v) => setStakeholderTaskForm({ ...stakeholderTaskForm, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={stakeholderTaskForm.dueDate}
                        onChange={(e) => setStakeholderTaskForm({ ...stakeholderTaskForm, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddStakeholderTask}>Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {project.stakeholderTasks?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No stakeholder tasks</h3>
                <p className="text-gray-500 mb-4">Assign tasks to stakeholders with deadlines</p>
                <Button onClick={() => setShowStakeholderTaskDialog(true)}>
                  Add First Task
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.stakeholderTasks?.map((task: StakeholderTask) => (
                <Card key={task.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Assigned to: {task.stakeholder.name}</span>
                          {task.dueDate && (
                            <span className={new Date(task.dueDate) < new Date() ? "text-red-600" : ""}>
                              Due: {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.reminderSent && (
                            <Badge variant="outline" className="text-xs">
                              <Bell className="w-3 h-3 mr-1" /> Reminder sent
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Generated Documents</h2>
            <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Document Type</label>
                    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ncnda">NCNDA (Non-Compete Non-Disclosure)</SelectItem>
                        <SelectItem value="mou">MOU (Memorandum of Understanding)</SelectItem>
                        <SelectItem value="mandate">Mandate Agreement</SelectItem>
                        <SelectItem value="partnership">Partnership Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleGenerateDocument} disabled={!selectedDocType || generatingDoc}>
                    {generatingDoc ? "Generating..." : "Generate Document"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {project.generatedDocuments?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-500 mb-4">Generate legal documents for this project</p>
                <Button onClick={() => setShowDocumentDialog(true)}>
                  Generate First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.generatedDocuments?.map((doc: any) => (
                <Card key={doc.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">{doc.fileName}</h3>
                          <p className="text-sm text-gray-500">
                            {doc.template?.name} • {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge className={doc.status === "generated" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {doc.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
