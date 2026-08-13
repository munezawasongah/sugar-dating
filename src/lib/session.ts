// Reads and verifies the session cookie set at login.
import { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function getSessionUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("session_token")?.value;
  if (!token) return null;
  return verifySession(token);
}
