import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

async function requireAdmin(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const reports = await prisma.report.findMany({
    where: { status: { in: ["OPEN", "IN_REVIEW"] } },
    include: {
      reportedBy: { select: { email: true } },
      reportedUser: { select: { email: true, isSuspended: true, profile: { select: { displayName: true } } } },
    },
    orderBy: [{ reason: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ reports });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { reportId, action } = await req.json();
  // action: "SUSPEND_USER" | "DISMISS" | "MARK_ACTIONED"

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "SUSPEND_USER") {
    await prisma.user.update({
      where: { id: report.reportedUserId },
      data: { isSuspended: true, suspendedReason: `Report: ${report.reason}` },
    });
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "ACTIONED", reviewedById: admin.id, resolvedAt: new Date() },
    });
  } else if (action === "DISMISS") {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "DISMISSED", reviewedById: admin.id, resolvedAt: new Date() },
    });
  } else if (action === "MARK_ACTIONED") {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "ACTIONED", reviewedById: admin.id, resolvedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
