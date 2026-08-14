import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");

  if (projectId && projectId !== "all") {
    const documents = await db.generatedDocument.findMany({
      where: { projectId },
      include: { template: true, project: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  }

  const documents = await db.generatedDocument.findMany({
    include: { template: true, project: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
