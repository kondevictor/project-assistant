-- Create new tables (skip if exists)
CREATE TABLE IF NOT EXISTS "Stakeholder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "role" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Meeting" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "meetingUrl" TEXT,
    "meetingType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MeetingAttendee" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "stakeholderId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingAttendee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Transcription" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "transcript" TEXT,
    "summary" TEXT,
    "actionItems" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Add new columns to existing tables
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "assigneeId" TEXT;
ALTER TABLE "Task" DROP COLUMN IF EXISTS "owner";
ALTER TABLE "Note" ADD COLUMN IF NOT EXISTS "authorId" TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS "Stakeholder_projectId_idx" ON "Stakeholder"("projectId");
CREATE INDEX IF NOT EXISTS "Stakeholder_userId_idx" ON "Stakeholder"("userId");
CREATE INDEX IF NOT EXISTS "Stakeholder_email_idx" ON "Stakeholder"("email");

CREATE INDEX IF NOT EXISTS "Meeting_projectId_idx" ON "Meeting"("projectId");
CREATE INDEX IF NOT EXISTS "Meeting_organizerId_idx" ON "Meeting"("organizerId");
CREATE INDEX IF NOT EXISTS "Meeting_startTime_idx" ON "Meeting"("startTime");
CREATE INDEX IF NOT EXISTS "Meeting_status_idx" ON "Meeting"("status");

CREATE INDEX IF NOT EXISTS "MeetingAttendee_meetingId_idx" ON "MeetingAttendee"("meetingId");
CREATE INDEX IF NOT EXISTS "MeetingAttendee_userId_idx" ON "MeetingAttendee"("userId");
CREATE INDEX IF NOT EXISTS "MeetingAttendee_stakeholderId_idx" ON "MeetingAttendee"("stakeholderId");
CREATE UNIQUE INDEX IF NOT EXISTS "MeetingAttendee_meetingId_userId_key" ON "MeetingAttendee"("meetingId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "MeetingAttendee_meetingId_stakeholderId_key" ON "MeetingAttendee"("meetingId", "stakeholderId");

CREATE UNIQUE INDEX IF NOT EXISTS "Transcription_meetingId_key" ON "Transcription"("meetingId");

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "Notification"("read");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

CREATE INDEX IF NOT EXISTS "Note_authorId_idx" ON "Note"("authorId");
CREATE INDEX IF NOT EXISTS "Project_ownerId_idx" ON "Project"("ownerId");
CREATE INDEX IF NOT EXISTS "Task_ownerId_idx" ON "Task"("ownerId");
CREATE INDEX IF NOT EXISTS "Task_assigneeId_idx" ON "Task"("assigneeId");

-- Add foreign keys (only if User table exists and columns have data)
-- We'll add these after ensuring User table exists and populating data