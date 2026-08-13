import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversation = await prisma.conversation.findUnique({ where: { id: params.id } });
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (![conversation.participantAId, conversation.participantBId].includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
