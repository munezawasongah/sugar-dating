import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const message = await prisma.message.findUnique({ where: { id: params.id } });
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const requester = await prisma.user.findUnique({ where: { id: userId } });

  // Members can only delete their own messages; admins can delete any.
  if (message.senderId !== userId && requester?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.message.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
