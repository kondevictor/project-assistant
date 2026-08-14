# Project Assistant - Features Documentation

## Overview
Project Assistant is a comprehensive project management application built with Next.js 16, Prisma ORM, PostgreSQL, and Clerk authentication.

## Core Features

### 1. Project Management
- **Projects** - Create, view, update projects with stages (Inception, Planning, Execution, Review, Completed, On Hold)
- **Phases/Milestones** - Organize projects into phases with due dates and milestone tracking
- **Tasks** - Full task management with statuses, priorities, due dates, assignees
- **Task Dependencies** - Block/unblock tasks with explicit dependency chains
- **Notes** - Add notes to projects and tasks

### 2. Enhanced Project Details
- **Stakeholder Management** - View and manage project stakeholders with roles
- **Meeting Management** - Create and track meetings for the project
- **Project Events** - Log status changes, milestones, custom events
- **Stakeholder Tasks** - Assign tasks to stakeholders with deadlines
- **Deadline Reminders** - Automatic reminders for tasks due within 24 hours
- **Project Reports** - Generate comprehensive project status reports (DOCX)
- **Document Generation** - Generate legal documents (NCNDA, MOU, Mandate, Partnership)

### 3. Stakeholder Management
- **Stakeholder Profiles** - Name, email, phone, company, role
- **Role Types** - Stakeholder, Team Member, Partner, Facilitator, Investor, Developer, Manufacturer, Supplier
- **Contact Details** - Email, phone, company information stored for easy access
- **Project Association** - Stakeholders linked to specific projects
- **CRUD Operations** - Create, read, update, delete stakeholders

### 4. Meeting Management
- **Meeting Scheduling** - Title, description, start/end times, location
- **Video Conference Integration** - Google Meet, Zoom, Teams, In-person support
- **Meeting URLs** - Store and display meeting links with one-click join
- **Status Tracking** - Scheduled, In Progress, Completed, Cancelled
- **Attendee Management** - Add users and stakeholders as attendees

### 5. Meeting Transcription
- **Audio Recording** - Record meetings directly in the browser
- **Transcription Processing** - Convert audio to text with speaker identification
- **AI Summary Generation** - Automatic meeting summaries
- **Action Item Extraction** - Identify and list action items from meetings
- **Download Recording** - Export audio files for offline use

### 6. Notifications System
- **Multi-channel** - Email, In-app, Push notification types
- **Rich Content** - Title, message, structured data payload
- **Read Status** - Track read/unread notifications
- **Notification Preferences** - Enable/disable email and push notifications

### 7. Document Generation
Generate downloadable DOCX documents for:
- **NCNDA** - Non-Compete Non-Disclosure Agreement
- **MOU** - Memorandum of Understanding
- **Mandate** - Mandate Agreement
- **Partnership** - Partnership Agreement

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Executive Dashboard with project health scores |
| `/projects` | Project list and management |
| `/projects/[id]` | Enhanced project detail with tabs |
| `/tasks` | Global tasks view with filters |
| `/stakeholders` | Stakeholder management |
| `/meetings` | Meeting scheduling and calendar |
| `/transcriptions` | Audio recording and transcription tool |
| `/notifications` | Notification center with preferences |
| `/documents` | Document generation center |
| `/sign-in` | Clerk sign-in page |
| `/sign-up` | Clerk sign-up page |
| `/onboarding` | Role selection after first sign-in |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/projects` | GET | List all projects |
| `/api/projects/[id]` | GET | Get project with all relations |
| `/api/projects/generate-report` | POST | Generate project report DOCX |
| `/api/stakeholders` | GET, POST | List/create stakeholders |
| `/api/stakeholders/[id]` | GET, PATCH, DELETE | Stakeholder CRUD |
| `/api/meetings` | GET, POST | List/create meetings |
| `/api/meetings/[id]` | GET, PATCH, DELETE | Meeting CRUD |
| `/api/project-events` | GET, POST | List/create project events |
| `/api/stakeholder-tasks` | GET, POST | List/create stakeholder tasks |
| `/api/stakeholder-tasks/send-reminders` | POST | Send deadline reminders |
| `/api/notifications` | GET, POST | List/create notifications |
| `/api/notifications/[id]` | PATCH, DELETE | Update/delete notification |
| `/api/notifications/read-all` | PATCH | Mark all as read |
| `/api/transcriptions` | GET, POST | List/create transcriptions |
| `/api/documents` | GET | List generated documents |
| `/api/documents/generate` | POST | Generate DOCX document |

## Database Schema

```
User
  ├── Project (owner)
  ├── Task (owner, assignee)
  ├── Note (author)
  ├── Stakeholder
  ├── Meeting (organizer)
  ├── MeetingAttendee
  ├── Notification
  └── ProjectEvent

Project
  ├── Phase
  ├── Task
  ├── Note
  ├── Stakeholder
  ├── Meeting
  ├── ProjectEvent
  ├── StakeholderTask
  └── GeneratedDocument

Meeting
  ├── MeetingAttendee
  └── Transcription

Stakeholder
  ├── MeetingAttendee
  └── StakeholderTask

DocumentTemplate
  └── GeneratedDocument
```

## Environment Variables

```
# Database (Required)
DATABASE_URL=postgresql://...

# Clerk (Optional - app works without these)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:seed      # Seed database
npm run db:studio    # Prisma Studio
```

---
*Last updated: August 14, 2026*