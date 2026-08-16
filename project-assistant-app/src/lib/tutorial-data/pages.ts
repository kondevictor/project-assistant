import type { Tutorial } from "@/components/tutorial/tutorial-provider";

export const DASHBOARD_TUTORIAL: Tutorial = {
  id: "dashboard",
  name: "Dashboard Guide",
  description: "Understand your project health at a glance",
  steps: [
    {
      id: "dash-1",
      title: "Project Health Cards",
      content:
        "Each card shows a project with a color-coded health status. Green = healthy, Yellow = at risk, Red = needs attention. Click a card to dive into that project.",
    },
    {
      id: "dash-2",
      title: "Stats Overview",
      content:
        "At the top you'll see key numbers: total projects, open tasks, overdue tasks, and completed items. This gives you an instant pulse on your work.",
    },
    {
      id: "dash-3",
      title: "Overdue & Stalled Tasks",
      content:
        "Tasks that have passed their due date or have been stuck without progress are flagged here so nothing slips through the cracks.",
    },
    {
      id: "dash-4",
      title: "Create a Project",
      content:
        "Use the 'New Project' button to start a fresh project. You'll choose its stage, set a target date, and can add stakeholders immediately.",
      targetSelector: 'button:has-text("New Project"), button:text("New Project")',
    },
  ],
};

export const PROJECTS_TUTORIAL: Tutorial = {
  id: "projects",
  name: "Projects Guide",
  description: "Create and manage your projects",
  steps: [
    {
      id: "proj-1",
      title: "Your Project List",
      content:
        "This page shows every project you own. Each project card displays its stage, progress, and target completion date.",
    },
    {
      id: "proj-2",
      title: "Create a New Project",
      content:
        "Click 'New Project' to create a project. Fill in the name, description, stage, and target date. You can also add stakeholders with their roles right in the same dialog — they'll automatically belong to this project.",
      targetSelector: 'button:text("New Project")',
    },
    {
      id: "proj-3",
      title: "Project Stages",
      content:
        "Projects move through stages: Inception → Planning → Execution → Review → Completed. Use the stage dropdown on a project to update its progress.",
    },
    {
      id: "proj-4",
      title: "Open a Project",
      content:
        "Click on any project to open its detail page where you'll find phases, tasks, stakeholders, meetings, and document generation.",
    },
  ],
};

export const TASKS_TUTORIAL: Tutorial = {
  id: "tasks",
  name: "Tasks Guide",
  description: "Create, assign, and track tasks",
  steps: [
    {
      id: "task-1",
      title: "The Task List",
      content:
        "Here you see all tasks across every project. Each task shows its title, priority, due date, and the person responsible.",
    },
    {
      id: "task-2",
      title: "Assign People to Tasks",
      content:
        "When creating a task, choose who's responsible from the Assignee dropdown — it lists all stakeholders by name. No more anonymous assignments!",
      targetSelector: 'button:text("Add Task")',
    },
    {
      id: "task-3",
      title: "Track Task Status",
      content:
        "Use the status dropdown on any task to record it as: Not Started, Pending, In Progress, Blocked, Done, Failed, or Cancelled. Each change is tracked with a timestamp.",
    },
    {
      id: "task-4",
      title: "Add Comments",
      content:
        "When creating or editing a task, add comments to give context, update progress, or capture important notes for the assignee.",
    },
  ],
};

