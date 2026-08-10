import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.project.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} project(s) already exist.`);
    return;
  }

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

  const buildPhase = website.phases.find((p) => p.name === "Build")!;

  await prisma.task.create({
    data: {
      projectId: website.id,
      phaseId: buildPhase.id,
      title: "Implement checkout flow",
      status: "IN_PROGRESS",
      priority: "HIGH",
      owner: "You",
      dueDate: daysFromNow(2),
      lastStatusChangeAt: daysAgo(10),
    },
  });

  await prisma.task.create({
    data: {
      projectId: website.id,
      phaseId: buildPhase.id,
      title: "Fix mobile nav overlap bug",
      status: "NOT_STARTED",
      priority: "CRITICAL",
      dueDate: daysAgo(2),
      lastStatusChangeAt: daysAgo(12),
    },
  });

  await prisma.task.create({
    data: {
      projectId: website.id,
      phaseId: buildPhase.id,
      title: "Write launch announcement",
      status: "BLOCKED",
      priority: "MEDIUM",
      lastStatusChangeAt: daysAgo(1),
    },
  });

  const migration = await prisma.project.create({
    data: {
      name: "Internal Tools Migration",
      description: "Move internal scripts off the legacy server.",
      stage: "PLANNING",
      startDate: daysAgo(5),
      targetDate: daysFromNow(45),
    },
  });

  await prisma.task.create({
    data: {
      projectId: migration.id,
      title: "Inventory existing scripts",
      status: "DONE",
      priority: "LOW",
      completedAt: daysAgo(3),
      lastStatusChangeAt: daysAgo(3),
    },
  });

  console.log("Seeded 2 projects.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
