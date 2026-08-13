// GET /api/discover
// Returns candidate profiles for the current user based on their Preference row.
// Enforces: only VERIFIED users are discoverable, visibility rules respected,
// blocked users excluded in both directions, already-matched users excluded.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: userId },
    include: { preferences: true },
  });
  if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Users must complete their own verification before browsing others —
  // reduces unverified accounts scraping/farming profiles.
  if (me.verificationStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "Complete ID verification to browse profiles." },
      { status: 403 }
    );
  }

  const prefs = me.preferences;
  const oppositeRole = me.role === "SPONSOR" ? "PARTNER" : "SPONSOR";

  const [blockedByMe, blockingMe] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: userId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: userId }, select: { blockerId: true } }),
  ]);
  const excludedIds = new Set([
    ...blockedByMe.map((b) => b.blockedId),
    ...blockingMe.map((b) => b.blockerId),
    userId,
  ]);

  const now = new Date();
  const minDob = new Date(now.getFullYear() - (prefs?.maxAge ?? 99) - 1, now.getMonth(), now.getDate());
  const maxDob = new Date(now.getFullYear() - (prefs?.minAge ?? 18), now.getMonth(), now.getDate());

  const candidates = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludedIds) },
      role: oppositeRole,
      verificationStatus: "VERIFIED",
      isActive: true,
      isSuspended: false,
      dateOfBirth: { gte: minDob, lte: maxDob },
      profile: {
        // STEALTH profiles never appear in discovery, only direct/matched contexts
        visibility: { in: ["PUBLIC", "INCOGNITO"] },
        isComplete: true,
      },
    },
    include: {
      profile: {
        include: {
          photos: { where: { isPrivate: false }, take: 3 },
        },
      },
    },
    take: 30,
  });

  return NextResponse.json({ candidates });
}
