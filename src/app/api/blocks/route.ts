// POST /api/blocks — block a user (removes visibility both directions)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { blockedId } = await req.json();
  if (!blockedId) return NextResponse.json({ error: "blockedId required" }, { status: 400 });

  const block = await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: userId, blockedId } },
    update: {},
    create: { blockerId: userId, blockedId },
  });

  // Also archive any shared conversation so it drops out of active inbox.
  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { initiatorId: userId, recipientId: blockedId },
        { initiatorId: blockedId, recipientId: userId },
      ],
    },
    include: { conversation: true },
  });
  if (match?.conversation) {
    await prisma.conversation.update({
      where: { id: match.conversation.id },
      data: { isArchived: true },
    });
  }

  return NextResponse.json({ block }, { status: 201 });
}
