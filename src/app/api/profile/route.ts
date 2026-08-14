import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    displayName,
    bio,
    city,
    country,
    relationshipGoals,
    visibility,
    heightCm,
    weightKg,
    hairColor,
    eyeColor,
    drinkingStatus,
    smokingStatus,
    occupation,
    nationality,
    ethnicity,
    hobbies,
    residentialArea,
  } = body;

  const shared = {
    displayName,
    bio,
    city,
    country,
    relationshipGoals: relationshipGoals ?? [],
    visibility: visibility ?? "PUBLIC",
    heightCm: heightCm ? Number(heightCm) : null,
    weightKg: weightKg ? Number(weightKg) : null,
    hairColor,
    eyeColor,
    drinkingStatus,
    smokingStatus,
    occupation,
    nationality,
    ethnicity,
    hobbies: hobbies ?? [],
    residentialArea,
    isComplete: true,
  };

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: shared,
    create: { userId, ...shared },
  });

  return NextResponse.json({ profile });
}
