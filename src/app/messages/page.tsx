"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

interface ConversationSummary {
  id: string;
  otherUser: { id: string; displayName: string; verificationStatus: string; phone: string | null };
  lastMessage: string | null;
}

interface Message {
  id: string;
  senderId: string;
  body: string | null;
  mediaKey: string | null;
  mediaType: string | null;
  flaggedForReview: boolean;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric" });
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserId(data.id ?? null);
        setMe(data);
      });
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations || []);
        if (data.conversations?.[0]) setActiveId(data.conversations[0].id);
      });
  }, []);

  const loadMessages = useCallback((id: string) => {
    fetch(`/api/conversations/${id}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);

    // Lightweight polling so a thread feels live without full websocket wiring.
    const interval = setInterval(() => loadMessages(activeId), 4000);
    return () => clearInterval(interval);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) {
      setWarning("Image is too large — please use one under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    if ((!draft.trim() && !pendingImage) || !activeId || sending) return;
    setWarning(null);
    setSending(true);
    const body = draft;
    const mediaKey = pendingImage;
    setDraft("");
    setPendingImage(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          body: body || undefined,
          mediaKey: mediaKey || undefined,
          mediaType: mediaKey ? "image" : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        if (data.safetyWarning) setWarning(data.safetyWarning);
      } else {
        setWarning(data.error || "Message failed to send.");
      }
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(messageId: string) {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await fetch(`/api/messages/${messageId}`, { method: "DELETE" }).catch(() => {});
  }

  const activeConvo = conversations.find((c) => c.id === activeId);
  const canUseWhatsApp = me?.role === "ADMIN" || me?.isPremium;

  // Group messages with a date separator whenever the day changes.
  const grouped: { label: string | null; message: Message }[] = [];
  let lastDate = "";
  for (const m of messages) {
    const label = formatDateLabel(m.createdAt);
    if (label !== lastDate) {
      grouped.push({ label, message: m });
      lastDate = label;
    } else {
      grouped.push({ label: null, message: m });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
    <main className="flex-1 w-full px-8 md:px-16">
      <TopNav />
      <h1 className="font-display text-2xl mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <p style={{ color: "#8B93A0" }}>
          No conversations yet — introduce yourself to someone in Discover to start one.
        </p>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden mb-10"
          style={{ borderColor: "#2E3640", background: "#1B2027", height: "70vh", minHeight: 480, display: "grid", gridTemplateColumns: "280px 1fr" }}
        >
          <div style={{ borderRight: "1px solid #2E3640", overflowY: "auto" }}>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className="px-4 py-4 cursor-pointer"
                style={{
                  borderBottom: "1px solid #2E3640",
                  background: c.id === activeId ? "#232A33" : "transparent",
                }}
              >
                <div className="font-display text-sm mb-1">{c.otherUser.displayName}</div>
                <div className="text-xs truncate" style={{ color: "#8B93A0" }}>
                  {c.lastMessage ?? "Say hello…"}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #2E3640" }}>
              <div>
                <div className="font-display text-sm">{activeConvo?.otherUser.displayName}</div>
                <div className="text-xs" style={{ color: "#7C9583" }}>
                  {activeConvo?.otherUser.verificationStatus === "VERIFIED" ? "Age confirmed (18+)" : "Verification pending"}
                </div>
              </div>
              {canUseWhatsApp && activeConvo?.otherUser.phone && (
                <a
                  href={`https://wa.me/${activeConvo.otherUser.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    "Hi, I'd like to connect — reaching out from Arrangement."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5"
                  style={{ background: "#25D366", color: "#12151A" }}
                >
                  WhatsApp
                </a>
              )}
            </div>

            <div className="flex-1 px-5 py-5 overflow-y-auto flex flex-col gap-2">
              {grouped.map(({ label, message: m }) => (
                <div key={m.id} className="flex flex-col group">
                  {label && (
                    <div className="text-center text-[11px] my-3" style={{ color: "#8B93A0" }}>
                      {label}
                    </div>
                  )}
                  <div
                    className="max-w-[70%] rounded-2xl text-sm overflow-hidden relative"
                    style={{
                      alignSelf: m.senderId === currentUserId ? "flex-end" : "flex-start",
                      background: m.senderId === currentUserId ? "#B8935A" : "#232A33",
                      color: m.senderId === currentUserId ? "#12151A" : "#EDEAE2",
                    }}
                  >
                    {m.mediaKey && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.mediaKey} alt="Shared photo" className="w-full max-h-72 object-cover" />
                    )}
                    {m.body && (
                      <div className={`px-4 py-2.5 ${m.senderId === currentUserId ? "font-medium" : ""}`}>
                        {m.body}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-[10px] mt-1 flex items-center gap-2"
                    style={{
                      alignSelf: m.senderId === currentUserId ? "flex-end" : "flex-start",
                      color: "#8B93A0",
                    }}
                  >
                    {formatTime(m.createdAt)}
                    {(m.senderId === currentUserId || me?.role === "ADMIN") && (
                      <button
                        onClick={() => deleteMessage(m.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#B4756B" }}
                        title="Delete message"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {warning && (
                <div className="max-w-[80%] px-4 py-3 rounded-xl text-xs" style={{ background: "rgba(180,117,107,0.1)", border: "1px solid rgba(180,117,107,0.4)", color: "#B4756B" }}>
                  {warning}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {pendingImage && (
              <div className="px-4 pb-2 flex items-center gap-2">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pendingImage} alt="Attachment preview" className="h-16 w-16 object-cover rounded-lg" style={{ border: "1px solid #2E3640" }} />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                    style={{ background: "#B4756B", color: "#12151A" }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="px-4 py-3 flex gap-2" style={{ borderTop: "1px solid #2E3640" }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 rounded-lg text-sm"
                style={{ border: "1px solid #2E3640", color: "#8B93A0" }}
                title="Attach a photo"
              >
                📷
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Write a message…"
                className="flex-1 px-4 py-2.5 rounded-lg text-sm"
                style={{ background: "#232A33", border: "1px solid #2E3640", color: "#EDEAE2" }}
              />
              <button
                onClick={sendMessage}
                disabled={sending}
                className="px-5 rounded-lg text-sm font-semibold"
                style={{ background: "#B8935A", color: "#12151A" }}
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
    <Footer />
    </div>
  );
}
