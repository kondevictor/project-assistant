UPDATE "Project" SET "ownerId" = (SELECT "id" FROM "User" WHERE "clerkId" = 'demo-user-clerk-id' LIMIT 1) WHERE "ownerId" IS NULL;
UPDATE "Task" SET "ownerId" = (SELECT "id" FROM "User" WHERE "clerkId" = 'demo-user-clerk-id' LIMIT 1) WHERE "ownerId" IS NULL;
UPDATE "Note" SET "authorId" = (SELECT "id" FROM "User" WHERE "clerkId" = 'demo-user-clerk-id' LIMIT 1) WHERE "authorId" IS NULL;