// Thin wrapper around a third-party KYC/identity verification vendor.
// DO NOT build your own liveness/ID-document verification — use a vendor
// (Persona, Veriff, Onfido) that carries the compliance burden and is
// updated against new document/deepfake fraud patterns continuously.
//
// This module only orchestrates: create a session, and handle the
// webhook that reports the vendor's verdict back to us.

import { prisma } from "@/lib/prisma";

interface VerificationSession {
  sessionId: string;
  redirectUrl: string;
}

export async function startVerificationSession(userId: string): Promise<VerificationSession> {
  const apiKey = process.env.KYC_VENDOR_API_KEY;
  if (!apiKey) throw new Error("KYC_VENDOR_API_KEY not configured");

  const res = await fetch("https://withpersona.com/api/v1/inquiries", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          "inquiry-template-id": process.env.KYC_TEMPLATE_ID,
          "reference-id": userId, // ties the vendor session back to our user
        },
      },
    }),
  });

  if (!res.ok) throw new Error(`KYC session creation failed: ${res.status}`);
  const json = await res.json();

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: "PENDING",
      verificationVendorRef: json.data.id,
    },
  });

  return {
    sessionId: json.data.id,
    redirectUrl: json.data.attributes["redirect-url"] ?? json.meta?.redirectUrl,
  };
}

// Called from /api/webhooks/kyc — verify the webhook signature before
// ever calling this in production (vendor-specific HMAC check omitted here).
export async function handleVerificationWebhook(vendorRef: string, verdict: "APPROVED" | "DECLINED") {
  const user = await prisma.user.findFirst({ where: { verificationVendorRef: vendorRef } });
  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationStatus: verdict === "APPROVED" ? "VERIFIED" : "REJECTED",
      verifiedAt: verdict === "APPROVED" ? new Date() : null,
    },
  });
}
