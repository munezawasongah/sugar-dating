"use client";

import { useEffect, useState, useRef } from "react";
import TopNav from "@/components/TopNav";

interface ConversationSummary {
  id: string;
  otherUser: { id: string; displayName: string; verificationStatus: string };
  lastMessage: string | null;
}

interface Message {
  id: string;
  senderId: string;
  body: string | null;
  flaggedForReview: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id ?? null));
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.conversations || []);
        if (data.conversations?.[0]) setActiveId(data.conversations[0].id);
      });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/conversations/${activeId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!draft.trim() || !activeId) return;
    setWarning(null);
    const body = draft;
    setDraft("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: activeId, body }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((prev) => [...prev, data.message]);
      if (data.safetyWarning) setWarning(data.safetyWarning);
    }
  }

  const activeConvo = conversations.find((c) => c.id === activeId);

  return (
    <main className="max-w-6xl mx-auto px-6">
      <TopNav />
      <h1 className="font-display text-2xl mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <p style={{ color: "#8B93A0" }}>
          No conversations yet — introduce yourself to someone in Discover to start one.
        </p>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#2E3640", background: "#1B2027", height: 560, display: "grid", gridTemplateColumns: "260px 1fr" }}>
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

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #2E3640" }}>
              <div>
                <div className="font-display text-sm">{activeConvo?.otherUser.displayName}</div>
                <div className="text-xs" style={{ color: "#7C9583" }}>
                  {activeConvo?.otherUser.verificationStatus === "VERIFIED" ? "ID verified" : "Verification pending"}
                </div>
              </div>
            </div>

            <div className="flex-1 px-5 py-5 overflow-y-auto flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm"
                  style={
                    m.senderId === currentUserId
                      ? { background: "#B8935A", color: "#12151A", alignSelf: "flex-end", fontWeight: 500 }
                      : { background: "#232A33", alignSelf: "flex-start" }
                  }
                >
                  {m.body}
                </div>
              ))}
              {warning && (
                <div className="max-w-[80%] px-4 py-3 rounded-xl text-xs" style={{ background: "rgba(180,117,107,0.1)", border: "1px solid rgba(180,117,107,0.4)", color: "#B4756B" }}>
                  {warning}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 flex gap-2" style={{ borderTop: "1px solid #2E3640" }}>
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
                className="px-5 rounded-lg text-sm font-semibold"
                style={{ background: "#B8935A", color: "#12151A" }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