export const STAKEHOLDERS_TUTORIAL: Tutorial = {
  id: "stakeholders",
  name: "Stakeholders Guide",
  description: "Manage the people involved in your projects",
  steps: [
    {
      id: "stk-1",
      title: "Stakeholders Belong to Projects",
      content:
        "Every stakeholder is tied to a project. Select a project from the dropdown to see the people associated with it.",
      targetSelector: 'button:has-text("Select project")',
    },
    {
      id: "stk-2",
      title: "Add a Stakeholder",
      content:
        "Click 'Add Stakeholder' to include a new person. You must select which project they belong to — it's a required field. Fill in their name, role, and contact details.",
      targetSelector: 'button:text("Add Stakeholder")',
    },
    {
      id: "stk-3",
      title: "Sync from Phonebook",
      content:
        "Click 'Sync Phonebook' to import contacts straight from your device's address book, or upload a vCard (.vcf) file. Imported contacts become stakeholders of the selected project.",
      targetSelector: 'button:text("Sync Phonebook")',
    },
    {
      id: "stk-4",
      title: "Stakeholder Roles",
      content:
        "Each stakeholder has a role: Stakeholder, Team Member, Partner, Facilitator, Investor, Developer, Manufacturer, or Supplier. Roles appear as color-coded badges.",
    },
  ],
};

export const MEETINGS_TUTORIAL: Tutorial = {
  id: "meetings",
  name: "Meetings Guide",
  description: "Schedule meetings and integrate with Google",
  steps: [
    {
      id: "mtg-1",
      title: "Schedule Meetings",
      content:
        "Click 'New Meeting' to schedule a meeting. Choose a title, date/time, and associate it with a project. Meetings automatically create reminders for stakeholders.",
      targetSelector: 'button:has-text("Meeting"), button:text("Schedule")',
    },
    {
      id: "mtg-2",
      title: "Generate Google Meet Links",
      content:
        "When scheduling, click 'Generate' next to the Meeting URL field to instantly create a Google Meet video link — no manual setup required.",
      targetSelector: 'button:text("Generate")',
    },
    {
      id: "mtg-3",
      title: "Add to Google Calendar",
      content:
        "After connecting your Google account, meetings can be pushed directly to your Google Calendar with all attendees and the Meet link included.",
    },
    {
      id: "mtg-4",
      title: "Meeting Reminders",
      content:
        "Because each meeting belongs to a project, reminders and notifications are sent to keep everyone aligned.",
    },
  ],
};

export const TRANSCRIPTIONS_TUTORIAL: Tutorial = {
  id: "transcriptions",
  name: "Transcription Guide",
  description: "Record meetings and generate AI summaries",
  steps: [
    {
      id: "trs-1",
      title: "Record a Meeting",
      content:
        "Click 'Record Meeting' — your browser will prompt for microphone access. Allow it, and the app will start recording audio with a live timer.",
      targetSelector: 'button:text("Record Meeting")',
    },
    {
      id: "trs-2",
      title: "Live Transcription",
      content:
        "While recording, your speech is transcribed live on screen using your device's speech recognition, so you can see the conversation as it happens.",
    },
    {
      id: "trs-3",
      title: "Upload Audio Files",
      content:
        "Prefer to upload? Click 'Upload Audio' and choose an MP3, WAV, M4A, or WebM file. It'll be ready for transcription in seconds.",
      targetSelector: 'button:text("Upload Audio")',
    },
    {
      id: "trs-4",
      title: "AI Summary & Action Items",
      content:
        "Hit 'Transcribe & Summarize' to generate a full transcript, an AI-written summary, and a list of action items — perfect for sharing after the call.",
    },
  ],
};

export const DOCUMENTS_TUTORIAL: Tutorial = {
  id: "documents",
  name: "Documents Guide",
  description: "Generate professional legal documents",
  steps: [
    {
      id: "doc-1",
      title: "Generate Documents",
      content:
        "Click 'Generate Document' and choose a template: NCNDA, MOU, Mandate, Partnership, or Contract.",
      targetSelector: 'button:has-text("Generate"), button:text("New")',
    },
    {
      id: "doc-2",
      title: "Select a Project",
      content:
        "Documents pull project details (name, description, owner) automatically. Select which project the document relates to.",
    },
    {
      id: "doc-3",
      title: "Download & Edit",
      content:
        "Your document is generated as a Word (.docx) file and downloaded automatically. Open it in Microsoft Word or Google Docs to edit before signing.",
      targetSelector: 'button:text("Download")',
    },
  ],
};
