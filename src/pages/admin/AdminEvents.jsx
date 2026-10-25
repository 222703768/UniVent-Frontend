import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, CircleAlert, Search, ShieldCheck } from "lucide-react";
import { disableEvent, approveEvent } from "../../api/events";
import StatusBadge from "../../components/shared/StatusBadge";
import { formatDate } from "../../lib/format";
import { getAdminEvents as fetchAdminEvents } from "../../api/admin";

const asList = (data) => Array.isArray(data) ? data : data?.content ?? data?.events ?? [];

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadEvents = useCallback(async (filter = status) => {
    setLoading(true); setError("");
    try { setEvents(asList(await fetchAdminEvents(filter))); }
    catch (requestError) { setError(requestError.response?.data?.message || "Events could not be loaded."); }
    finally { setLoading(false); }
  }, [status]);
  useEffect(() => {
    // Loading the selected status keeps this screen in sync with the admin API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEvents();
  }, [loadEvents]);

  const visibleEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => !term || [event.title, event.organizerName, event.organizer?.name, event.venueName].some((value) => String(value ?? "").toLowerCase().includes(term)));
  }, [events, query]);

  const runAction = async (event, action) => {
    setBusyId(event.id); setError("");
    try { await action(event.id); await loadEvents(); }
    catch (requestError) { setError(requestError.response?.data?.message || "The event could not be updated."); }
    finally { setBusyId(null); }
  };

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f7f7f8] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-slate-500">Administration · ICT Services</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Event management</h1><p className="mt-2 text-slate-600">Review, approve, and manage university events.</p></div><div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"><span className="font-semibold text-slate-950">{loading ? "…" : visibleEvents.length}</span> event{visibleEvents.length === 1 ? "" : "s"}</div></header>

        {error && <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"><CircleAlert size={18} />{error}<button onClick={() => loadEvents()} className="ml-auto font-semibold underline">Retry</button></div>}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block md:w-80"><span className="sr-only">Search events</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events…" className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" /></label>
            <label className="flex items-center gap-2 text-sm text-slate-600">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 font-medium text-slate-900 outline-none focus:border-sky-600"><option value="ALL">All statuses</option><option value="PENDING_APPROVAL">Awaiting approval</option><option value="APPROVED">Approved</option><option value="DISABLED">Disabled</option></select></label>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead><tr className="border-y border-slate-100 text-xs uppercase tracking-wide text-slate-500"><th className="px-3 py-3 font-semibold">Event</th><th className="px-3 py-3 font-semibold">Organizer</th><th className="px-3 py-3 font-semibold">Category</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Venue</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-3 py-3 font-semibold">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && visibleEvents.map((event) => { const pending = ["PENDING", "PENDING_APPROVAL"].includes(event.status); const disabled = event.status === "DISABLED"; return <tr key={event.id} className="hover:bg-slate-50"><td className="px-3 py-4"><div className="font-semibold text-slate-900">{event.title}</div><div className="mt-1 max-w-56 truncate text-xs text-slate-500">{event.description}</div></td><td className="px-3 py-4">{event.organizerName ?? event.organizer?.name ?? "—"}</td><td className="px-3 py-4">{event.category ?? "—"}</td><td className="px-3 py-4">{formatDate(event.dateTime) || "—"}</td><td className="px-3 py-4">{event.venueName ?? event.venue?.name ?? "—"}</td><td className="px-3 py-4"><StatusBadge status={event.status} className="text-xs" /></td><td className="px-3 py-4"><div className="flex items-center gap-2">{pending && <button disabled={busyId === event.id} onClick={() => runAction(event, approveEvent)} className="inline-flex items-center gap-1 rounded-md bg-sky-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"><ShieldCheck size={14} />Approve</button>}{!disabled && <button disabled={busyId === event.id} onClick={() => runAction(event, disableEvent)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Disable</button>}</div></td></tr>; })}
                {loading && <tr><td colSpan="7" className="px-3 py-16 text-center text-slate-500"><CalendarDays className="mx-auto mb-3" />Loading events…</td></tr>}
                {!loading && visibleEvents.length === 0 && <tr><td colSpan="7" className="px-3 py-16 text-center text-slate-500"><CalendarDays className="mx-auto mb-3" />{query ? "No events match this search." : "No events found for this status."}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
