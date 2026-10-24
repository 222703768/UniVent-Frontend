import { GraduationCap } from "lucide-react";

/** Shared full-page layout for recovery screens (404, 403). */
export default function StatusPage({ code, title, message, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f6f4] px-5 py-12 text-slate-950">
      <section aria-labelledby="status-title" className="w-full max-w-md text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-900 text-white">
          <GraduationCap size={24} aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[#0072bc]">Error {code}</p>
        <h1 id="status-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
      </section>
    </main>
  );
}

export const primaryAction =
  "rounded-lg bg-[#0072bc] px-6 py-3 font-semibold text-white hover:bg-[#005f9e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc]";
export const secondaryAction =
  "rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0072bc]";