import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/project_assistant",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.project.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} project(s) already exist.`);
    return;
  }

  // Create a demo user first (matches Clerk user in development)
  const demoUser = await prisma.user.upsert({
    where: { clerkId: "demo-user-clerk-id" },
    update: {},
    create: {
      clerkId: "demo-user-clerk-id",
      email: "demo@projectassistant.local",
      name: "Demo User",
      role: "freelancer",
      onboardingComplete: true,
    },
  });

  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const daysFromNow = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const website = await prisma.project.create({
    data: {
      name: "Website Relaunch",
      description: "Redesign and relaunch the marketing site.",
      stage: "EXECUTION",
      startDate: daysAgo(30),
      targetDate: daysFromNow(14),
      ownerId: demoUser.id,
      phases: {
        create: [
          { name: "Design", isMilestone: true, dueDate: daysAgo(10), completedAt: daysAgo(9), order: 0 },
          { name: "Build", isMilestone: true, dueDate: daysFromNow(7), order: 1 },
          { name: "Launch", isMilestone: true, dueDate: daysFromNow(14), order: 2 },
        ],
      },
    },
    include: { phases: true },
  });

  const designPhase = website.phases.find((p) => p.name === "Design")!;
  const buildPhase = website.phases.find((p) => p.name === "Build")!;
  const launchPhase = website.phases.find((p) => p.name === "Launch")!;

  await prisma.task.createMany({
    data: [
      {
        projectId: website.id,
        phaseId: designPhase.id,
        title: "Wireframe high-fidelity mockups",
        status: "DONE",
        priority: "HIGH",
        ownerId: demoUser.id,
        completedAt: daysAgo(9),
        lastStatusChangeAt: daysAgo(9),
      },
      {
        projectId: website.id,
        phaseId: buildPhase.id,
        title: "Implement checkout flow",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: demoUser.id,
        dueDate: daysFromNow(2),
        lastStatusChangeAt: daysAgo(10),
      },
      {
        projectId: website.id,
        phaseId: buildPhase.id,
        title: "Fix mobile nav overlap bug",
        status: "NOT_STARTED",
        priority: "CRITICAL",
        dueDate: daysAgo(2),
        lastStatusChangeAt: daysAgo(12),
      },
      {
        projectId: website.id,
        phaseId: buildPhase.id,
        title: "Write launch announcement",
        status: "BLOCKED",
        priority: "MEDIUM",
        blockedReason: "Design mockups not finalized",
        lastStatusChangeAt: daysAgo(1),
      },
      {
        projectId: website.id,
        phaseId: buildPhase.id,
        title: "Optimize core web vitals",
        status: "NOT_STARTED",
        priority: "MEDIUM",
        dueDate: daysFromNow(5),
        lastStatusChangeAt: daysAgo(5),
      },
      {
        projectId: website.id,
        phaseId: launchPhase.id,
        title: "Configure production DNS",
        status: "NOT_STARTED",
        priority: "LOW",
        dueDate: daysFromNow(13),
        lastStatusChangeAt: now,
      },
    ],
  });

  const migration = await prisma.project.create({
    data: {
      name: "Internal Tools Migration",
      description: "Move internal scripts off the legacy server.",
      stage: "PLANNING",
      startDate: daysAgo(5),
      targetDate: daysFromNow(45),
      ownerId: demoUser.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        projectId: migration.id,
        title: "Inventory existing scripts",
        status: "DONE",
        priority: "LOW",
        completedAt: daysAgo(3),
        lastStatusChangeAt: daysAgo(3),
      },
      {
        projectId: migration.id,
        title: "Evaluate new hosting platform",
        status: "IN_PROGRESS",
        priority: "HIGH",
        ownerId: demoUser.id,
        dueDate: daysFromNow(7),
        lastStatusChangeAt: daysAgo(2),
      },
    ],
  });

  const compliance = await prisma.project.create({
    data: {
      name: "Compliance Audit Preparation",
      description: "Prepare SOC 2 type II documentation for upcoming audit.",
      stage: "REVIEW",
      startDate: daysAgo(60),
      targetDate: daysAgo(5),
      completedAt: null,
      ownerId: demoUser.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        projectId: compliance.id,
        title: "Draft privacy policy",
        status: "DONE",
        priority: "HIGH",
        completedAt: daysAgo(15),
        lastStatusChangeAt: daysAgo(15),
      },
      {
        projectId: compliance.id,
        title: "Internal security questionnaire",
        status: "BLOCKED",
        priority: "CRITICAL",
        blockedReason: "Awaiting final vendor certificates",
        dueDate: daysAgo(3),
        lastStatusChangeAt: daysAgo(5),
      },
      {
        projectId: compliance.id,
        title: "Update data retention policies",
        status: "DONE",
        priority: "MEDIUM",
        completedAt: daysAgo(10),
        lastStatusChangeAt: daysAgo(10),
      },
      {
        projectId: compliance.id,
        title: "Schedule auditor review call",
        status: "NOT_STARTED",
        priority: "HIGH",
        dueDate: daysFromNow(2),
        lastStatusChangeAt: daysAgo(1),
      },
    ],
  });

  console.log("Seeded 3 projects with tasks, phases, and varied statuses.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });