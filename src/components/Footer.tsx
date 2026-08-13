export default function Footer() {
  return (
    <footer className="w-full px-8 md:px-16 py-10 mt-16" style={{ borderTop: "1px solid #2E3640" }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs" style={{ color: "#8B93A0" }}>
          © {new Date().getFullYear()} Jatelo Technologies Limited. All rights reserved.
        </p>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          <a href="/privacy" className="hover:underline" style={{ color: "#8B93A0" }}>
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline" style={{ color: "#8B93A0" }}>
            Terms of Use
          </a>
          <a href="/safety" className="hover:underline" style={{ color: "#8B93A0" }}>
            Safety Policy
          </a>
        </nav>
      </div>
    </footer>
  );
}
