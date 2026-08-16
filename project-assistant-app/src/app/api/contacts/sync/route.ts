import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  const query = request.nextUrl.searchParams.get("q") || "";

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const stakeholders = await db.stakeholder.findMany({
    where: {
      projectId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(stakeholders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, contacts } = body;

  if (!projectId || !contacts || !Array.isArray(contacts)) {
    return NextResponse.json({ error: "projectId and contacts array required" }, { status: 400 });
  }

  const results = [];

  for (const contact of contacts) {
    if (!contact.name) continue;

    const existing = await db.stakeholder.findFirst({
      where: {
        projectId,
        OR: [
          { email: contact.email },
          { phone: contact.phone },
        ],
      },
    });

    let stakeholder;
    if (existing) {
      stakeholder = await db.stakeholder.update({
        where: { id: existing.id },
        data: {
          name: contact.name || existing.name,
          email: contact.email || existing.email,
          phone: contact.phone || existing.phone,
          company: contact.company || existing.company,
          role: contact.role || existing.role,
        },
      });
      results.push({ ...stakeholder, action: "updated" });
    } else {
      stakeholder = await db.stakeholder.create({
        data: {
          projectId,
          name: contact.name,
          email: contact.email || null,
          phone: contact.phone || null,
          company: contact.company || null,
          role: contact.role || "stakeholder",
        },
      });
      results.push({ ...stakeholder, action: "created" });
    }
  }

  return NextResponse.json({ stakeholders: results });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { projectId, vcard } = body;

  if (!projectId || !vcard) {
    return NextResponse.json({ error: "projectId and vcard required" }, { status: 400 });
  }

  // Parse vCard format (basic parsing)
  const contacts = parseVCard(vcard);
  const results = [];

  for (const contact of contacts) {
    if (!contact.name) continue;

    const existing = await db.stakeholder.findFirst({
      where: {
        projectId,
        OR: [
          { email: contact.email },
          { phone: contact.phone },
        ],
      },
    });

    let stakeholder;
    if (existing) {
      stakeholder = await db.stakeholder.update({
        where: { id: existing.id },
        data: {
          name: contact.name || existing.name,
          email: contact.email || existing.email,
          phone: contact.phone || existing.phone,
          company: contact.company || existing.company,
          role: contact.role || existing.role,
        },
      });
      results.push({ ...stakeholder, action: "updated" });
    } else {
      stakeholder = await db.stakeholder.create({
        data: {
          projectId,
          name: contact.name,
          email: contact.email || null,
          phone: contact.phone || null,
          company: contact.company || null,
          role: contact.role || "stakeholder",
        },
      });
      results.push({ ...stakeholder, action: "created" });
    }
  }

  return NextResponse.json({ stakeholders: results });
}

function parseVCard(vcard: string) {
  const contacts: Array<{ name: string; email?: string; phone?: string; company?: string; role?: string }> = [];
  const lines = vcard.split("\n");
  let currentContact: { name: string; email?: string; phone?: string; company?: string; role?: string } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VCARD") {
      currentContact = { name: "" };
    } else if (trimmed === "END:VCARD" && currentContact) {
      if (currentContact.name) {
        contacts.push(currentContact);
      }
      currentContact = null;
    } else if (currentContact) {
      if (trimmed.startsWith("FN:") || trimmed.startsWith("N:")) {
        currentContact.name = trimmed.substring(3);
      } else if (trimmed.startsWith("EMAIL:")) {
        currentContact.email = trimmed.substring(6);
      } else if (trimmed.startsWith("TEL:")) {
        currentContact.phone = trimmed.substring(4);
      } else if (trimmed.startsWith("ORG:")) {
        currentContact.company = trimmed.substring(4);
      } else if (trimmed.startsWith("ROLE:") || trimmed.startsWith("TITLE:")) {
        currentContact.role = trimmed.substring(trimmed.indexOf(":") + 1);
      }
    }
  }

  return contacts;
}