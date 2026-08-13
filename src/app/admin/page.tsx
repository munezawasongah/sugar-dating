"use client";

import { useEffect, useState } from "react";

interface Report {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reportedBy: { email: string };
  reportedUser: { email: string; isSuspended: boolean; profile: { displayName: string } | null };
}

interface FlaggedMessage {
  id: string;
  body: string | null;
  flagReason: string | null;
  createdAt: string;
  sender: { email: string };
}

export default function AdminPage() {
  const [me, setMe] = useState<any>(null);
  const [checked, setChecked] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [flagged, setFlagged] = useState<FlaggedMessage[]>([]);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setMe(data);
        setChecked(true);
      });
  }, []);

  useEffect(() => {
    if (me?.role === "ADMIN" || me?.role === "MODERATOR") {
      fetch("/api/admin/reports").then((r) => r.json()).then((d) => setReports(d.reports || []));
      fetch("/api/admin/messages").then((r) => r.json()).then((d) => setFlagged(d.messages || []));
    }
  }, [me]);

  async function actOnReport(reportId: string, action: string) {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action }),
    });
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  }

  async function clearFlag(messageId: string) {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    setFlagged((prev) => prev.filter((m) => m.id !== messageId));
  }

  if (!checked) return null;

  if (!me || (me.role !== "ADMIN" && me.role !== "MODERATOR")) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-xl mb-2">Not authorized</h1>
          <p className="text-sm" style={{ color: "#8B93A0" }}>
            This page is only visible to admin accounts.
          </p>
        </div>
      </main>
    );
  }

  const underage = reports.filter((r) => r.reason === "UNDERAGE_SUSPECTED");
  const others = reports.filter((r) => r.reason !== "UNDERAGE_SUSPECTED");

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl mb-8">Admin — Trust & Safety</h1>

      {underage.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm uppercase tracking-wide mb-3" style={{ color: "#B4756B" }}>
            Underage suspicion — priority review ({underage.length})
          </h2>
          <div className="space-y-3">
            {underage.map((r) => (
              <div key={r.id} className="p-4 rounded-xl" style={{ background: "rgba(180,117,107,0.08)", border: "1px solid rgba(180,117,107,0.4)" }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-display text-sm">{r.reportedUser.profile?.displayName ?? r.reportedUser.email}</div>
                    <div className="text-xs" style={{ color: "#8B93A0" }}>
                      Reported by {r.reportedBy.email} · Account currently {r.reportedUser.isSuspended ? "suspended" : "active"}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-1 rounded-full" style={{ background: "#B4756B", color: "#12151A" }}>
                    {r.status}
                  </span>
                </div>
                {r.details && <p className="text-sm mb-3" style={{ color: "#c9c5bb" }}>{r.details}</p>}
                <div className="flex gap-2">
                  <button onClick={() => actOnReport(r.id, "SUSPEND_USER")} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "#B4756B", color: "#12151A" }}>
                    Confirm suspension
                  </button>
                  <button onClick={() => actOnReport(r.id, "DISMISS")} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid #2E3640", color: "#8B93A0" }}>
                    Dismiss (false report)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-sm uppercase tracking-wide mb-3" style={{ color: "#8B93A0" }}>
          Other open reports ({others.length})
        </h2>
        {others.length === 0 && <p className="text-sm" style={{ color: "#8B93A0" }}>Nothing pending.</p>}
        <div className="space-y-3">
          {others.map((r) => (
            <div key={r.id} className="p-4 rounded-xl" style={{ background: "#1B2027", border: "1px solid #2E3640" }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-display text-sm">{r.reportedUser.profile?.displayName ?? r.reportedUser.email}</div>
                  <div className="text-xs" style={{ color: "#8B93A0" }}>
                    {r.reason} · Reported by {r.reportedBy.email}
                  </div>
                </div>
              </div>
              {r.details && <p className="text-sm mb-3" style={{ color: "#c9c5bb" }}>{r.details}</p>}
              <div className="flex gap-2">
                <button onClick={() => actOnReport(r.id, "SUSPEND_USER")} className="text-xs px-3 py-1.5 rounded-lg font-semibold" style={{ background: "#B8935A", color: "#12151A" }}>
                  Suspend user
                </button>
                <button onClick={() => actOnReport(r.id, "MARK_ACTIONED")} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid #2E3640", color: "#8B93A0" }}>
                  Mark actioned
                </button>
                <button onClick={() => actOnReport(r.id, "DISMISS")} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid #2E3640", color: "#8B93A0" }}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide mb-3" style={{ color: "#8B93A0" }}>
          Flagged messages ({flagged.length})
        </h2>
        {flagged.length === 0 && <p className="text-sm" style={{ color: "#8B93A0" }}>Nothing flagged right now.</p>}
        <div className="space-y-3">
          {flagged.map((m) => (
            <div key={m.id} className="p-4 rounded-xl" style={{ background: "#1B2027", border: "1px solid #2E3640" }}>
              <div className="text-xs mb-1" style={{ color: "#8B93A0" }}>From {m.sender.email}</div>
              <div className="text-sm mb-2">{m.body}</div>
              <div className="text-xs mb-3" style={{ color: "#B8935A" }}>{m.flagReason}</div>
              <button onClick={() => clearFlag(m.id)} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: "1px solid #2E3640", color: "#8B93A0" }}>
                Clear flag
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
