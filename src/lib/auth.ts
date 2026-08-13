import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET || "dev-only-insecure-secret";

export function signSession(userId: string): string {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { sub: string };
    return decoded.sub;
  } catch {
    return null;
  }
}
