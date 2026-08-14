import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const stakeholder = await db.stakeholder.findUnique({
    where: { id },
  });

  if (!stakeholder) {
    return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 });
  }

  return NextResponse.json(stakeholder);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, email, phone, company, role, notes } = body;

  const stakeholder = await db.stakeholder.update({
    where: { id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      role,
      notes: notes || null,
    },
  });

  return NextResponse.json(stakeholder);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.stakeholder.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
