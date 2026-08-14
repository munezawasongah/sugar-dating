// Daraja calls this URL once the customer approves/cancels the STK push
// prompt. Configure DARAJA_CALLBACK_URL to point here (e.g.
// https://your-app.up.railway.app/api/webhooks/mpesa) once real credentials
// are set up.
import { NextRequest, NextResponse } from "next/server";
import { handleContactFeeCallback } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const stkCallback = body?.Body?.stkCallback;
  if (!stkCallback) return NextResponse.json({ ok: true });

  const checkoutRequestId = stkCallback.CheckoutRequestID;
  const success = stkCallback.ResultCode === 0;

  await handleContactFeeCallback(checkoutRequestId, success);

  return NextResponse.json({ ok: true });
}
