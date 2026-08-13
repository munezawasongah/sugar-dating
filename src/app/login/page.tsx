"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      router.push("/discover");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#B8935A" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="14" stroke="#B8935A" strokeWidth="1" />
            <circle cx="20" cy="20" r="3" fill="#B8935A" />
          </svg>
          <span className="font-display text-xl">Arrangement</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h1 className="font-display text-2xl mb-4 text-center">Welcome back</h1>

          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-lg" style={{ background: "rgba(180,117,107,0.1)", border: "1px solid rgba(180,117,107,0.4)", color: "#B4756B" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm"
            style={{ background: "#B8935A", color: "#12151A" }}
          >
            {loading ? "Logging in…" : "Log in"}
          </button>

          <p className="text-xs text-center" style={{ color: "#8B93A0" }}>
            New here?{" "}
            <a href="/signup" className="underline" style={{ color: "#B8935A" }}>
              Create an account
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
