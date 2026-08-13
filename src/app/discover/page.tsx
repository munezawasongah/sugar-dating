"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";

interface Candidate {
  id: string;
  dateOfBirth: string;
  profile: {
    displayName: string;
    city: string | null;
    country: string | null;
    relationshipGoals: string[];
    visibility: string;
  } | null;
}

function calcAge(dob: string) {
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export default function DiscoverPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioned, setActioned] = useState<Record<string, "passed" | "introduced">>({});

  useEffect(() => {
    fetch("/api/discover")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setCandidates(data.candidates || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function introduce(id: string) {
    setActioned((prev) => ({ ...prev, [id]: "introduced" }));
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: id }),
    }).catch(() => {
      // revert on failure
      setActioned((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });
  }

  function pass(id: string) {
    setActioned((prev) => ({ ...prev, [id]: "passed" }));
  }

  return (
    <main className="w-full px-8 md:px-16">
      <TopNav />

      <h1 className="font-display text-2xl mb-6">Discover</h1>

      {loading && <p style={{ color: "#8B93A0" }}>Loading profiles…</p>}

      {error && (
        <div className="text-sm px-4 py-3 rounded-lg mb-6" style={{ background: "rgba(180,117,107,0.1)", border: "1px solid rgba(180,117,107,0.4)", color: "#B4756B" }}>
          {error === "Complete ID verification to browse profiles."
            ? "You'll need to complete ID verification before you can browse profiles."
            : error}
        </div>
      )}

      {!loading && !error && candidates.length === 0 && (
        <p style={{ color: "#8B93A0" }}>No matches yet — check back soon as more people join.</p>
      )}

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
        {candidates
          .filter((c) => actioned[c.id] !== "passed")
          .map((c) => (
            <div key={c.id} className="rounded-2xl overflow-hidden border" style={{ background: "#1B2027", borderColor: "#2E3640" }}>
              <div
                className="h-56 relative flex items-end p-3"
                style={{ background: "linear-gradient(150deg, #2b3542, #161a20)" }}
              >
                {c.profile?.visibility === "INCOGNITO" && (
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full" style={{ background: "rgba(18,21,26,0.75)", border: "1px solid #2E3640", color: "#8B93A0" }}>
                    Incognito
                  </span>
                )}
                <svg width="26" height="26" viewBox="0 0 40 40" fill="none" className="absolute top-3 right-3">
                  <circle cx="20" cy="20" r="19" stroke="#7C9583" strokeWidth="1.2" />
                  <circle cx="20" cy="20" r="14" stroke="#7C9583" strokeWidth="1" />
                  <circle cx="20" cy="20" r="3" fill="#7C9583" />
                </svg>
              </div>
              <div className="p-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-display text-base">{c.profile?.displayName ?? "Member"}</span>
                  <span className="text-sm" style={{ color: "#8B93A0" }}>{calcAge(c.dateOfBirth)}</span>
                </div>
                <div className="text-xs mb-3" style={{ color: "#8B93A0" }}>
                  {[c.profile?.city, c.profile?.country].filter(Boolean).join(", ") || "Location private"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(c.profile?.relationshipGoals ?? []).slice(0, 2).map((g) => (
                    <span key={g} className="text-[11px] px-2.5 py-1 rounded-full" style={{ color: "#7C9583", border: "1px solid rgba(124,149,131,0.35)" }}>
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex border-t" style={{ borderColor: "#2E3640" }}>
                <button onClick={() => pass(c.id)} className="flex-1 py-3 text-sm" style={{ color: "#8B93A0", borderRight: "1px solid #2E3640" }}>
                  Pass
                </button>
                <button
                  onClick={() => introduce(c.id)}
                  disabled={!!actioned[c.id]}
                  className="flex-1 py-3 text-sm"
                  style={{ color: actioned[c.id] === "introduced" ? "#7C9583" : "#B8935A" }}
                >
                  {actioned[c.id] === "introduced" ? "Introduced ✓" : "Introduce"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}
