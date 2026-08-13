// POST /api/messages
// Sends a message within an existing conversation. Runs scam-pattern
// scanning before persisting; flagged messages still send (don't silently
// censor consenting adults) but are queued for moderator review and the
// sender sees an inline safety tip.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { scanMessageForScamPatterns } from "@/lib/scamDetection";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId, body, mediaKey, mediaType } = await req.json();
  if (!conversationId || (!body && !mediaKey)) {
    return NextResponse.json({ error: "conversationId and body or media required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  if (![conversation.participantAId, conversation.participantBId].includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const otherUserId =
    conversation.participantAId === userId ? conversation.participantBId : conversation.participantAId;

  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: userId, blockedId: otherUserId },
        { blockerId: otherUserId, blockedId: userId },
      ],
    },
  });
  if (blocked) return NextResponse.json({ error: "Cannot message this user" }, { status: 403 });

  const scan = body ? scanMessageForScamPatterns(body) : { flagged: false, reason: null };

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      body,
      mediaKey,
      mediaType,
      flaggedForReview: scan.flagged,
      flagReason: scan.reason,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  return NextResponse.json({
    message,
    // Surface a non-blocking safety tip client-side when a financial-request
    // pattern is detected — this is the single highest-value warning to show.
    safetyWarning: scan.flagged
      ? "Reminder: never send money, gift cards, or financial details to someone you haven't met and verified in person."
      : null,
  });
}
