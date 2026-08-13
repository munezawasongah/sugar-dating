import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { displayName, bio, city, country, relationshipGoals, visibility } = body;

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      displayName,
      bio,
      city,
      country,
      relationshipGoals: relationshipGoals ?? [],
      visibility: visibility ?? "PUBLIC",
      isComplete: true,
    },
    create: {
      userId,
      displayName,
      bio,
      city,
      country,
      relationshipGoals: relationshipGoals ?? [],
      visibility: visibility ?? "PUBLIC",
      isComplete: true,
    },
  });

  return NextResponse.json({ profile });
}
