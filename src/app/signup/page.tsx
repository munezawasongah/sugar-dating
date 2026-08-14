"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"age" | "blocked" | "role" | "form">("age");
  const [role, setRole] = useState<"SPONSOR" | "PARTNER" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, dateOfBirth: dob, phone, ageConfirmed: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.formErrors?.[0] || data.error || "Something went wrong.");
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
        <div className="mb-6">
          <BackButton fallbackHref="/" />
        </div>
        <div className="flex items-center gap-2 mb-10 justify-center">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#B8935A" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="14" stroke="#B8935A" strokeWidth="1" />
            <circle cx="20" cy="20" r="3" fill="#B8935A" />
          </svg>
          <span className="font-display text-xl">Arrangement</span>
        </div>

        {step === "age" && (
          <div className="text-center">
            <h1 className="font-display text-2xl mb-3">Are you 18 or older?</h1>
            <p className="text-sm mb-8" style={{ color: "#8B93A0" }}>
              This platform is for adults only. You'll need to confirm your age before creating an
              account.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep("role")}
                className="py-3 rounded-lg text-sm font-semibold"
                style={{ background: "#B8935A", color: "#12151A" }}
              >
                Yes, I am 18 or older
              </button>
              <button
                onClick={() => setStep("blocked")}
                className="py-3 rounded-lg text-sm"
                style={{ border: "1px solid #2E3640", color: "#8B93A0" }}
              >
                No, I am under 18
              </button>
            </div>
          </div>
        )}

        {step === "blocked" && (
          <div className="text-center">
            <h1 className="font-display text-2xl mb-3">This platform isn't for you — yet.</h1>
            <p className="text-sm mb-8" style={{ color: "#8B93A0" }}>
              You must be 18 or older to use Arrangement. Please come back once you turn 18.
            </p>
            <a
              href="https://www.google.com"
              className="inline-block py-3 px-6 rounded-lg text-sm font-semibold"
              style={{ background: "#B8935A", color: "#12151A" }}
            >
              Exit
            </a>
          </div>
        )}

        {step === "role" && (
          <div>
            <h1 className="font-display text-2xl mb-2 text-center">How would you like to join?</h1>
            <p className="text-sm text-center mb-8" style={{ color: "#8B93A0" }}>
              This determines what your profile emphasizes — you can't switch roles later.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setRole("SPONSOR");
                  setStep("form");
                }}
                className="text-left p-5 rounded-xl border transition-colors"
                style={{ borderColor: "#2E3640", background: "#1B2027" }}
              >
                <div className="font-display text-lg mb-1">Mature Sponsor</div>
                <div className="text-sm" style={{ color: "#8B93A0" }}>
                  Established, offering support and companionship.
                </div>
              </button>
              <button
                onClick={() => {
                  setRole("PARTNER");
                  setStep("form");
                }}
                className="text-left p-5 rounded-xl border transition-colors"
                style={{ borderColor: "#2E3640", background: "#1B2027" }}
              >
                <div className="font-display text-lg mb-1">Younger Partner</div>
                <div className="text-sm" style={{ color: "#8B93A0" }}>
                  Seeking mentorship, travel, and genuine connection.
                </div>
              </button>
            </div>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep("role")}
              className="text-xs mb-2"
              style={{ color: "#8B93A0" }}
            >
              ← Change role
            </button>
            <h1 className="font-display text-2xl mb-4">
              Join as {role === "SPONSOR" ? "a Sponsor" : "a Partner"}
            </h1>

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
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
                style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
              />
              <p className="text-xs mt-1" style={{ color: "#8B93A0" }}>At least 10 characters.</p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
                Date of birth
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
                style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
              />
              <p className="text-xs mt-1" style={{ color: "#8B93A0" }}>
                You must be 18 or older to register.
              </p>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
                Phone number
              </label>
              <input
                type="tel"
                required
                placeholder="2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
                style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
              />
              <p className="text-xs mt-1" style={{ color: "#8B93A0" }}>
                Used for M-Pesa payments and, for premium members, WhatsApp contact.
              </p>
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
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-xs text-center" style={{ color: "#8B93A0" }}>
              Already have an account?{" "}
              <a href="/login" className="underline" style={{ color: "#B8935A" }}>
                Log in
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
