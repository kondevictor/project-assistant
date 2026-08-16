# Project Assistant - Features Documentation

## Overview
Project Assistant is a comprehensive project management application built with Next.js 16, Prisma ORM, PostgreSQL, and Clerk authentication.

## Core Features

### 1. Project Management & Stakeholder Binding
- **Projects** - Create, view, update projects with stages (Inception, Planning, Execution, Review, Completed, On Hold).
- **Stakeholder Creation in Projects** - Create projects with pre-assigned stakeholders and their specific role/relationship.
- **Project-Bound Stakeholders** - Every stakeholder explicitly belongs to a designated project.
- **Phonebook & Contact Sync** - Import/sync contacts directly from native browser phonebook or vCard `.vcf` file uploads (`/api/contacts/sync`).

### 2. Google Integration
- **Google OAuth & Calendar API** - OAuth 2.0 flow for Google Calendar and Meet.
- **Google Meet Link Generation** - Generate instant Google Meet video conference links directly.
- **Calendar Event Sync** - Create events directly in user's Google Calendar with assigned attendees.

### 3. Task Management & Assignment
- **Task Fields** - Task Title, Person Responsible (Stakeholder Assignee), Deadline (Due Date), Priority, Phase, Comments.
- **Task Statuses** - Record tasks as: `NOT_STARTED`, `PENDING`, `IN_PROGRESS`, `BLOCKED`, `DONE`, `FAILED`, `CANCELLED`.
- **Task Updates** - Change associated project, update status (`DONE`, `PENDING`, `FAILED`), and add comments.

### 4. Meeting Features & AI Transcription
- **Meeting Scheduling** - Attached to projects with automatic notification reminders.
- **Live Recording & Transcription** - Record microphone audio with live streaming speech recognition directly on screen.
- **Audio Upload** - Upload `.mp3`, `.wav`, `.m4a`, `.webm` audio files for processing.
- **AI Summary & Action Items** - Automatically generate summary paragraphs and extract key action items.

### 5. Document Generation (DOCX Download)
Generate downloadable and editable Word (`.docx`) documents for:
- **NCNDA** - Non-Compete Non-Disclosure Agreement
- **MOU** - Memorandum of Understanding
- **Mandate** - Mandate Agreement
- **Partnership** - Partnership Agreement
- **Contract** - Standard Service Contract Agreement

---
*Last updated: August 16, 2026*