"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [goals, setGoals] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        if (data.profile) {
          setDisplayName(data.profile.displayName ?? "");
          setBio(data.profile.bio ?? "");
          setCity(data.profile.city ?? "");
          setCountry(data.profile.country ?? "");
          setGoals((data.profile.relationshipGoals ?? []).join(", "));
          setVisibility(data.profile.visibility ?? "PUBLIC");
        }
      });
  }, []);

  async function save() {
    setSaved(false);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        bio,
        city,
        country,
        relationshipGoals: goals.split(",").map((g) => g.trim()).filter(Boolean),
        visibility,
      }),
    });
    setSaved(true);
  }

  return (
    <main className="w-full px-8 md:px-16">
      <TopNav />
      <div className="max-w-3xl">
      <h1 className="font-display text-2xl mb-2">Your Profile</h1>

      {me && (
        <div
          className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full text-xs"
          style={
            me.verificationStatus === "VERIFIED"
              ? { background: "rgba(124,149,131,0.1)", border: "1px solid rgba(124,149,131,0.35)", color: "#7C9583" }
              : { background: "rgba(184,147,90,0.1)", border: "1px solid rgba(184,147,90,0.35)", color: "#B8935A" }
          }
        >
          {me.verificationStatus === "VERIFIED" ? "✓ ID verified" : `Verification: ${me.verificationStatus?.toLowerCase()}`}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Country</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
            Looking for (comma separated)
          </label>
          <input
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Travel companion, Long-term, Mentorship"
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          >
            <option value="PUBLIC">Public — visible in Discover</option>
            <option value="INCOGNITO">Incognito — browse without appearing in "viewed me"</option>
            <option value="STEALTH">Stealth — hidden from Discover entirely</option>
          </select>
        </div>

        <button
          onClick={save}
          className="px-6 py-3 rounded-lg text-sm font-semibold"
          style={{ background: "#B8935A", color: "#12151A" }}
        >
          Save profile
        </button>
        {saved && <span className="ml-3 text-sm" style={{ color: "#7C9583" }}>Saved.</span>}
      </div>
      </div>
    </main>
  );
}
