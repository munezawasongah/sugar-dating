// PUT /api/profile/avatar
// Accepts a base64 data URL (from a client-side FileReader) and stores it
// directly on the Profile row. This is a pragmatic MVP approach — once real
// object storage (Supabase Storage / Cloudflare R2) is wired up, swap this
// to upload the bytes there and store a storageKey instead, matching the
// Photo model already in schema.prisma.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap, since this is stored directly in Postgres for now

export async function PUT(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { dataUrl } = await req.json();
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "A valid image is required." }, { status: 400 });
  }

  const approxBytes = Math.ceil((dataUrl.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large — please use one under 2MB." }, { status: 413 });
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: { avatarDataUrl: dataUrl },
    create: { userId, displayName: "Member", avatarDataUrl: dataUrl },
  });

  return NextResponse.json({ avatarDataUrl: profile.avatarDataUrl });
}

export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.profile.update({
    where: { userId },
    data: { avatarDataUrl: null },
  });

  return NextResponse.json({ ok: true });
}
