"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BackButton from "@/components/BackButton";

const baseTabs = [
  { href: "/discover", label: "Discover" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Profile" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.role === "ADMIN"))
      .catch(() => {});
  }, []);

  const tabs = isAdmin ? [...baseTabs, { href: "/admin", label: "Admin" }] : baseTabs;

  return (
    <header className="flex items-center justify-between py-6 border-b mb-10" style={{ borderColor: "#2E3640" }}>
      <div className="flex items-center gap-3">
        <BackButton fallbackHref="/discover" />
        <Link href="/discover" className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#B8935A" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="14" stroke="#B8935A" strokeWidth="1" />
            <circle cx="20" cy="20" r="3" fill="#B8935A" />
          </svg>
          <span className="font-display text-lg">Arrangement</span>
        </Link>
      </div>
      <nav className="flex gap-1 p-1 rounded-full border" style={{ background: "#1B2027", borderColor: "#2E3640" }}>
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="px-5 py-2 rounded-full text-sm transition-colors"
              style={
                active
                  ? { background: "#B8935A", color: "#12151A", fontWeight: 600 }
                  : { color: "#8B93A0" }
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
