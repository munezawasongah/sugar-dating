"use client";

import { useEffect, useState, useRef } from "react";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [goals, setGoals] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [hairColor, setHairColor] = useState("");
  const [eyeColor, setEyeColor] = useState("");
  const [drinkingStatus, setDrinkingStatus] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [occupation, setOccupation] = useState("");
  const [nationality, setNationality] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [residentialArea, setResidentialArea] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setAvatarDataUrl(data.profile.avatarDataUrl ?? null);
          setHeightCm(data.profile.heightCm?.toString() ?? "");
          setWeightKg(data.profile.weightKg?.toString() ?? "");
          setHairColor(data.profile.hairColor ?? "");
          setEyeColor(data.profile.eyeColor ?? "");
          setDrinkingStatus(data.profile.drinkingStatus ?? "");
          setSmokingStatus(data.profile.smokingStatus ?? "");
          setOccupation(data.profile.occupation ?? "");
          setNationality(data.profile.nationality ?? "");
          setEthnicity(data.profile.ethnicity ?? "");
          setHobbies((data.profile.hobbies ?? []).join(", "));
          setResidentialArea(data.profile.residentialArea ?? "");
        }
      });
  }, []);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Image is too large — please use one under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploadingAvatar(true);
      try {
        const res = await fetch("/api/profile/avatar", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAvatarError(data.error || "Upload failed.");
          return;
        }
        setAvatarDataUrl(data.avatarDataUrl);
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function removeAvatar() {
    setUploadingAvatar(true);
    try {
      await fetch("/api/profile/avatar", { method: "DELETE" });
      setAvatarDataUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  }

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
        heightCm: heightCm || null,
        weightKg: weightKg || null,
        hairColor,
        eyeColor,
        drinkingStatus,
        smokingStatus,
        occupation,
        nationality,
        ethnicity,
        hobbies: hobbies.split(",").map((h) => h.trim()).filter(Boolean),
        residentialArea,
      }),
    });
    setSaved(true);
  }

  return (
    <>
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
          {me.verificationStatus === "VERIFIED" ? "✓ Age confirmed (18+)" : `Verification: ${me.verificationStatus?.toLowerCase()}`}
        </div>
      )}

      <div className="flex items-center gap-5 mb-8">
        <div
          className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0"
          style={{
            background: avatarDataUrl ? undefined : "linear-gradient(150deg, #2b3542, #161a20)",
            border: "1px solid #2E3640",
          }}
        >
          {avatarDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarDataUrl} alt="Profile picture" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="text-xs px-4 py-2 rounded-lg font-semibold"
              style={{ background: "#B8935A", color: "#12151A" }}
            >
              {uploadingAvatar ? "Uploading…" : avatarDataUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarDataUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={uploadingAvatar}
                className="text-xs px-4 py-2 rounded-lg"
                style={{ border: "1px solid #2E3640", color: "#8B93A0" }}
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: "#8B93A0" }}>JPG or PNG, under 2MB.</p>
          {avatarError && <p className="text-xs mt-1" style={{ color: "#B4756B" }}>{avatarError}</p>}
        </div>
      </div>

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
            Current area of residence
          </label>
          <input
            value={residentialArea}
            onChange={(e) => setResidentialArea(e.target.value)}
            placeholder="e.g. Kilimani, Nairobi"
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Hair colour</label>
            <input
              value={hairColor}
              onChange={(e) => setHairColor(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Eye colour</label>
            <input
              value={eyeColor}
              onChange={(e) => setEyeColor(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Drinking</label>
            <select
              value={drinkingStatus}
              onChange={(e) => setDrinkingStatus(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            >
              <option value="">Prefer not to say</option>
              <option value="Never">Never</option>
              <option value="Socially">Socially</option>
              <option value="Regularly">Regularly</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Smoking</label>
            <select
              value={smokingStatus}
              onChange={(e) => setSmokingStatus(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            >
              <option value="">Prefer not to say</option>
              <option value="Never">Never</option>
              <option value="Occasionally">Occasionally</option>
              <option value="Regularly">Regularly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Occupation</label>
          <input
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Nationality</label>
            <input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>Ethnicity</label>
            <input
              value={ethnicity}
              onChange={(e) => setEthnicity(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
              style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
            Hobbies (comma separated)
          </label>
          <input
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            placeholder="Hiking, Cooking, Photography"
            className="w-full mt-1 px-4 py-3 rounded-lg text-sm"
            style={{ background: "#1B2027", border: "1px solid #2E3640", color: "#EDEAE2" }}
          />
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
    <Footer />
    </>
  );
}
