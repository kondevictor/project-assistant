-- Create missing tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "role" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "ProjectEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StakeholderTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StakeholderTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DocumentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectEvent" ADD CONSTRAINT "ProjectEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StakeholderTask" ADD CONSTRAINT "StakeholderTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StakeholderTask" ADD CONSTRAINT "StakeholderTask_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DocumentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add indexes
CREATE INDEX IF NOT EXISTS "ProjectEvent_projectId_idx" ON "ProjectEvent"("projectId");
CREATE INDEX IF NOT EXISTS "ProjectEvent_createdAt_idx" ON "ProjectEvent"("createdAt");
CREATE INDEX IF NOT EXISTS "StakeholderTask_projectId_idx" ON "StakeholderTask"("projectId");
CREATE INDEX IF NOT EXISTS "StakeholderTask_stakeholderId_idx" ON "StakeholderTask"("stakeholderId");
CREATE INDEX IF NOT EXISTS "StakeholderTask_dueDate_idx" ON "StakeholderTask"("dueDate");
CREATE INDEX IF NOT EXISTS "StakeholderTask_status_idx" ON "StakeholderTask"("status");
CREATE INDEX IF NOT EXISTS "GeneratedDocument_projectId_idx" ON "GeneratedDocument"("projectId");
CREATE INDEX IF NOT EXISTS "GeneratedDocument_templateId_idx" ON "GeneratedDocument"("templateId");