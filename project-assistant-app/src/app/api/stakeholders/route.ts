import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const stakeholders = await db.stakeholder.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(stakeholders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, name, email, phone, company, role, notes } = body;

  if (!projectId || !name || !role) {
    return NextResponse.json({ error: "projectId, name, and role are required" }, { status: 400 });
  }

  const stakeholder = await db.stakeholder.create({
    data: {
      projectId,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      role,
      notes: notes || null,
    },
  });

  return NextResponse.json(stakeholder, { status: 201 });
}
