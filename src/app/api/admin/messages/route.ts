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

  const messages = await prisma.message.findMany({
    where: { flaggedForReview: true, deletedAt: null },
    include: { sender: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { messageId } = await req.json();
  await prisma.message.update({
    where: { id: messageId },
    data: { flaggedForReview: false },
  });

  return NextResponse.json({ ok: true });
}
