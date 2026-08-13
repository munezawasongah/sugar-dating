// POST /api/matches         -> initiate a match (like/interest)
// PATCH /api/matches/:id    -> accept/decline
// A Conversation row is only created once both sides have MATCHED status.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId } = await req.json();
  if (!recipientId) return NextResponse.json({ error: "recipientId required" }, { status: 400 });

  // Prevent matching blocked users
  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: recipientId },
        { blockerId: recipientId, blockedId: userId },
      ],
    },
  });
  if (blocked) return NextResponse.json({ error: "Cannot match with this user" }, { status: 403 });

  // Check if the recipient already initiated toward us -> mutual match
  const reciprocal = await prisma.match.findUnique({
    where: { initiatorId_recipientId: { initiatorId: recipientId, recipientId: userId } },
  });

  if (reciprocal) {
    const updated = await prisma.match.update({
      where: { id: reciprocal.id },
      data: { status: "MATCHED", respondedAt: new Date() },
    });

    const conversation = await prisma.conversation.create({
      data: {
        matchId: updated.id,
        participantAId: updated.initiatorId,
        participantBId: updated.recipientId,
      },
    });

    return NextResponse.json({ match: updated, conversation }, { status: 200 });
  }

  const match = await prisma.match.create({
    data: { initiatorId: userId, recipientId, status: "PENDING" },
  });

  return NextResponse.json({ match }, { status: 201 });
}
