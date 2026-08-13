import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center gap-2 mb-8">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke="#B8935A" strokeWidth="1.2" />
            <circle cx="20" cy="20" r="14" stroke="#B8935A" strokeWidth="1" />
            <circle cx="20" cy="20" r="3" fill="#B8935A" />
          </svg>
          <span className="font-display text-2xl">Arrangement</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl max-w-xl mb-4">
          A quieter way to meet someone worth knowing.
        </h1>
        <p className="text-sm max-w-md mb-10" style={{ color: "#8B93A0" }}>
          ID-verified members only. Discreet by design.
        </p>
        <div className="flex gap-3">
          <a
            href="/signup"
            className="px-7 py-3 rounded-lg text-sm font-semibold"
            style={{ background: "#B8935A", color: "#12151A" }}
          >
            Create account
          </a>
          <a
            href="/login"
            className="px-7 py-3 rounded-lg text-sm font-semibold border"
            style={{ borderColor: "#2E3640", color: "#EDEAE2" }}
          >
            Log in
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
