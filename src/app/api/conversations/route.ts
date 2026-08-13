// GET /api/conversations — list the current user's conversations with
// last message preview, for the inbox screen.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantAId: userId }, { participantBId: userId }],
      isArchived: false,
    },
    include: {
      participantA: { include: { profile: true } },
      participantB: { include: { profile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const shaped = conversations.map((c) => {
    const other = c.participantAId === userId ? c.participantB : c.participantA;
    return {
      id: c.id,
      otherUser: {
        id: other.id,
        displayName: other.profile?.displayName ?? "Member",
        verificationStatus: other.verificationStatus,
      },
      lastMessage: c.messages[0]?.body ?? null,
      lastMessageAt: c.lastMessageAt,
    };
  });

  return NextResponse.json({ conversations: shaped });
}
