// POST /api/reports  — file a report against a user
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportedUserId, reason, details, evidenceKeys } = await req.json();
  if (!reportedUserId || !reason) {
    return NextResponse.json({ error: "reportedUserId and reason required" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      reportedById: userId,
      reportedUserId,
      reason,
      details,
      evidenceKeys: evidenceKeys ?? [],
    },
  });

  // UNDERAGE_SUSPECTED reports should short-circuit to immediate account
  // suspension pending review, not sit in a normal queue.
  if (reason === "UNDERAGE_SUSPECTED") {
    await prisma.user.update({
      where: { id: reportedUserId },
      data: { isSuspended: true, suspendedReason: "Pending review: underage suspicion" },
    });
  }

  return NextResponse.json({ report }, { status: 201 });
}
