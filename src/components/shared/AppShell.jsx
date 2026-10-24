import Navbar from "./Navbar";

/** Page layout for authenticated screens: shared Navbar, content, footer. */
export default function AppShell({ children, unreadOverride }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f4] text-slate-950">
      <Navbar unreadOverride={unreadOverride} />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-5 py-5 text-sm text-slate-500 sm:px-8">
          <span>© 2026 UniVent · University Event Management System</span>
          <span>Support: ictservices@univent.ac.za · ext. 4120</span>
        </div>
      </footer>
    </div>
  );
}