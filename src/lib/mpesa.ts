// Thin wrapper around Safaricom's Daraja API for M-Pesa STK Push payments.
//
// IMPORTANT: until DARAJA_* env vars are configured with real credentials
// from Safaricom, this module cannot charge anyone real money. In that
// state, initiateContactFeePayment() clearly marks the payment as a
// simulated dev-mode success so the rest of the app (paywall, unlocking
// messaging) can be tested end-to-end before the real integration is wired
// up. Do not treat a "COMPLETED" status as a real charge until Daraja
// credentials are set and this has been tested against Safaricom's sandbox,
// then production, shortcode.

import { prisma } from "@/lib/prisma";

const DARAJA_BASE_URL =
  process.env.DARAJA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

function darajaConfigured() {
  return Boolean(
    process.env.DARAJA_CONSUMER_KEY &&
      process.env.DARAJA_CONSUMER_SECRET &&
      process.env.DARAJA_SHORTCODE &&
      process.env.DARAJA_PASSKEY &&
      process.env.DARAJA_CALLBACK_URL
  );
}

async function getAccessToken(): Promise<string> {
  const key = process.env.DARAJA_CONSUMER_KEY!;
  const secret = process.env.DARAJA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!res.ok) throw new Error("Failed to get Daraja access token");
  const json = await res.json();
  return json.access_token;
}

function darajaTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(
    d.getMinutes()
  )}${pad(d.getSeconds())}`;
}

/**
 * Kicks off the KES 2,000 one-off contact fee payment for a user.
 * Returns a PaymentIntent row the caller can show status for.
 */
export async function initiateContactFeePayment(userId: string, phone: string) {
  const intent = await prisma.paymentIntent.create({
    data: { userId, phone, amountKes: 2000, status: "PENDING" },
  });

  if (!darajaConfigured()) {
    // Dev-mode fallback: no real M-Pesa credentials configured yet.
    // Auto-complete so the contact-fee flow can be tested end-to-end.
    const completed = await prisma.paymentIntent.update({
      where: { id: intent.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { hasPaidContactFee: true, contactFeePaidAt: new Date() },
    });
    return { intent: completed, simulated: true };
  }

  const shortcode = process.env.DARAJA_SHORTCODE!;
  const passkey = process.env.DARAJA_PASSKEY!;
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

  const token = await getAccessToken();
  const res = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 2000,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: process.env.DARAJA_CALLBACK_URL,
      AccountReference: "Arrangement Contact Fee",
      TransactionDesc: "One-off contact fee",
    }),
  });

  if (!res.ok) {
    await prisma.paymentIntent.update({ where: { id: intent.id }, data: { status: "FAILED" } });
    throw new Error("STK push request failed");
  }

  const json = await res.json();
  const updated = await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: { providerRef: json.CheckoutRequestID },
  });

  return { intent: updated, simulated: false };
}

/**
 * Called from the Daraja callback webhook once the customer completes (or
 * cancels) the STK push prompt on their phone.
 */
export async function handleContactFeeCallback(checkoutRequestId: string, success: boolean) {
  const intent = await prisma.paymentIntent.findFirst({ where: { providerRef: checkoutRequestId } });
  if (!intent) return;

  await prisma.paymentIntent.update({
    where: { id: intent.id },
    data: { status: success ? "COMPLETED" : "FAILED", completedAt: new Date() },
  });

  if (success) {
    await prisma.user.update({
      where: { id: intent.userId },
      data: { hasPaidContactFee: true, contactFeePaidAt: new Date() },
    });
  }
}
