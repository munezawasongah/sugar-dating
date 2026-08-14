import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

async function requireAdmin(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

// GET — list every account that currently has admin access
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ admins, currentUserId: admin.id });
}

// POST — grant admin access to an existing account by email
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { email } });
  if (!target) {
    return NextResponse.json(
      { error: "No account found with that email. They need to sign up first." },
      { status: 404 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: {
      role: "ADMIN",
      // Admins get unlimited access by definition — also mark them verified
      // and past the contact fee so nothing blocks them.
      verificationStatus: "VERIFIED",
      hasPaidContactFee: true,
    },
  });

  return NextResponse.json({ email: updated.email, role: updated.role });
}

// DELETE — revoke admin access from an account (demotes to Partner by default)
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (userId === admin.id) {
    return NextResponse.json({ error: "You cannot revoke your own admin access." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "PARTNER" },
  });

  return NextResponse.json({ ok: true });
}
