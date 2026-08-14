import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";
import { initiateContactFeePayment } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "ADMIN" || user.isPremium || user.hasPaidContactFee) {
    return NextResponse.json({ error: "No payment needed for this account." }, { status: 400 });
  }

  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "Phone number required." }, { status: 400 });

  try {
    const { intent, simulated } = await initiateContactFeePayment(userId, phone);
    return NextResponse.json({
      status: intent.status,
      simulated,
      message: simulated
        ? "Payment simulated — M-Pesa isn't fully configured yet, so this was auto-approved for testing."
        : "Check your phone to approve the M-Pesa payment prompt.",
    });
  } catch (err) {
    console.error("Contact fee payment failed:", err);
    return NextResponse.json({ error: "Payment could not be started. Please try again." }, { status: 500 });
  }
}
