import type { Tutorial } from "@/components/tutorial/tutorial-provider";

export const WELCOME_TUTORIAL: Tutorial = {
  id: "welcome",
  name: "Getting Started",
  description: "A quick tour of the Project Assistant application",
  steps: [
    {
      id: "welcome-1",
      title: "Welcome to Project Assistant! 🎉",
      content:
        "This is your all-in-one project management assistant. We'll walk you through the key features so you can get started right away. Click Next to continue.",
    },
    {
      id: "welcome-2",
      title: "Executive Dashboard",
      content:
        "Your dashboard gives you a bird's-eye view of all projects, upcoming deadlines, stalled tasks, and overall project health — all in one place.",
      targetSelector: 'a[href="/"]',
    },
    {
      id: "welcome-3",
      title: "Create Your First Project",
      content:
        "Click 'New Project' to get started. You'll be able to name your project, set a target date, and even add stakeholders with their roles right away.",
      targetSelector: 'button:has-text("New Project"), [class*="New Project"]',
    },
    {
      id: "welcome-4",
      title: "Manage Stakeholders",
      content:
        "Every stakeholder belongs to a project. You can add people manually, sync contacts from your phonebook, or import a vCard file. Each stakeholder gets a role like Partner, Investor, or Team Member.",
      targetSelector: 'a[href="/stakeholders"]',
    },
    {
      id: "welcome-5",
      title: "Create Tasks & Assign People",
      content:
        "Add tasks with a due date, priority, and — most importantly — assign them to a specific person. Track progress with statuses like Done, Pending, In Progress, or Failed.",
      targetSelector: 'a[href="/tasks"]',
    },
    {
      id: "welcome-6",
      title: "Schedule & Record Meetings",
      content:
        "Schedule meetings attached to a project, generate Google Meet links, and record your meetings with live transcription. You can even upload audio files for automatic transcription.",
      targetSelector: 'a[href="/meetings"]',
    },
    {
      id: "welcome-7",
      title: "Generate Legal Documents",
      content:
        "Instantly generate professional DOCX documents — NCNDA, MOU, Mandate, Partnership agreements, and Contracts — ready to download and edit.",
      targetSelector: 'a[href="/documents"]',
    },
    {
      id: "welcome-8",
      title: "You're All Set! 🚀",
      content:
        "You're ready to start managing your projects like a pro. Use the Help button (bottom-left) anytime to replay any tutorial. Good luck!",
    },
  ],
};
