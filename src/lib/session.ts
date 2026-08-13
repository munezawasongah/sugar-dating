// Placeholder session resolution. Swap for your real auth (NextAuth,
// Supabase Auth session cookie, or a signed JWT you issue at login).
import { NextRequest } from "next/server";

export async function getSessionUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("session_token")?.value;
  if (!token) return null;
  // TODO: verify token (e.g. jwt.verify) and return the userId claim.
  return null;
}
