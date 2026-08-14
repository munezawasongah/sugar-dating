// GET /api/discover
// Returns candidate profiles for the current user to browse. Browsing is
// open to every member regardless of role — a Sponsor can see other
// Sponsors as well as Partners, and vice versa. Contacting someone (via
// /api/matches) is a separate, gated action: normal members need to have
// paid the one-off fee, and can never contact premium members.
// Enforces: only VERIFIED users are discoverable, visibility rules respected,
// blocked users excluded in both directions.

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
  // reduces unverified accounts scraping/farming profiles. Admins bypass this.
  if (me.role !== "ADMIN" && me.verificationStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "Confirm your age to browse profiles." },
      { status: 403 }
    );
  }

  const canSeePhone = me.role === "ADMIN" || me.isPremium;

  const prefs = me.preferences;

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
      role: { in: ["SPONSOR", "PARTNER"] }, // browse everyone; excludes admin/moderator accounts from the feed
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
    select: {
      id: true,
      role: true,
      dateOfBirth: true,
      isPremium: true,
      phone: canSeePhone,
      profile: {
        include: {
          photos: { where: { isPrivate: false }, take: 3 },
        },
      },
    },
    take: 60,
  });

  return NextResponse.json({ candidates });
}
