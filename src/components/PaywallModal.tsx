"use client";

import { useState } from "react";

export default function PaywallModal({
  onClose,
  onPaid,
  defaultPhone,
}: {
  onClose: () => void;
  onPaid: () => void;
  defaultPhone?: string;
}) {
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function pay() {
    setStatus("pending");
    setMessage(null);
    try {
      const res = await fetch("/api/payments/contact-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Payment failed.");
        return;
      }
      setMessage(data.message);
      if (data.status === "COMPLETED") {
        setTimeout(onPaid, 900);
      } else {
        setStatus("idle");
      }
    } catch {
      setStatus("error");
      setMessage("Network error — please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center px-6 z-50"
      style={{ background: "rgba(18,21,26,0.8)" }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#1B2027", border: "1px solid #2E3640" }}>
        <h2 className="font-display text-xl mb-2">One-off contact fee</h2>
        <p className="text-sm mb-5" style={{ color: "#8B93A0" }}>
          A one-time KES 2,000 fee unlocks messaging with other members. Premium members skip this
          entirely.
        </p>

        <label className="text-xs uppercase tracking-wide" style={{ color: "#8B93A0" }}>
          M-Pesa phone number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="2547XXXXXXXX"
          className="w-full mt-1 mb-4 px-4 py-3 rounded-lg text-sm"
          style={{ background: "#232A33", border: "1px solid #2E3640", color: "#EDEAE2" }}
        />

        {message && (
          <div
            className="text-xs px-3 py-2 rounded-lg mb-4"
            style={{
              background: status === "error" ? "rgba(180,117,107,0.1)" : "rgba(124,149,131,0.1)",
              border: `1px solid ${status === "error" ? "rgba(180,117,107,0.4)" : "rgba(124,149,131,0.35)"}`,
              color: status === "error" ? "#B4756B" : "#7C9583",
            }}
          >
            {message}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={pay}
            disabled={status === "pending" || !phone}
            className="flex-1 py-3 rounded-lg text-sm font-semibold"
            style={{ background: "#B8935A", color: "#12151A" }}
          >
            {status === "pending" ? "Processing…" : "Pay KES 2,000"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg text-sm"
            style={{ border: "1px solid #2E3640", color: "#8B93A0" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
