import Footer from "@/components/Footer";

export default function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 w-full px-8 md:px-16 py-12 max-w-3xl">
        <a href="/" className="text-xs mb-8 inline-block" style={{ color: "#8B93A0" }}>
          ← Back to Arrangement
        </a>
        <h1 className="font-display text-3xl mb-2">{title}</h1>
        <p className="text-xs mb-10" style={{ color: "#8B93A0" }}>
          Last updated: August 2026 · Draft — pending legal review
        </p>
        <div className="space-y-6 text-sm leading-relaxed" style={{ color: "#c9c5bb" }}>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
