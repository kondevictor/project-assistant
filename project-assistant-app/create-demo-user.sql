INSERT INTO "User" ("id", "clerkId", "email", "name", "role", "onboardingComplete", "createdAt", "updatedAt")
VALUES (
  'demo-user-001',
  'demo-user-clerk-id',
  'demo@projectassistant.local',
  'Demo User',
  'freelancer',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("clerkId") DO NOTHING;