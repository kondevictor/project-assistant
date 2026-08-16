-- AlterTable: Add stakeholderId to Task for direct stakeholder assignment
ALTER TABLE "Task" ADD COLUMN "stakeholderId" TEXT;

-- CreateIndex
CREATE INDEX "Task_stakeholderId_idx" ON "Task"("stakeholderId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
