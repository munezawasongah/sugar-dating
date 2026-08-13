import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arrangement",
  description: "A platform for consenting adults to connect.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
