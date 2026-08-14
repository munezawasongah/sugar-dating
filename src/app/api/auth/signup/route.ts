// POST /api/auth/signup
// Hard age gate: rejects at the API layer, not just client-side validation.
// ID verification is a SEPARATE follow-up step (kicked off after signup),
// but no profile is searchable/visible until verificationStatus === VERIFIED.

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { startVerificationSession } from "@/lib/verification";
import { signSession } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  role: z.enum(["SPONSOR", "PARTNER"]),
  dateOfBirth: z.coerce.date(),
  phone: z.string().min(9), // used for WhatsApp direct-message and M-Pesa payments
});

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, role, dateOfBirth, phone } = parsed.data;

  // --- Hard age gate ---
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    // Do not reveal *why* precisely beyond age requirement; log internally for abuse monitoring.
    return NextResponse.json(
      { error: "You must be at least 18 years old to register." },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    return NextResponse.json({ error: "Phone number already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      dateOfBirth,
      phone,
      verificationStatus: "UNVERIFIED",
    },
  });

  // Kick off ID verification session with third-party KYC vendor (Persona/Veriff/Onfido).
  // Profile stays non-discoverable until this resolves to VERIFIED via webhook.
  // NOTE: if KYC_VENDOR_API_KEY isn't configured yet (e.g. early development),
  // this is skipped gracefully so the rest of signup/login still works.
  let verificationSessionUrl: string | null = null;
  if (process.env.KYC_VENDOR_API_KEY) {
    try {
      const verificationSession = await startVerificationSession(user.id);
      verificationSessionUrl = verificationSession.redirectUrl;
    } catch (err) {
      console.error("KYC session creation failed:", err);
    }
  }

  const token = signSession(user.id);
  const res = NextResponse.json(
    {
      userId: user.id,
      nextStep: "ID_VERIFICATION",
      verificationSessionUrl,
    },
    { status: 201 }
  );
  res.cookies.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
