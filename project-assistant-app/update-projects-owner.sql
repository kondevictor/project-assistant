UPDATE "Project" SET "ownerId" = 'demo-user-001' WHERE "ownerId" IS NULL;
UPDATE "Task" SET "ownerId" = 'demo-user-001' WHERE "ownerId" IS NULL;
UPDATE "Note" SET "authorId" = 'demo-user-001' WHERE "authorId" IS NULL;