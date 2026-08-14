// POST /api/matches         -> initiate a match (like/interest)
// PATCH /api/matches/:id    -> accept/decline
// A Conversation row is only created once both sides have MATCHED status.
//
// Contact-eligibility rules enforced here:
//  - Admins bypass every restriction below.
//  - Premium members can contact anyone (premium or not) with no fee.
//  - Non-premium members must have paid the one-off contact fee before
//    they can initiate contact with ANYONE.
//  - Non-premium members can never initiate contact with a premium member,
//    even after paying the fee — only premium members can reach premium members.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { recipientId } = await req.json();
  if (!recipientId) return NextResponse.json({ error: "recipientId required" }, { status: 400 });

  const [initiator, recipient] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { id: recipientId } }),
  ]);
  if (!initiator || !recipient) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (initiator.role !== "ADMIN") {
    if (recipient.isPremium && !initiator.isPremium) {
      return NextResponse.json(
        { error: "Only premium members can contact premium members." },
        { status: 403 }
      );
    }
    if (!initiator.isPremium && !initiator.hasPaidContactFee) {
      return NextResponse.json(
        {
          error: "A one-off KES 2,000 contact fee is required before you can message other members.",
          needsPayment: true,
        },
        { status: 402 }
      );
    }
  }

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
