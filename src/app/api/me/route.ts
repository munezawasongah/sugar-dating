import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    verificationStatus: user.verificationStatus,
    isPremium: user.isPremium,
    hasPaidContactFee: user.hasPaidContactFee,
    canContactFreely: user.role === "ADMIN" || user.isPremium || user.hasPaidContactFee,
    profile: user.profile,
  });
}
